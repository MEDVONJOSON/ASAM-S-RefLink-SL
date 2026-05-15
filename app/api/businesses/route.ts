import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { listBusinesses } from "@/lib/data"
import prisma from "@/lib/db"
import { z } from "zod"

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get("q") || undefined
  const category = url.searchParams.get("category") || undefined
  const city = url.searchParams.get("city") || undefined
  const all = url.searchParams.get("all") === "1"
  const data = await listBusinesses({ verifiedOnly: !all, q, category, city })
  return NextResponse.json({ businesses: data })
}

const createSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional().default(""),
  city: z.string().min(2),
  address: z.string().optional().default(""),
  phone: z.string().min(4),
  commissionPct: z.coerce.number().min(5).max(15),
})

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user || user.role !== "business") {
    return NextResponse.json({ error: "Only business accounts can list businesses." }, { status: 403 })
  }

  const body = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 })

  const business = await prisma.business.create({
    data: {
      ownerId: user.id,
      ...parsed.data,
      verified: false,
    },
  })

  await prisma.user.update({
    where: { id: user.id },
    data: { businessId: business.id },
  })

  return NextResponse.json({ business })
}
