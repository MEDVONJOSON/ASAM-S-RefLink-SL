import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { uniqueReferralCode } from "@/lib/data"
import prisma from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  businessId: z.string().min(1),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "referrer") {
    return NextResponse.json({ error: "Only referrers can view their links" }, { status: 403 })
  }

  const links = await prisma.referralLink.findMany({
    where: { referrerId: user.id },
    include: { business: true },
    orderBy: { createdAt: "desc" },
  })

  const out = links.map((r) => ({
    id: r.id,
    code: r.code,
    referrerId: r.referrerId,
    businessId: r.businessId,
    clicks: r.clicks,
    createdAt: r.createdAt,
    businessName: r.business.name,
    businessCity: r.business.city,
  }))

  return NextResponse.json({ links: out })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "referrer") {
    return NextResponse.json({ error: "Only referrers can create referral links" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const business = await prisma.business.findUnique({ where: { id: parsed.data.businessId } })
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

  const existing = await prisma.referralLink.findFirst({
    where: { referrerId: user.id, businessId: business.id },
  })
  if (existing) {
    return NextResponse.json({
      link: { ...existing, businessName: business.name, businessCity: business.city },
    })
  }

  const baseCode = user.registeredReferrerCode || user.referrerCode || "REF"

  // Generate a unique full code (baseCode + random suffix)
  let newCode: string
  let attempts = 0
  do {
    const randomPart = await uniqueReferralCode()
    newCode = `${baseCode}-${randomPart}`
    const exists = await prisma.referralLink.findUnique({ where: { code: newCode } })
    if (!exists) break
    attempts++
  } while (attempts < 10)

  try {
    const link = await prisma.referralLink.create({
      data: {
        code: newCode,
        referrerId: user.id,
        businessId: business.id,
      },
    })

    return NextResponse.json({ link: { ...link, businessName: business.name, businessCity: business.city } })
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Could not generate a unique code. Please try again." }, { status: 500 })
    }
    return NextResponse.json({ error: "Failed to create referral link" }, { status: 500 })
  }
}
