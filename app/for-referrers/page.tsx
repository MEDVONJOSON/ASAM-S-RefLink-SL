import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Wallet, Users, CheckCircle2 } from "lucide-react"

export const metadata = { title: "For Referrers" }

export default function ForReferrersPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/10">
          <div className="container mx-auto max-w-4xl px-4 py-16">
            <Badge variant="outline" className="mb-4">For referrers</Badge>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Earn real income from the people you already know.
            </h1>
            <p className="mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
              You already recommend a hotel, a mechanic, or a caterer to friends. RefLink SL turns
              those recommendations into income — paid on Orange Money, every time.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/get-started?role=referrer">Get started — it&apos;s free</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/businesses">Browse businesses</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-5xl px-4 py-14">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: GraduationCap, title: "Free training & certification", body: "Learn the right way to refer, present and close. Get certified within hours." },
              { icon: Users, title: "Verified businesses only", body: "Refer with confidence — every business is verified by RefLink SL." },
              { icon: Wallet, title: "Orange Money payouts", body: "Earn 80% of every commission. Paid out instantly to your mobile money." },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-border/70 bg-card p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-14 rounded-2xl border border-border/70 bg-secondary/30 p-6 md:p-8">
            <h2 className="text-2xl font-bold">Example earnings</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Different commissions and sale sizes mean different payouts. Here are some examples.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                { biz: "Wedding catering — Le 6,000,000", c: 12, take: 576_000 },
                { biz: "Hotel weekend — Le 4,500,000", c: 8, take: 288_000 },
                { biz: "Plumbing repair — Le 800,000", c: 15, take: 96_000 },
              ].map((x) => (
                <div key={x.biz} className="rounded-xl border border-border/70 bg-card p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{x.biz}</p>
                  <p className="mt-2 text-lg font-bold text-primary">SLE {x.take.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">at {x.c}% commission · 80% to you</p>
                </div>
              ))}
            </div>
            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> No registration fees, ever.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Refer as many businesses as you want.</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" /> Paid to your Orange Money once each sale is confirmed.</li>
            </ul>
            <Button asChild className="mt-6"><Link href="/get-started?role=referrer">Start earning</Link></Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
