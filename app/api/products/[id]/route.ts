import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const updateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().min(5).max(1000).optional(),
  price: z.coerce.number().positive().optional(),
  category: z.string().min(1).max(60).optional(),
  imageUrl: z.string().optional(),
})

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const user = await getCurrentUser()
    if (product.status !== "approved") {
      if (!user || (user.role !== "admin" && product.businessId !== user.businessId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
      }
    }

    return NextResponse.json({ product })
  } catch (err) {
    console.error("API Error [GET /api/products/:id]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (user.role === "business" && product.businessId !== user.businessId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (user.role === "referrer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    const parsed = updateSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 })
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...parsed.data,
        status: "pending",
      },
    })

    return NextResponse.json({ product: updatedProduct })
  } catch (err) {
    console.error("API Error [PATCH /api/products/:id]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const product = await prisma.product.findUnique({ where: { id } })
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })

    if (user.role === "business" && product.businessId !== user.businessId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (user.role === "referrer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("API Error [DELETE /api/products/:id]:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
