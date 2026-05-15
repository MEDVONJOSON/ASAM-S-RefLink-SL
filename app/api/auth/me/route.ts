import { NextResponse } from "next/server"
import { getCurrentUser, toSafeUser } from "@/lib/auth"

export async function GET() {
  const u = await getCurrentUser()
  if (!u) return NextResponse.json({ user: null })
  return NextResponse.json({ user: toSafeUser(u) })
}
