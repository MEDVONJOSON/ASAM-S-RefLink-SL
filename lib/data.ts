import prisma from "./db"

export function shortCode(len = 6): string {
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < len; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

export async function listBusinesses(opts?: {
  verifiedOnly?: boolean
  q?: string
  category?: string
  city?: string
  take?: number
}) {
  return prisma.business.findMany({
    where: {
      ...(opts?.verifiedOnly ? { verified: true } : {}),
      ...(opts?.category && opts.category !== "All" ? { category: opts.category } : {}),
      ...(opts?.city && opts.city !== "All" ? { city: opts.city } : {}),
      ...(opts?.q
        ? {
            OR: [
              { name: { contains: opts.q, mode: "insensitive" as const } },
              { description: { contains: opts.q, mode: "insensitive" as const } },
              { city: { contains: opts.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts?.take,
  })
}

export async function listProducts(opts?: {
  businessId?: string
  status?: string
  approvedOnly?: boolean
  q?: string
  category?: string
  take?: number
}) {
  return prisma.product.findMany({
    where: {
      ...(opts?.businessId ? { businessId: opts.businessId } : {}),
      ...(opts?.approvedOnly ? { status: "approved" } : {}),
      ...(opts?.status ? { status: opts.status } : {}),
      ...(opts?.category && opts.category !== "All" ? { category: opts.category } : {}),
      ...(opts?.q
        ? {
            OR: [
              { name: { contains: opts.q, mode: "insensitive" as const } },
              { description: { contains: opts.q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: opts?.take,
  })
}

export async function uniqueReferralCode(): Promise<string> {
  let code = shortCode(6)
  while (await prisma.referralLink.findUnique({ where: { code } })) {
    code = shortCode(6)
  }
  return code
}
