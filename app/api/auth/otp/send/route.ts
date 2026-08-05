import { NextResponse } from "next/server"
import { z } from "zod"
import { createOtp } from "@/lib/auth"

const schema = z.object({
  phone: z.string().min(6, "Phone number is required"),
})

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid phone number" }, { status: 400 })
  }

  try {
    await createOtp(parsed.data.phone)
    return NextResponse.json({ sent: true })
  } catch {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
  }
}
