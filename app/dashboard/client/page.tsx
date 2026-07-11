import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { getCurrentUser, toSafeUser } from "@/lib/auth"
import { ClientDashboard } from "./client-dashboard"

export const metadata = { title: "Client dashboard" }

export default async function Page() {
  const user = await getCurrentUser()
  if (!user) redirect("/login")
  if (user.role !== "client") redirect("/")

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/20">
        <ClientDashboard user={toSafeUser(user)} />
      </main>
      <SiteFooter />
    </div>
  )
}
