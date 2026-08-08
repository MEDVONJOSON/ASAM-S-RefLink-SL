import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import {
  createSession,
  SESSION_COOKIE,
  toSafeUser,
} from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST(req: Request) {
  try {
    const { credential } = await req.json()
    if (!credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 })
    }

    // Verify token with Google
    const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`)
    const payload = await verifyRes.json()

    if (!verifyRes.ok || !payload.sub || payload.aud !== process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
      console.error("Google token verification failed:", payload)
      return NextResponse.json({ error: "Invalid Google token" }, { status: 401 })
    }

    const { sub: googleId, email, name, picture } = payload

    // 1. Check if user already exists with this googleId
    let user = await prisma.user.findUnique({ where: { googleId } })

    if (!user && email) {
      // 2. Check if user exists with this email but no googleId
      user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      })
      if (user) {
        // Link the google account
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId },
        })
      }
    }

    if (user) {
      // User exists — log them in
      const token = await createSession(user.id)
      const c = await cookies()
      c.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      })
      return NextResponse.json({ 
        action: "login", 
        user: toSafeUser(user) 
      })
    }

    // 3. User does not exist — return their info so frontend can redirect to signup
    return NextResponse.json({
      action: "signup",
      googleId,
      email,
      name,
      picture,
    })
  } catch (error: any) {
    console.error("Google Sign-In Error:", error)
    return NextResponse.json({ error: error.message || "Internal server error", stack: error.stack }, { status: 500 })
  }
}
