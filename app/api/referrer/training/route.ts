import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import prisma from "@/lib/db"

export async function POST() {
  const user = await getCurrentUser()
  if (!user || user.role !== "referrer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { trainingCompleted: true },
  })
  return NextResponse.json({ ok: true, trainingCompleted: true })
}
