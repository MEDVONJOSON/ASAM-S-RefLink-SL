import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { destroySession, SESSION_COOKIE } from "@/lib/auth"

export async function POST() {
  const c = await cookies()
  const token = c.get(SESSION_COOKIE)?.value
  if (token) await destroySession(token)
  c.delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}
