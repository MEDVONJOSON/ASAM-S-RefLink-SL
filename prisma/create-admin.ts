import { PrismaClient } from "@prisma/client"
import { hashPassword } from "../lib/crypto"

const prisma = new PrismaClient()

async function main() {
  const name = process.env.ADMIN_NAME || "RefLink Admin"
  const phone = process.env.ADMIN_PHONE
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!phone || !email || !password) {
    throw new Error("Set ADMIN_PHONE, ADMIN_EMAIL, and ADMIN_PASSWORD before running admin:create.")
  }

  const existing = await prisma.user.findFirst({
    where: {
      OR: [{ phone }, { email }],
    },
  })

  if (existing) {
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        name,
        phone,
        email,
        role: "admin",
        passwordHash: hashPassword(password),
      },
    })
    console.log(`Updated admin account: ${email}`)
    return
  }

  await prisma.user.create({
    data: {
      name,
      phone,
      email,
      role: "admin",
      passwordHash: hashPassword(password),
    },
  })
  console.log(`Created admin account: ${email}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
