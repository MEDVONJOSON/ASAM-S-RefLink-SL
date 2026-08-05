import { NextResponse } from "next/server"
import { z } from "zod"
import { verifyOtp } from "@/lib/auth"

const schema = z.object({
  phone: z.string().min(6),
  code: z.string().length(6, "OTP must be 6 digits"),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 })
  }

  const valid = await verifyOtp(parsed.data.phone, parsed.data.code)
  if (!valid) {
    return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 })
  }

  return NextResponse.json({ verified: true })
}
