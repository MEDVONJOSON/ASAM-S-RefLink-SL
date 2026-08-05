import { notFound } from "next/navigation"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import {
  ShieldCheck,
  MapPin,
  Phone,
  Package,
  Star,
  ChevronRight,
  Zap,
  Clock,
  RotateCcw,
} from "lucide-react"
import { listProducts } from "@/lib/data"
import prisma from "@/lib/db"
import { ReferralActions } from "./referral-actions"

// Deterministic pseudo-rating helper
function getRating(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return (3.8 + (n % 12) * 0.1).toFixed(1)
}
function getReviewCount(id: string) {
  const n = id.charCodeAt(1) ?? 5
  return ((n * 137 + 200) % 4800) + 50
}

function StarRow({ rating, count }: { rating: string; count: number }) {
  const r = parseFloat(rating)
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.min(1, Math.max(0, r - (i - 1)))
          return (
            <span key={i} className="relative inline-block text-border leading-none">
              <Star className="h-4 w-4 fill-border stroke-none" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="h-4 w-4 fill-amber-400 stroke-none" />
              </span>
            </span>
          )
        })}
      </div>
      <span className="text-primary text-sm font-semibold hover:underline cursor-pointer">
        {count.toLocaleString()} ratings
      </span>
    </div>
  )
}

export default async function BusinessDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const biz = await prisma.business.findUnique({ where: { id } })
  if (!biz) notFound()

  const products = await listProducts({ businessId: id, approvedOnly: true })
  const rating = getRating(biz.id)
  const reviewCount = getReviewCount(biz.id)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 flex-wrap">
            <Link href="/" className="hover:text-primary hover:underline">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/businesses" className="hover:text-primary hover:underline">Marketplace</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/businesses" className="hover:text-primary hover:underline">{biz.category}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium line-clamp-1">{biz.name}</span>
          </nav>

          {/* ── 3-column layout ──────────────────────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_320px] gap-8 items-start">

            {/* ── COL 1: Image Gallery ──────────────────────── */}
            <div className="lg:w-72 xl:w-80">
              {/* Main image */}
              <div className="rounded-2xl overflow-hidden border border-border/60 bg-secondary/20 aspect-square sticky top-24">
                {biz.imageUrl ? (
                  <img
                    src={biz.imageUrl}
                    alt={biz.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-8xl font-black text-muted-foreground/20 select-none">
                      {biz.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Product thumbnails as gallery extras */}
              {products.filter((p) => p.imageUrl).length > 0 && (
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {products.filter((p) => p.imageUrl).slice(0, 4).map((p) => (
                    <div key={p.id} className="aspect-square rounded-lg overflow-hidden border border-border/40 hover:border-primary/60 transition-colors cursor-pointer">
                      <img src={p.imageUrl!} alt={p.name} className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── COL 2: Product Info ───────────────────────── */}
            <div className="min-w-0">
              {/* Header */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  {biz.category}
                </Badge>
                {biz.verified && (
                  <Badge className="gap-1 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-0.5 rounded-full">
                    <ShieldCheck className="h-3.5 w-3.5" /> Verified Business
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-foreground leading-tight">
                {biz.name}
              </h1>

              {/* Store link */}
              <p className="text-sm text-primary font-semibold mt-1 hover:underline cursor-pointer">
                Visit {biz.name} Store
              </p>

              {/* Star rating */}
              <div className="mt-3">
                <StarRow rating={rating} count={reviewCount} />
              </div>

              <div className="border-t border-border/50 my-4" />

              {/* Commission (the "price" equivalent) */}
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Commission Rate</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-foreground">{biz.commissionPct}%</span>
                  <span className="text-sm text-muted-foreground font-medium">per successful referral</span>
                </div>
                <div className="flex items-center gap-1.5 text-accent font-semibold text-sm">
                  <Zap className="h-4 w-4 fill-accent" />
                  Paid instantly via Orange Money
                </div>
              </div>

              <div className="border-t border-border/50 my-4" />

              {/* Location + Contact */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span>{biz.address}, {biz.city}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4 text-primary shrink-0" />
                  <span>{biz.phone}</span>
                </div>
              </div>

              <div className="border-t border-border/50 my-4" />

              {/* About */}
              <div>
                <h2 className="text-base font-black tracking-tight mb-2">About this business</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{biz.description}</p>
              </div>

              {/* Commission breakdown */}
              <div className="mt-6 rounded-2xl border border-border/60 bg-secondary/30 p-5">
                <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3">
                  How a referral payout works
                </h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { l: "On a SLE 1,000,000 sale", v: `Commission: SLE ${commaNum((1_000_000 * biz.commissionPct) / 100)}` },
                    { l: "Referrer (80%)", v: `SLE ${commaNum(((1_000_000 * biz.commissionPct) / 100) * 0.8)}` },
                    { l: "Platform (20%)", v: `SLE ${commaNum(((1_000_000 * biz.commissionPct) / 100) * 0.2)}` },
                  ].map((s) => (
                    <div key={s.l} className="rounded-xl border border-border/50 bg-card p-3.5">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.l}</p>
                      <p className="mt-1 font-mono font-bold text-sm">{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Products & Services */}
              {products.length > 0 && (
                <section className="mt-8">
                  <div className="flex items-center gap-2 mb-5">
                    <Package className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-black tracking-tight">Products &amp; Services</h2>
                    <span className="text-xs font-medium text-muted-foreground ml-auto">{products.length} item{products.length !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {products.map((p) => (
                      <div
                        key={p.id}
                        className="group rounded-2xl border border-border/60 bg-card overflow-hidden hover:shadow-md transition-shadow duration-300"
                      >
                        {p.imageUrl && (
                          <div className="aspect-video overflow-hidden">
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="font-bold text-sm leading-tight">{p.name}</h3>
                            <span className="shrink-0 font-mono font-black text-primary text-sm">
                              SLE {p.price.toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                          <Badge variant="secondary" className="mt-2 text-[9px] uppercase tracking-wider">{p.category}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {products.length === 0 && (
                <div className="mt-8 rounded-2xl border border-dashed border-border/40 bg-secondary/10 p-8 text-center">
                  <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No products listed yet.</p>
                </div>
              )}
            </div>

            {/* ── COL 3: Sticky Action Box ──────────────────── */}
            <div className="lg:sticky lg:top-24">
              {/* Amazon-style buy box */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-lg space-y-4">
                {/* Commission */}
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Earn per referral</p>
                  <p className="text-3xl font-black mt-0.5">{biz.commissionPct}<span className="text-lg">%</span></p>
                  <p className="text-xs text-accent font-semibold flex items-center gap-1 mt-0.5">
                    <Zap className="h-3.5 w-3.5 fill-accent" /> Orange Money payout
                  </p>
                </div>

                {/* "In Stock" equivalent */}
                <p className="text-accent font-semibold text-sm">Available for referral</p>

                {/* CTA buttons */}
                <div className="space-y-2.5">
                  <ReferralActions
                    businessId={biz.id}
                    businessName={biz.name}
                    commissionPct={biz.commissionPct}
                  />
                </div>

                <div className="border-t border-border/50 pt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-accent shrink-0" />
                    <span>Paid via Orange Money</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>Instant commission tracking</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <RotateCcw className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span>30-day referral window</span>
                  </div>
                  {biz.verified && (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-accent shrink-0" />
                      <span>Verified by RefLink SL</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats below buy box */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatBox label="Commission" value={`${biz.commissionPct}%`} />
                <StatBox label="City" value={biz.city} />
                <StatBox label="Status" value={biz.verified ? "Verified" : "Pending"} />
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-3 text-center">
      <p className="text-[9px] uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
      <p className="mt-1 text-sm font-black truncate">{value}</p>
    </div>
  )
}

function commaNum(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 })
}
