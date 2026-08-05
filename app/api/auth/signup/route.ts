import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import {
  createSession,
  createUser,
  findUserByPhoneOrEmail,
  verifyOtp,
  generateDefaultName,
  SESSION_COOKIE,
  toSafeUser,
} from "@/lib/auth"
import prisma from "@/lib/db"

/* ─── Referrer signup: phone + ASAM'S code (+ OTP verification) ─── */
const referrerSchema = z.object({
  role: z.literal("referrer"),
  phone: z.string().min(6),
  referCode: z.string().min(1, "ASAM'S registration code is required"),
  otpCode: z.string().optional(),
  name: z.string().optional(),
  googleId: z.string().optional(),
  email: z.string().email().optional(),
})

/* ─── Business signup: email + business name + ASAM'S invite code ─── */
const businessSchema = z.object({
  role: z.literal("business"),
  email: z.string().email("Valid email is required"),
  businessName: z.string().min(2, "Business name is required"),
  businessCode: z.string().min(1, "ASAM'S authorization code is required"),
  name: z.string().optional(),
  phone: z.string().optional(),
  googleId: z.string().optional(),
})

/* ─── Client signup: phone + OTP ─── */
const clientSchema = z.object({
  role: z.literal("client"),
  phone: z.string().min(6),
  otpCode: z.string().optional(),
  name: z.string().optional(),
  googleId: z.string().optional(),
  email: z.string().email().optional(),
})

/* ─── Google Sign-In signup (any role) ─── */
const googleSchema = z.object({
  role: z.enum(["referrer", "business", "client"]),
  googleId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(1),
  // Role-specific optional fields
  phone: z.string().optional(),
  referCode: z.string().optional(),
  businessName: z.string().optional(),
  businessCode: z.string().optional(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  if (!body || !body.role) {
    return NextResponse.json({ error: "Role is required" }, { status: 400 })
  }

  // Google Sign-In flow
  if (body.googleId) {
    return handleGoogleSignup(body)
  }

  switch (body.role) {
    case "referrer":
      return handleReferrerSignup(body)
    case "business":
      return handleBusinessSignup(body)
    case "client":
      return handleClientSignup(body)
    default:
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }
}

async function handleReferrerSignup(body: unknown) {
  const parsed = referrerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input", issues: parsed.error.issues }, { status: 400 })
  }
  const data = parsed.data

  // OTP validation temporarily bypassed for development

  // Check for existing account
  if (await findUserByPhoneOrEmail(data.phone)) {
    return NextResponse.json({ error: "An account with that phone number already exists." }, { status: 409 })
  }

  const userName = data.name || generateDefaultName(data.phone)
  const user = await createUser({
    name: userName,
    phone: data.phone,
    email: data.email,
    role: "referrer",
    registeredReferrerCode: data.referCode,
    orangeMoneyNumber: data.phone,
  })

  return setSessionAndRespond(user)
}

async function handleBusinessSignup(body: unknown) {
  const parsed = businessSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input", issues: parsed.error.issues }, { status: 400 })
  }
  const data = parsed.data

  // Check for existing account
  if (await findUserByPhoneOrEmail(data.email)) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 })
  }

  const userName = data.name || data.businessName
  const user = await createUser({
    name: userName,
    email: data.email,
    phone: data.phone,
    role: "business",
    registeredReferrerCode: data.businessCode,
  })

  // Create the business record
  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      name: data.businessName,
      category: "Other",
      description: "",
      city: "Freetown",
      address: "",
      phone: data.phone || "",
      commissionPct: 10,
      verified: false,
    },
  })

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { businessId: business.id },
  })

  return setSessionAndRespond(updatedUser)
}

async function handleClientSignup(body: unknown) {
  const parsed = clientSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid input", issues: parsed.error.issues }, { status: 400 })
  }
  const data = parsed.data

  // OTP validation temporarily bypassed for development

  // Check for existing account
  if (await findUserByPhoneOrEmail(data.phone)) {
    return NextResponse.json({ error: "An account with that phone number already exists." }, { status: 409 })
  }

  const userName = data.name || generateDefaultName(data.phone)
  const user = await createUser({
    name: userName,
    phone: data.phone,
    email: data.email,
    role: "client",
  })

  return setSessionAndRespond(user)
}

async function handleGoogleSignup(body: unknown) {
  const parsed = googleSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid Google signup data" }, { status: 400 })
  }
  const data = parsed.data

  // Check if Google account already linked
  const existingGoogle = await prisma.user.findUnique({ where: { googleId: data.googleId } })
  if (existingGoogle) {
    // Already registered — just log them in
    return setSessionAndRespond(existingGoogle)
  }

  // Check if email already used
  if (await findUserByPhoneOrEmail(data.email)) {
    return NextResponse.json({ error: "An account with that email already exists. Please log in instead." }, { status: 409 })
  }

  // Role-specific validation
  if (data.role === "referrer" && !data.referCode) {
    return NextResponse.json({ error: "ASAM'S registration code is required for referrers" }, { status: 400 })
  }
  if (data.role === "business" && !data.businessName) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 })
  }
  if (data.role === "business" && !data.businessCode) {
    return NextResponse.json({ error: "ASAM'S authorization code is required for businesses" }, { status: 400 })
  }

  const user = await createUser({
    name: data.name,
    email: data.email,
    phone: data.phone,
    googleId: data.googleId,
    role: data.role,
    registeredReferrerCode: data.role === "business" ? data.businessCode : data.referCode,
  })

  // If business, create business record
  if (data.role === "business" && data.businessName) {
    const business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: data.businessName,
        category: "Other",
        description: "",
        city: "Freetown",
        address: "",
        phone: data.phone || "",
        commissionPct: 10,
        verified: false,
      },
    })
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { businessId: business.id },
    })
    return setSessionAndRespond(updatedUser)
  }

  return setSessionAndRespond(user)
}

async function setSessionAndRespond(user: NonNullable<Awaited<ReturnType<typeof prisma.user.findUnique>>>) {
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
