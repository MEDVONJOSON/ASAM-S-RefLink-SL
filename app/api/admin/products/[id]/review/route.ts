import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  status: z.enum(["approved", "rejected"]),
  rejectionNote: z.string().optional(),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await req.json().catch(() => null)
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", issues: parsed.error.flatten() }, { status: 400 })
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        status: parsed.data.status,
        rejectionNote: parsed.data.status === "rejected" ? parsed.data.rejectionNote : null,
      },
    }).catch(() => null)

    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ product })
  } catch (err) {
    console.error("API Error [POST /api/admin/products/:id/review]:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
