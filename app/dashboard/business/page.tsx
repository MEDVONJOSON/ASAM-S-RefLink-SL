import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getCurrentUser, toSafeUser } from "@/lib/auth"
import prisma from "@/lib/db"
import { BusinessDashboard } from "./business-dashboard"

export const metadata = { title: "Business dashboard" }

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "business") redirect("/")

  const business = user.businessId ? await prisma.business.findUnique({ where: { id: user.businessId } }) : null
  if (!business) redirect("/signup?role=business")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/20">
        <BusinessDashboard user={toSafeUser(user)} business={business} />
      </main>
      <SiteFooter />
    </div>
  )
}
