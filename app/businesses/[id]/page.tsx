import { notFound } from "next/navigation"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShieldCheck, MapPin, Phone, Building2, Package } from "lucide-react"
import { listProducts } from "@/lib/data"
import prisma from "@/lib/db"
import { ReferralActions } from "./referral-actions"

export default async function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const biz = await prisma.business.findUnique({ where: { id } })
  if (!biz) notFound()

  const products = await listProducts({ businessId: id, approvedOnly: true })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10">
          <Link href="/businesses" className="text-sm text-muted-foreground hover:text-foreground">
            &larr; Back to directory
          </Link>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
            <div>
              {/* Business Info Card */}
              <div className="relative overflow-hidden rounded-3xl border border-white/20 glass-card p-10 shadow-xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
                
                <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/10 text-primary px-3 py-1 text-sm font-semibold rounded-full">
                      {biz.category}
                    </Badge>
                    <h1 className="text-balance text-4xl font-black tracking-tight md:text-5xl lg:text-6xl text-foreground">
                      {biz.name}
                    </h1>
                    <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-base text-muted-foreground font-medium">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" /> {biz.address}, {biz.city}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Phone className="h-5 w-5 text-primary" /> {biz.phone}
                      </span>
                    </div>
                  </div>
                  {biz.verified && (
                    <Badge className="gap-1.5 bg-accent text-accent-foreground hover:bg-accent px-3 py-1.5 rounded-full shadow-sm text-sm font-semibold">
                      <ShieldCheck className="h-4 w-4" /> Verified
                    </Badge>
                  )}
                </div>
              </div>

              {/* Products Section */}
              <section className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <Package className="h-6 w-6 text-primary" />
                  <h2 className="text-2xl font-bold tracking-tight">Products & Services</h2>
                </div>
                
                {products.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-secondary/20 p-10 text-center">
                    <p className="text-muted-foreground">This business hasn't listed any specific products yet.</p>
                  </div>
                ) : (
                  <div className="grid gap-6 sm:grid-cols-2">
                    {products.map((p) => (
                      <div key={p.id} className="group relative overflow-hidden rounded-2xl border border-white/10 glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                        {p.imageUrl && (
                          <div className="aspect-video overflow-hidden">
                            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-bold text-lg leading-tight">{p.name}</h3>
                            <span className="shrink-0 font-mono font-bold text-primary">SLE {p.price.toLocaleString()}</span>
                          </div>
                          <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.description}</p>
                          <div className="mt-4 flex items-center gap-2">
                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">{p.category}</Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <div className="mt-12 rounded-3xl border border-white/10 glass p-8 shadow-sm">
                <h2 className="text-xl font-bold tracking-tight">About {biz.name}</h2>
                <p className="mt-4 text-base leading-relaxed text-muted-foreground font-medium">{biz.description}</p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3">
                <Stat label="Commission" value={`${biz.commissionPct}%`} />
                <Stat label="City" value={biz.city} />
                <Stat label="Verified" value={biz.verified ? "Yes" : "Pending"} />
              </div>
            </div>

            <ReferralActions businessId={biz.id} businessName={biz.name} commissionPct={biz.commissionPct} />
          </div>

          <section className="mt-14">
            <h2 className="text-xl font-semibold">How a referral pays out for this business</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {[
                { l: "On a SLE 1,000,000 sale", v: `Commission: SLE ${commaNum((1_000_000 * biz.commissionPct) / 100)}` },
                { l: "Referrer (80%)", v: `SLE ${commaNum(((1_000_000 * biz.commissionPct) / 100) * 0.8)}` },
                { l: "Platform (20%)", v: `SLE ${commaNum(((1_000_000 * biz.commissionPct) / 100) * 0.2)}` },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border/70 bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</p>
                  <p className="mt-1 font-mono font-semibold">{s.v}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 glass-card p-5 transition-all hover:-translate-y-1 hover:shadow-md duration-300">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <Building2 className="h-4 w-4 text-primary" /> {label}
      </div>
      <p className="text-lg font-black">{value}</p>
    </div>
  )
}

function commaNum(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
}
