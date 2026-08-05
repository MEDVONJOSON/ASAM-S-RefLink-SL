import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"

export async function PATCH(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "referrer") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  if (!body) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const { name, phone, email, imageUrl, registeredReferrerCode } = body

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 })
  }

  try {
    // Check for duplicate phone (excluding current user)
    if (phone) {
      const existingPhone = await prisma.user.findFirst({
        where: { phone, id: { not: user.id } },
      })
      if (existingPhone) {
        return NextResponse.json({ error: "That phone number is already in use." }, { status: 400 })
      }
    }

    // Check for duplicate email (excluding current user)
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email, id: { not: user.id } },
      })
      if (existingEmail) {
        return NextResponse.json({ error: "That email address is already in use." }, { status: 400 })
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name,
        phone: phone || null,
        email: email || null,
        imageUrl: imageUrl || null,
        ...(registeredReferrerCode ? {
          registeredReferrerCode,
          referrerCode: registeredReferrerCode,
        } : {}),
      },
    })
    return NextResponse.json({ user: updated })
  } catch (error: any) {
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field"
      return NextResponse.json({ error: `That ${field} is already in use.` }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
