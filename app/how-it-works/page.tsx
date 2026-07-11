import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

export const metadata = { title: "How it works" }

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border/60 bg-secondary/30">
          <div className="container mx-auto max-w-3xl px-4 py-14">
            <Badge variant="outline" className="mb-3">How it works</Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight">
              Word of mouth, but verifiable and paid.
            </h1>
            <p className="mt-4 text-pretty text-muted-foreground leading-relaxed">
              RefLink SL turns informal referrals into a structured, trustworthy economy. Here&apos;s
              exactly how it works for businesses, referrers and customers.
            </p>
          </div>
        </section>

        <section className="container mx-auto max-w-3xl px-4 py-14 space-y-12">
          {[
            {
              role: "For Businesses",
              steps: [
                "Sign up and create your free profile (name, category, photos, location).",
                "RefLink SL verifies your business so customers know they can trust it.",
                "Trained youth referrers get a unique code for your business.",
                "When a customer buys, you record the sale & their referral code.",
                "On confirmation, you pay only an agreed 5–15% commission. Nothing more.",
              ],
            },
            {
              role: "For Referrers (especially youth)",
              steps: [
                "Sign up — no fees. Complete the free training to be certified.",
                "Browse verified businesses and generate a referral link for any of them.",
                "Share via WhatsApp, social media, or in person.",
                "When the customer buys, the business reports the sale.",
                "Once confirmed, 80% of the commission is sent to your Orange Money instantly.",
              ],
            },
            {
              role: "For Customers",
              steps: [
                "Get a recommendation through a trusted referrer.",
                "Browse the verified directory or call the business directly.",
                "Buy the product or service at the normal price — no extra charges.",
                "Mention your referral code so the youth who helped you gets rewarded.",
              ],
            },
          ].map((sec) => (
            <div key={sec.role}>
              <h2 className="text-xl font-semibold">{sec.role}</h2>
              <ol className="mt-4 space-y-3">
                {sec.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="text-sm leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <h3 className="font-semibold">The 80/20 split</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every commission a business pays is split 80% to the referrer, 20% to the platform.
              The platform fee keeps RefLink SL running — verifying businesses, training referrers,
              and processing Orange Money payouts.
            </p>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />No upfront cost for businesses</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />No registration fee for referrers</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" />Customers pay normal prices</li>
            </ul>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild><Link href="/signup?role=referrer">Become a referrer</Link></Button>
              <Button asChild variant="outline"><Link href="/signup?role=business">List your business</Link></Button>
              <Button asChild variant="outline"><Link href="/signup?role=client">Join as a customer</Link></Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
