import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { BusinessCard } from "@/components/business-card"
import { HeroActions } from "./hero-actions"
import { listBusinesses, listProducts } from "@/lib/data"
import {
  ArrowRight,
  ShieldCheck,
  Handshake,
  Wallet,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Phone,
  Sparkles,
  Smartphone,
} from "lucide-react"

export const dynamic = "force-dynamic"

export default async function LandingPage() {
  const featured = await listBusinesses({ verifiedOnly: true, take: 4 })
  const products = await listProducts({ approvedOnly: true, take: 4 })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative min-h-[640px] overflow-hidden border-b border-border/60 bg-background pt-8">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float dark:opacity-10 dark:mix-blend-color-burn" />
          <div className="absolute top-0 -right-4 w-96 h-96 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float dark:opacity-10 dark:mix-blend-color-burn" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-secondary rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float dark:opacity-10 dark:mix-blend-color-burn" style={{ animationDelay: '4s' }} />

          <div className="container mx-auto grid gap-10 px-4 py-16 md:grid-cols-2 md:gap-8 md:py-24 relative z-10">
            <div className="flex flex-col justify-center animate-fade-in-up">
              <Badge variant="outline" className="mb-5 w-fit gap-1.5 border-primary/30 bg-primary/10 text-primary px-3 py-1 text-sm rounded-full">
                <Sparkles className="h-4 w-4" /> Pay-per-result, no upfront fees
              </Badge>
              <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
                Sierra Leone&apos;s referral network. <span className="text-primary">Pay only when you earn.</span>
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground md:text-lg leading-relaxed">
                ASAM&apos;S REFLINK SL connects small businesses, trained youth referrers, and customers in one trusted
                platform. Businesses list for free, referrers earn on every confirmed sale, customers find
                verified services.
              </p>
              <HeroActions />
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-accent" />
                  Verified businesses
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-accent" />
                  Orange Money payouts
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-accent" />
                  Trained youth referrers
                </div>
              </div>
            </div>

            {/* Visual: deal/commission card mock */}
            <div className="relative lg:ml-auto animate-fade-in-up opacity-0" style={{ animationDelay: '0.3s' }}>
              <div className="relative mx-auto max-w-md rounded-3xl border border-white/20 glass-card p-6 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-transform hover:scale-[1.02] duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Sale confirmed</p>
                    <p className="mt-1 font-bold text-foreground">Cape Sierra Hotel · Weekend booking</p>
                  </div>
                  <Badge className="bg-accent text-accent-foreground hover:bg-accent px-2 py-1 rounded-full">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Paid
                  </Badge>
                </div>
                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-2xl glass p-4 border border-white/10">
                    <p className="text-xs text-muted-foreground font-medium">Sale amount</p>
                    <p className="mt-1 font-mono font-bold text-lg">SLE 4,500,000</p>
                  </div>
                  <div className="rounded-2xl glass p-4 border border-white/10">
                    <p className="text-xs text-muted-foreground font-medium">Commission (8%)</p>
                    <p className="mt-1 font-mono font-bold text-lg">SLE 360,000</p>
                  </div>
                  <div className="rounded-2xl bg-primary/15 p-4 border border-primary/20">
                    <p className="text-xs text-primary font-bold tracking-wide">Referrer earns 80%</p>
                    <p className="mt-1 font-mono font-bold text-primary text-lg">SLE 288,000</p>
                  </div>
                  <div className="rounded-2xl bg-accent/15 p-4 border border-accent/20">
                    <p className="text-xs text-accent font-bold tracking-wide">Platform 20%</p>
                    <p className="mt-1 font-mono font-bold text-accent text-lg">SLE 72,000</p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-3 rounded-xl border border-dashed border-border/80 bg-secondary/30 p-4 text-xs text-muted-foreground font-medium">
                  <Phone className="h-4 w-4 text-primary" />
                  Sent to Orange Money: +232 78 ••• 374
                </div>
              </div>
              <div
                aria-hidden
                className="absolute -bottom-6 -right-4 hidden rotate-3 rounded-xl border border-border/70 bg-card p-3 shadow-lg sm:block"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    MS
                  </span>
                  <div>
                    <p className="font-medium">Mohamed referred a guest</p>
                    <p className="text-[10px] text-muted-foreground">2 minutes ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee Banner */}
        <section className="bg-primary py-4 overflow-hidden flex items-center shadow-inner relative z-20 border-y border-white/10">
          <div className="flex animate-marquee hover:[animation-play-state:paused] w-max">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-10 px-5">
                <div className="flex items-center gap-2 text-primary-foreground font-bold tracking-wider text-sm md:text-base whitespace-nowrap">
                  <ShieldCheck className="h-5 w-5 opacity-90" /> 0 UPFRONT FEES
                </div>
                <div className="w-1.5 h-1.5 rotate-45 bg-accent opacity-50" />
                <div className="flex items-center gap-2 text-primary-foreground font-bold tracking-wider text-sm md:text-base whitespace-nowrap">
                  <Smartphone className="h-5 w-5 opacity-90" /> iOS • ANDROID • WEB
                </div>
                <div className="w-1.5 h-1.5 rotate-45 bg-accent opacity-50" />
                <div className="flex items-center gap-2 text-primary-foreground font-bold tracking-wider text-sm md:text-base whitespace-nowrap">
                  <Sparkles className="h-5 w-5 opacity-90" /> PAY ONLY FOR RESULTS
                </div>
                <div className="w-1.5 h-1.5 rotate-45 bg-accent opacity-50" />
                <div className="flex items-center gap-2 text-primary-foreground font-bold tracking-wider text-sm md:text-base whitespace-nowrap">
                  <Handshake className="h-5 w-5 opacity-90" /> VERIFIED BUSINESSES
                </div>
                <div className="w-1.5 h-1.5 rotate-45 bg-accent opacity-50" />
                <div className="flex items-center gap-2 text-primary-foreground font-bold tracking-wider text-sm md:text-base whitespace-nowrap">
                  <Wallet className="h-5 w-5 opacity-90" /> INSTANT PAYOUTS
                </div>
                <div className="w-1.5 h-1.5 rotate-45 bg-accent opacity-50" />
                <div className="flex items-center gap-2 text-primary-foreground font-bold tracking-wider text-sm md:text-base whitespace-nowrap">
                  <TrendingUp className="h-5 w-5 opacity-90" /> SIERRA LEONE'S #1 NETWORK
                </div>
                <div className="w-1.5 h-1.5 rotate-45 bg-accent opacity-50" />
              </div>
            ))}
          </div>
        </section>

        {/* Stats / problem framing */}
        <section className="relative border-y border-white/10 bg-secondary/40 py-16">
          <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
            {[
              { n: "80%", l: "of SL employment is small business", d: "0.1s" },
              { n: "60%+", l: "of youth unemployed or underemployed", d: "0.2s" },
              { n: "0", l: "upfront fees for businesses", d: "0.3s" },
              { n: "80/20", l: "split — referrer keeps the majority", d: "0.4s" },
            ].map((s) => (
              <div key={s.l} className="animate-fade-in-up opacity-0" style={{ animationDelay: s.d }}>
                <p className="text-4xl font-black tracking-tighter text-primary md:text-5xl lg:text-6xl">{s.n}</p>
                <p className="mt-3 text-sm text-muted-foreground font-medium md:text-base">{s.l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Problem vs Solution */}
        <section id="how-it-works" className="container mx-auto px-4 py-16 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="mb-4">The problem &rarr; the fix</Badge>
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Word of mouth, but structured, verifiable, and paid.
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
              Today, businesses pay for ads that may never deliver. Customers can&apos;t find trustworthy
              providers. Youth refer people daily — for free. ASAM&apos;S REFLINK SL fixes all three.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3 max-w-5xl mx-auto">
            {[
              {
                icon: Handshake,
                image: "/businesses/real-estate.png",
                title: "Free for businesses",
                copy: "List your services with verification, photos, and access to trained referrers. No registration or monthly fees.",
                pay: "Pay 5–15% only on confirmed sales.",
              },
              {
                icon: Wallet,
                image: "/images/youth_income.png",
                title: "Real income for youth",
                copy: "Get a unique referral code, training, and certification. When someone you refer buys, you get paid via Orange Money.",
                pay: "Referrer keeps 80% of every commission.",
              },
              {
                icon: ShieldCheck,
                image: "/businesses/boutique.png",
                title: "Trust for customers",
                copy: "Browse verified businesses across Freetown, Bo and Kenema. Check ratings, contact owners, get recommendations.",
                pay: "Customers pay normal prices — never extra.",
              },
            ].map(({ icon: Icon, image, title, copy, pay }, i) => (

              <div key={title} className="group overflow-hidden rounded-xl border border-white/10 glass-card flex flex-col transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg animate-fade-in-up opacity-0" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="relative h-44 w-full overflow-hidden bg-muted">
                  <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-2 left-3 flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-base font-bold tracking-tight">{title}</h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed flex-1">{copy}</p>
                  <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-secondary/80 px-2.5 py-1.5 text-[10px] font-medium group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <CheckCircle2 className="h-3 w-3 text-accent" />
                    {pay}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works steps */}
        <section className="border-y border-border/60 bg-secondary/30">
          <div className="container mx-auto px-4 py-16 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
                How a single referral works
              </h2>
            </div>
            <ol className="mt-12 grid gap-5 md:grid-cols-4 max-w-6xl mx-auto">
              {[
                {
                  step: "01",
                  image: "/images/step1_verify.png",
                  title: "Business lists for free",
                  body: "A hotel, plumber or caterer signs up and gets verified.",
                },
                {
                  step: "02",
                  image: "/images/step2_share.png",
                  title: "Referrer shares a code",
                  body: "Trained youth referrers send a unique link or short code.",
                },
                {
                  step: "03",
                  image: "/images/step3_buy.png",
                  title: "Customer buys",
                  body: "The customer contacts the business and completes a purchase.",
                },
                {
                  step: "04",
                  image: "/images/step4_earn.png",
                  title: "Everyone gets paid",
                  body: "On confirmation, commission is split 80/20 — paid via Orange Money.",
                },
              ].map((s, i) => (
                <li key={s.step} className="group overflow-hidden rounded-xl bg-card border border-border/50 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-lg animate-fade-in-up opacity-0 flex flex-col" style={{ animationDelay: `${i * 0.15}s` }}>
                  <div className="relative h-44 w-full overflow-hidden bg-muted">
                    <img src={s.image} alt={s.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <p className="absolute bottom-3 left-4 font-sans text-2xl font-bold text-white/90 z-10">{s.step}</p>
                  </div>
                  <div className="p-4 flex-1 flex flex-col relative z-10 bg-card">
                    <h3 className="text-base font-bold tracking-tight">{s.title}</h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed font-medium">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Featured businesses */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Badge variant="outline" className="mb-3">Verified directory</Badge>
              <h2 className="text-3xl font-bold tracking-tight">Featured businesses</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Real Sierra Leonean businesses ready to receive referrals.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/businesses">
                View all <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>

        {/* Marketplace Spotlight (Products) */}
        {products.length > 0 && (
          <section className="bg-secondary/20 border-y border-white/5 py-16">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <Badge className="mb-3 bg-primary/10 text-primary border-primary/20">Now Live</Badge>
                  <h2 className="text-3xl font-bold tracking-tight text-balance">Marketplace Spotlight</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Direct products and services you can refer today.
                  </p>
                </div>
              </div>

              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    href={`/businesses/${p.businessId}`}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    {p.imageUrl && (
                      <div className="aspect-square overflow-hidden bg-muted">
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">{p.name}</h3>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-2 flex-1">{p.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="font-mono font-bold text-primary text-sm">SLE {p.price.toLocaleString()}</span>
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Comparison */}
        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
              Why this beats traditional advertising
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 glass p-8 shadow-sm transition-all duration-300 hover:shadow-md">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Traditional ads</p>
              <ul className="mt-6 space-y-4">
                {[
                  "Pay Le 5,000,000 upfront with no guarantee",
                  "Walk-in customers only",
                  "No way to verify trust",
                  "Youth excluded from the value chain",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-base text-muted-foreground font-medium">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive/80" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border border-primary/30 bg-primary/10 p-8 shadow-[0_0_40px_rgba(var(--color-primary),0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_50px_rgba(var(--color-primary),0.2)]">
              <p className="text-sm font-bold uppercase tracking-widest text-primary">ASAM&apos;S REFLINK SL</p>
              <ul className="mt-6 space-y-4">
                {[
                  "Zero upfront — only pay on confirmed sales",
                  "Trained referrers actively bring customers",
                  "Verified profiles build customer trust",
                  "Youth earn real income via Orange Money",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-base font-semibold text-foreground">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 py-16">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary to-primary/80 p-6 md:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-20"
              style={{
                background:
                  "radial-gradient(60% 60% at 100% 0%, white, transparent 60%), radial-gradient(40% 40% at 0% 100%, white, transparent 60%)",
              }}
            />
            <div className="relative grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h2 className="text-balance text-2xl font-bold leading-tight text-primary-foreground md:text-3xl">
                  Real impact for real people. <span className="opacity-80">Start in minutes.</span>
                </h2>
                <p className="mt-2 max-w-lg text-sm text-primary-foreground/90 leading-relaxed">
                  Join the network that&apos;s turning informal recommendations into a structured
                  Sierra Leonean economy.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild size="sm" variant="secondary" className="h-10 px-5 rounded-xl text-xs font-bold">
                    <Link href="/signup?role=referrer">
                      <TrendingUp className="mr-1.5 h-3.5 w-3.5" /> Become a referrer
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className="bg-background text-foreground hover:bg-background/90 h-10 px-5 rounded-xl text-xs font-bold"
                  >
                    <Link href="/signup?role=business">List a business</Link>
                  </Button>
                </div>
              </div>

              {/* Spread side-by-side images transition */}
              <div className="hidden lg:block relative w-full h-44 overflow-hidden rounded-2xl border border-white/20 bg-black/10 shadow-lg">
                <div className="flex animate-marquee h-full w-[200%]">
                  <img src="/images/cta_strip.png" className="h-full w-1/2 object-cover" alt="Impact Showcase" />
                  <img src="/images/cta_strip.png" className="h-full w-1/2 object-cover" alt="Impact Showcase" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/10 pointer-events-none" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
