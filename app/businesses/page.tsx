import { SiteHeader } from "@/components/site-header"
import { Sparkles } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { BusinessDirectory } from "./business-directory"
import { listBusinesses } from "@/lib/data"

export const metadata = { title: "Browse verified businesses" }
export const dynamic = "force-dynamic"

export default async function BusinessesPage() {
  const initial = await listBusinesses({ verifiedOnly: true })
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-background pt-16 pb-20 border-b border-border/40">
          {/* Subtle background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute top-0 -left-1/4 w-1/2 h-full bg-primary/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-50 animate-float" />

          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold tracking-widest text-primary mb-5 shadow-sm uppercase">
              <Sparkles className="mr-2 h-3.5 w-3.5" /> The Referral Marketplace
            </div>
            <h1 className="text-balance text-3xl font-black tracking-tighter md:text-5xl text-foreground">
              Discover &amp; Refer{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Verified Businesses</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground leading-relaxed font-medium">
              Browse top-rated businesses across Sierra Leone. Share your unique link and earn instant Orange Money commissions.
            </p>
          </div>
        </section>
        <BusinessDirectory initial={initial} />
      </main>
      <SiteFooter />
    </div>
  )
}
