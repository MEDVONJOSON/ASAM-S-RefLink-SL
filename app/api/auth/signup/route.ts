import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { z } from "zod"
import { createSession, createUser, findUserByPhoneOrEmail, SESSION_COOKIE, toSafeUser } from "@/lib/auth"
import prisma from "@/lib/db"

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  password: z.string().min(4),
  role: z.enum(["business", "referrer", "client"]),
  // Business
  businessName: z.string().optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  commissionPct: z.coerce.number().min(5).max(15).optional(),
  imageUrl: z.string().optional(),
  // Referrer
  orangeMoneyNumber: z.string().optional(),
  registeredReferrerCode: z.string().optional(),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input", issues: parsed.error.issues }, { status: 400 })
  }
  const data = parsed.data

  if ((await findUserByPhoneOrEmail(data.phone)) || (data.email && (await findUserByPhoneOrEmail(data.email)))) {
    return NextResponse.json({ error: "An account with that phone or email already exists." }, { status: 409 })
  }

  if (data.role === "business" && (!data.businessName || !data.category || !data.city)) {
    return NextResponse.json({ error: "Business profile fields are required." }, { status: 400 })
  }

  let user = await createUser({
    name: data.name,
    phone: data.phone,
    email: data.email || undefined,
    password: data.password,
    role: data.role,
    orangeMoneyNumber: data.orangeMoneyNumber,
    registeredReferrerCode: data.registeredReferrerCode,
  })

  if (data.role === "business") {
    const business = await prisma.business.create({
      data: {
        ownerId: user.id,
        name: data.businessName!,
        category: data.category!,
        description: data.description || "",
        city: data.city!,
        address: data.address || "",
        phone: data.phone,
        imageUrl: data.imageUrl || undefined,
        commissionPct: data.commissionPct ?? 10,
        verified: false,
      },
    })
    user = await prisma.user.update({
      where: { id: user.id },
      data: { businessId: business.id },
    })
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
