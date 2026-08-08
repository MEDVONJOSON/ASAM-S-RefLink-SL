import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import {
  createSession,
  findUserByIdentifier,
  createOtp,
  verifyOtp,
  maskPhone,
  SESSION_COOKIE,
  toSafeUser,
} from "@/lib/auth"
import { verifyPassword } from "@/lib/crypto"

/* ─── Step 1: Identify the user ─── */
const identifySchema = z.object({
  identifier: z.string().min(3),
})

/* ─── Step 2: Complete login with OTP or password ─── */
const completeSchema = z.object({
  identifier: z.string().min(3),
  otpCode: z.string().optional(),
  password: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null)
    if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

    // Step 2: Complete login (has otpCode or password)
    if (body.otpCode || body.password) {
      return await completeLogin(body)
    }

    // Step 1: Identify user and determine login method
    return await identifyUser(body)
  } catch (error: any) {
    console.error("Login Error:", error)
    return NextResponse.json({ error: error.message || "Internal Server Error", stack: error.stack }, { status: 500 })
  }
}

async function identifyUser(body: unknown) {
  const parsed = identifySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const user = await findUserByIdentifier(parsed.data.identifier)
  if (!user) {
    return NextResponse.json({ error: "No account found with that identifier" }, { status: 404 })
  }

  // Admin → redirect to admin login
  if (user.role === "admin") {
    return NextResponse.json({
      step: "redirect",
      redirectTo: "/admin/login",
      message: "Please use the admin login page",
    })
  }

  // Referrer / Client → log in directly (OTP bypassed for dev)
  if ((user.role === "referrer" || user.role === "client") && user.phone) {
    const token = await createSession(user.id)
    const c = await cookies()
    c.set(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })
    return NextResponse.json({ user: toSafeUser(user) })
  }

  // Business → if they have a phone, log in directly (OTP bypassed for dev)
  if (user.role === "business") {
    if (user.phone) {
      const token = await createSession(user.id)
      const c = await cookies()
      c.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
      return NextResponse.json({ user: toSafeUser(user) })
    }
    // Fallback: if business has passwordHash (legacy), allow password
    if (user.passwordHash) {
      return NextResponse.json({
        step: "password",
        role: user.role,
      })
    }
    // No phone, no password — shouldn't happen but handle gracefully
    return NextResponse.json({ error: "Unable to authenticate this account. Contact support." }, { status: 400 })
  }

  return NextResponse.json({ error: "Unable to determine login method" }, { status: 400 })
}

async function completeLogin(body: unknown) {
  const parsed = completeSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  const { identifier, otpCode, password } = parsed.data

  const user = await findUserByIdentifier(identifier)
  if (!user) {
    return NextResponse.json({ error: "No account found" }, { status: 404 })
  }

  // OTP verification
  if (otpCode) {
    if (!user.phone) {
      return NextResponse.json({ error: "No phone number on this account" }, { status: 400 })
    }
    const valid = await verifyOtp(user.phone, otpCode)
    if (!valid) {
      return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
    }
  }
  // Password verification (legacy or admin fallback)
  else if (password) {
    if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }
  } else {
    return NextResponse.json({ error: "OTP or password required" }, { status: 400 })
  }

  const token = await createSession(user.id)
  const c = await cookies()
  c.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
  return NextResponse.json({ user: toSafeUser(user) })
}
