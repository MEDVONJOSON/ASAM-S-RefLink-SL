import { randomBytes } from "crypto"
import { cookies } from "next/headers"
import prisma from "./db"
import type { SafeUser, UserRole } from "./types"
import { hashPassword } from "./crypto"

export const SESSION_COOKIE = "reflink_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30
const OTP_EXPIRY_MINUTES = 5

type DbUser = Awaited<ReturnType<typeof prisma.user.findUnique>>
type CurrentUser = NonNullable<DbUser>

function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase()
}

function generateReferrerCode(name: string): string {
  const base = (name.split(" ")[0] || "REF").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 5) || "REF"
  return base + Math.floor(Math.random() * 90 + 10)
}

function generateSignature(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let sig = ""
  for (let i = 0; i < 8; i++) sig += chars.charAt(Math.floor(Math.random() * chars.length))
  return sig
}

async function uniqueReferrerCode(name: string): Promise<string> {
  let code = generateReferrerCode(name)
  while (await prisma.user.findUnique({ where: { referrerCode: code } })) {
    code = generateReferrerCode(name)
  }
  return code
}

async function uniqueSignature(): Promise<string> {
  let signature = generateSignature()
  while (await prisma.user.findUnique({ where: { signature } })) {
    signature = generateSignature()
  }
  return signature
}

export function toSafeUser(u: CurrentUser): SafeUser {
  const { passwordHash, ...rest } = u
  void passwordHash
  return {
    ...rest,
    imageUrl: u.imageUrl,
    role: rest.role as UserRole,
    email: rest.email ?? undefined,
    phone: rest.phone ?? undefined,
    googleId: rest.googleId ?? undefined,
    referrerCode: rest.referrerCode ?? undefined,
    registeredReferrerCode: rest.registeredReferrerCode ?? undefined,
    signature: rest.signature ?? undefined,
    trainingCompleted: rest.trainingCompleted ?? undefined,
    orangeMoneyNumber: rest.orangeMoneyNumber ?? undefined,
    businessId: rest.businessId ?? undefined,
  }
}

/* ─── Sessions ─── */

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString("hex")
  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt: new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000),
    },
  })
  return token
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { token } })
}

export async function getSessionToken(): Promise<string | undefined> {
  const c = await cookies()
  return c.get(SESSION_COOKIE)?.value
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const token = await getSessionToken()
  if (!token) return null

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  })

  if (!session || session.expiresAt <= new Date()) {
    if (session) await destroySession(token)
    return null
  }

  return session.user
}

/* ─── User Lookup ─── */

export async function findUserByPhoneOrEmail(identifier: string): Promise<CurrentUser | null> {
  const id = normalizeIdentifier(identifier)
  return prisma.user.findFirst({
    where: {
      OR: [
        { phone: { equals: id, mode: "insensitive" } },
        { email: { equals: id, mode: "insensitive" } },
        { signature: { equals: id, mode: "insensitive" } },
      ],
    },
  })
}

/** Extended lookup that also matches referrerCode and registeredReferrerCode */
export async function findUserByIdentifier(identifier: string): Promise<CurrentUser | null> {
  const id = normalizeIdentifier(identifier)
  return prisma.user.findFirst({
    where: {
      OR: [
        { phone: { equals: id, mode: "insensitive" } },
        { email: { equals: id, mode: "insensitive" } },
        { signature: { equals: id, mode: "insensitive" } },
        { referrerCode: { equals: id.toUpperCase(), mode: "insensitive" } },
        { registeredReferrerCode: { equals: id, mode: "insensitive" } },
      ],
    },
  })
}

export async function findUserByGoogleId(googleId: string): Promise<CurrentUser | null> {
  return prisma.user.findUnique({ where: { googleId } })
}

/* ─── User Creation ─── */

export async function createUser(input: {
  name: string
  phone?: string
  email?: string
  password?: string
  googleId?: string
  role: "business" | "referrer" | "client"
  orangeMoneyNumber?: string
  registeredReferrerCode?: string
}): Promise<CurrentUser> {
  const referrerData =
    input.role === "referrer"
      ? {
          referrerCode: input.registeredReferrerCode || await uniqueReferrerCode(input.name),
          registeredReferrerCode: input.registeredReferrerCode || null,
          signature: await uniqueSignature(),
          trainingCompleted: false,
          orangeMoneyNumber: input.orangeMoneyNumber || input.phone || null,
        }
      : {}

  return prisma.user.create({
    data: {
      name: input.name,
      phone: input.phone || null,
      email: input.email || null,
      role: input.role,
      passwordHash: input.password ? hashPassword(input.password) : null,
      googleId: input.googleId || null,
      ...referrerData,
    },
  })
}

/* ─── OTP ─── */

export function generateOtpCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export async function createOtp(phone: string): Promise<string> {
  // Invalidate any previous unused OTPs for this phone
  await prisma.otpCode.updateMany({
    where: { phone, used: false },
    data: { used: true },
  })

  const code = generateOtpCode()
  await prisma.otpCode.create({
    data: {
      phone,
      code,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    },
  })

  // TODO: Replace with real SMS provider (Twilio, Africa's Talking, etc.)
  console.log(`\n🔑 [MOCK SMS] OTP for ${phone}: ${code}\n`)

  return code
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await prisma.otpCode.findFirst({
    where: {
      phone,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  })

  if (!otp) return false

  await prisma.otpCode.update({
    where: { id: otp.id },
    data: { used: true },
  })

  return true
}

/* ─── Utility ─── */

export function maskPhone(phone: string): string {
  if (phone.length <= 4) return "***" + phone.slice(-2)
  return phone.slice(0, 4) + "****" + phone.slice(-2)
}

export function generateDefaultName(phone?: string): string {
  if (phone) {
    const last4 = phone.replace(/\D/g, "").slice(-4)
    return `User ${last4}`
  }
  return `User ${Math.floor(1000 + Math.random() * 9000)}`
}
