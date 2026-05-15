import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const schema = z.object({
  status: z.enum(["confirmed", "rejected"]),
})

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: { business: true },
  })
  if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const allowed = user.role === "admin" || (user.role === "business" && sale.business.ownerId === user.id)
  if (!allowed) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const body = await req.json().catch(() => ({ status: "confirmed" }))
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const updated = await prisma.sale.update({
    where: { id },
    data: {
      status: parsed.data.status,
      confirmedAt: new Date(),
    },
  })

  return NextResponse.json({ sale: updated })
}
