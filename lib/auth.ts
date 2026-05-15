import { randomBytes } from "crypto"
import { cookies } from "next/headers"
import prisma from "./db"
import type { SafeUser, UserRole } from "./types"
import { hashPassword } from "./crypto"

export const SESSION_COOKIE = "reflink_session"
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

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
    role: rest.role as UserRole,
    email: rest.email ?? undefined,
    referrerCode: rest.referrerCode ?? undefined,
    registeredReferrerCode: rest.registeredReferrerCode ?? undefined,
    signature: rest.signature ?? undefined,
    trainingCompleted: rest.trainingCompleted ?? undefined,
    orangeMoneyNumber: rest.orangeMoneyNumber ?? undefined,
    businessId: rest.businessId ?? undefined,
  }
}

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

export async function createUser(input: {
  name: string
  phone: string
  email?: string
  password: string
  role: "business" | "referrer"
  orangeMoneyNumber?: string
  registeredReferrerCode?: string
}): Promise<CurrentUser> {
  const referrerData =
    input.role === "referrer"
      ? {
          referrerCode: await uniqueReferrerCode(input.name),
          registeredReferrerCode: input.registeredReferrerCode || null,
          signature: await uniqueSignature(),
          trainingCompleted: false,
          orangeMoneyNumber: input.orangeMoneyNumber || input.phone,
        }
      : {}

  return prisma.user.create({
    data: {
      name: input.name,
      phone: input.phone,
      email: input.email || null,
      role: input.role,
      passwordHash: hashPassword(input.password),
      ...referrerData,
    },
  })
}
