import { NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function POST(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const link = await prisma.referralLink.update({
    where: { code: code.toUpperCase() },
    data: { clicks: { increment: 1 } },
    include: { business: true },
  }).catch(() => null)

  if (!link) return NextResponse.json({ error: "Not found" }, { status: 404 })

  return NextResponse.json({
    ok: true,
    clicks: link.clicks,
    businessId: link.businessId,
    businessName: link.business.name,
  })
}
