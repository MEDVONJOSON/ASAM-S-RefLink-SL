import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"
import { z } from "zod"

const schema = z.object({ businessId: z.string(), verified: z.boolean() })

export async function POST(req: Request) {
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

    const business = await prisma.business.update({
      where: { id: parsed.data.businessId },
      data: { verified: parsed.data.verified },
    }).catch(() => null)

    if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ business })
  } catch (err) {
    console.error("API Error [POST /api/admin/verify-business]:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
