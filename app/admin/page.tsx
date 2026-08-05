import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getCurrentUser, toSafeUser } from "@/lib/auth"
import { listBusinesses } from "@/lib/data"
import prisma from "@/lib/db"
import { AdminDashboard } from "./admin-dashboard"

export const metadata = { title: "Admin" }

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect("/admin/login")
  if (user.role !== "admin") redirect("/")

  const businessesRaw = await prisma.business.findMany({
    include: { owner: true },
    orderBy: { createdAt: "desc" },
  })
  const businesses = businessesRaw.map((b) => ({
    ...b,
    createdAt: b.createdAt.toISOString(),
    owner: toSafeUser(b.owner),
  }))
  const sales = (await prisma.sale.findMany({
    include: { business: true, referrer: true },
    orderBy: { createdAt: "desc" },
  })).map((s) => ({
    ...s,
    businessName: s.business.name,
    referrerName: s.referrer.name,
  }))
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } })

  const referrersRaw = await prisma.user.findMany({
    where: { role: "referrer" },
    orderBy: { createdAt: "desc" },
  })
  const referrers = referrersRaw.map(toSafeUser)

  const clientsRaw = await prisma.user.findMany({
    where: { role: "client" },
    orderBy: { createdAt: "desc" },
  })
  const clients = clientsRaw.map(toSafeUser)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/20">
        <AdminDashboard
          user={toSafeUser(user)}
          businesses={businesses}
          sales={sales}
          products={products}
          referrers={referrers}
          clients={clients}
        />
      </main>
      <SiteFooter />
    </div>
  )
}
