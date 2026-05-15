import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const business = await prisma.business.findUnique({ where: { id } })
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ business })
}

const patchSchema = z.object({
  name: z.string().min(2).optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  commissionPct: z.coerce.number().min(5).max(15).optional(),
  verified: z.boolean().optional(),
  imageUrl: z.string().optional(),
})

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const business = await prisma.business.findUnique({ where: { id } })
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (business.ownerId !== user.id && user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const data = { ...parsed.data }
  if (data.verified !== undefined && user.role !== "admin") {
    delete data.verified
  }

  const updated = await prisma.business.update({
    where: { id },
    data,
  })

  return NextResponse.json({ business: updated })
}
