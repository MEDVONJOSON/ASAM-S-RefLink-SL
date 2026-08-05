import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"
import { randomBytes } from "crypto"

const itemSchema = z.object({
  productId: z.string().min(1),
  businessId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  qty: z.number().int().positive(),
})

const schema = z.object({
  items: z.array(itemSchema).min(1),
  totalAmount: z.number().positive(),
  paymentMethod: z.enum(["orange_money", "afri_money"]),
  mobileNumber: z.string().min(5),
})

function generateReference(): string {
  return "RL" + randomBytes(4).toString("hex").toUpperCase()
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Please log in to place an order" }, { status: 401 })
  }
  if (user.role !== "client") {
    return NextResponse.json({ error: "Only client accounts can place orders" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order data", details: parsed.error.flatten() }, { status: 400 })
  }

  const { items, totalAmount, paymentMethod, mobileNumber } = parsed.data

  // Use the first item's businessId for the primary business reference
  const primaryBusinessId = items[0].businessId

  const business = await prisma.business.findUnique({ where: { id: primaryBusinessId } })
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 })
  }

  // Generate a unique reference
  let reference = generateReference()
  let attempts = 0
  while (attempts < 10) {
    const existing = await prisma.order.findUnique({ where: { reference } })
    if (!existing) break
    reference = generateReference()
    attempts++
  }

  const order = await prisma.order.create({
    data: {
      clientId: user.id,
      businessId: primaryBusinessId,
      items: items as any,
      totalAmount,
      paymentMethod,
      mobileNumber,
      status: "pending_payment",
      reference,
    },
  })

  return NextResponse.json({ reference: order.reference, orderId: order.id }, { status: 201 })
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user || user.role !== "client") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const orders = await prisma.order.findMany({
    where: { clientId: user.id },
    orderBy: { createdAt: "desc" },
    include: { business: { select: { name: true } } },
  })

  return NextResponse.json({ orders })
}
