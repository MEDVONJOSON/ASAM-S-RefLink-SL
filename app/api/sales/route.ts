import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  referralCode: z.string().min(3),
  customerName: z.string().min(2),
  customerPhone: z.string().min(4),
  amount: z.coerce.number().positive(),
  note: z.string().optional(),
})

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (user.role === "referrer") {
    const sales = await prisma.sale.findMany({
      where: { referrerId: user.id },
      include: { business: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({
      sales: sales.map((s) => ({ ...s, businessName: s.business.name })),
    })
  }

  if (user.role === "business" && user.businessId) {
    const sales = await prisma.sale.findMany({
      where: { businessId: user.businessId },
      include: { referrer: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({
      sales: sales.map((s) => ({ ...s, referrerName: s.referrer.name })),
    })
  }

  if (user.role === "client") {
    const sales = await prisma.sale.findMany({
      where: { customerPhone: user.phone },
      include: { business: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({
      sales: sales.map((s) => ({ ...s, businessName: s.business.name })),
    })
  }

  if (user.role === "admin") {
    const sales = await prisma.sale.findMany({
      include: { business: true, referrer: true },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json({
      sales: sales.map((s) => ({
        ...s,
        businessName: s.business.name,
        referrerName: s.referrer.name,
      })),
    })
  }

  return NextResponse.json({ sales: [] })
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "business" || !user.businessId) {
    return NextResponse.json({ error: "Only business owners can report sales" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const code = parsed.data.referralCode.toUpperCase()
  const link = await prisma.referralLink.findUnique({ where: { code } })
  if (!link) return NextResponse.json({ error: "Referral code not found" }, { status: 404 })
  if (link.businessId !== user.businessId) {
    return NextResponse.json({ error: "Code is not for your business" }, { status: 400 })
  }

  const business = await prisma.business.findUnique({ where: { id: user.businessId } })
  if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

  const commissionAmount = (parsed.data.amount * business.commissionPct) / 100
  const referrerEarning = +(commissionAmount * 0.8).toFixed(2)
  const platformEarning = +(commissionAmount * 0.2).toFixed(2)

  const sale = await prisma.sale.create({
    data: {
      businessId: business.id,
      referrerId: link.referrerId,
      referralLinkId: link.id,
      referralCode: code,
      customerName: parsed.data.customerName,
      customerPhone: parsed.data.customerPhone,
      amount: parsed.data.amount,
      commissionPct: business.commissionPct,
      commissionAmount: +commissionAmount.toFixed(2),
      referrerEarning,
      platformEarning,
      status: "pending",
      note: parsed.data.note,
    },
  })

  return NextResponse.json({ sale })
}
