import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import { createSession, findUserByPhoneOrEmail, SESSION_COOKIE, toSafeUser } from "@/lib/auth"
import { verifyPassword } from "@/lib/crypto"

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const user = await findUserByPhoneOrEmail(parsed.data.email)
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
  }

  if (!user.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
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
