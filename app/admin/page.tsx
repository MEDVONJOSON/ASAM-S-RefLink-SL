import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getCurrentUser } from "@/lib/auth"
import { listBusinesses } from "@/lib/data"
import prisma from "@/lib/db"
import { AdminDashboard } from "./admin-dashboard"

export const metadata = { title: "Admin" }

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "admin") redirect("/")

  const businesses = await listBusinesses()
  const sales = (await prisma.sale.findMany({
    include: { business: true, referrer: true },
    orderBy: { createdAt: "desc" },
  })).map((s) => ({
    ...s,
    businessName: s.business.name,
    referrerName: s.referrer.name,
  }))
  const products = await prisma.product.findMany({ orderBy: { createdAt: "desc" } })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/20">
        <AdminDashboard businesses={businesses} sales={sales} products={products} />
      </main>
      <SiteFooter />
    </div>
  )
}
