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
        <section className="relative overflow-hidden bg-background pt-20 pb-28 border-b border-white/5">
          {/* Animated Background Gradients */}
          <div className="absolute top-0 -left-1/4 w-full h-full bg-primary/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-float" />
          <div className="absolute bottom-0 right-0 w-1/2 h-full bg-accent/20 rounded-full mix-blend-multiply filter blur-[120px] opacity-60 animate-float" style={{ animationDelay: '2s' }} />
          
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />

          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-bold tracking-wide text-primary mb-8 shadow-sm">
              <Sparkles className="mr-2 h-4 w-4" /> THE REFERRAL MARKETPLACE
            </div>
            <h1 className="text-balance text-4xl font-black tracking-tighter md:text-6xl lg:text-7xl text-foreground">
              Discover & Refer <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Verified Businesses</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
              Browse top-rated hotels, services, and suppliers across Sierra Leone. Find the perfect fit, share your unique link, and earn instant Orange Money commissions.
            </p>
          </div>
        </section>
        <BusinessDirectory initial={initial} />
      </main>
      <SiteFooter />
    </div>
  )
}
