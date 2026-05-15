import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { listProducts } from "@/lib/data"
import prisma from "@/lib/db"
import { z } from "zod"

const createSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(5).max(1000),
  price: z.coerce.number().positive(),
  category: z.string().min(1).max(60),
  imageUrl: z.string().optional(),
})

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "business") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (!user.businessId) {
      return NextResponse.json({ error: "No business linked" }, { status: 400 })
    }

    const body = await req.json().catch(() => null)
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        businessId: user.businessId,
        status: "pending",
        ...parsed.data,
      },
    })

    return NextResponse.json({ product }, { status: 201 })
  } catch (err) {
    console.error("API Error [POST /api/products]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const businessId = searchParams.get("businessId") ?? undefined
  const status = searchParams.get("status") ?? undefined
  const approvedOnly = searchParams.get("approvedOnly") === "true"
  const q = searchParams.get("q") ?? undefined
  const category = searchParams.get("category") ?? undefined

  const user = await getCurrentUser()

  if (!user || (user.role !== "admin" && user.role !== "business")) {
    const products = await listProducts({ approvedOnly: true, businessId, q, category })
    return NextResponse.json({ products })
  }

  if (user.role === "business") {
    const products = await listProducts({ businessId: user.businessId ?? undefined, status, q, category })
    return NextResponse.json({ products })
  }

  const products = await listProducts({ businessId, status, approvedOnly, q, category })
  return NextResponse.json({ products })
}
