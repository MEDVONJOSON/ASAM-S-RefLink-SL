"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, Play, ShieldCheck, Wallet, Users, TrendingUp, CheckCircle2 } from "lucide-react"

export function HeroActions() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="mt-7 flex flex-wrap gap-3">
        {/* Enter the App */}
        <Button asChild size="lg" className="gap-2 rounded-full px-7 shadow-md shadow-primary/30">
          <Link href="/signup">
            <Download className="h-4 w-4" />
            Enter the App
          </Link>
        </Button>

        {/* Watch Demo */}
        <Button
          size="lg"
          variant="outline"
          onClick={() => setOpen(true)}
          className="gap-2 rounded-full px-7"
        >
          <Play className="h-4 w-4 fill-current" />
          Watch Demo
        </Button>
      </div>

      {/* Watch Demo Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 md:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary-foreground md:text-2xl">
                How RefLink SL Works
              </DialogTitle>
              <p className="mt-1 text-sm text-primary-foreground/80">
                See how referrers earn, businesses grow, and customers find trusted services.
              </p>
            </DialogHeader>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {/* Step-by-step demo */}
            <ol className="space-y-4">
              {[
                {
                  step: "01",
                  icon: ShieldCheck,
                  title: "Business lists for free",
                  body: "A hotel, plumber, or caterer signs up, gets verified by RefLink SL — no upfront cost.",
                  color: "bg-accent/10 text-accent",
                },
                {
                  step: "02",
                  icon: Users,
                  title: "Referrer shares a unique code",
                  body: "Trained youth referrers generate a short code and share via WhatsApp, social media, or in-person.",
                  color: "bg-primary/10 text-primary",
                },
                {
                  step: "03",
                  icon: CheckCircle2,
                  title: "Customer buys & mentions code",
                  body: "The customer contacts the business, completes a purchase, and mentions the referral code.",
                  color: "bg-accent/10 text-accent",
                },
                {
                  step: "04",
                  icon: Wallet,
                  title: "Referrer earns 80% via Orange Money",
                  body: "On confirmation the commission is split: 80% to the referrer, 20% to the platform — paid instantly.",
                  color: "bg-primary/10 text-primary",
                },
              ].map(({ step, icon: Icon, title, body, color }) => (
                <li key={step} className="flex items-start gap-4">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${color} font-mono text-xs font-bold`}>
                    {step}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <p className="font-semibold text-sm">{title}</p>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>

            {/* Example earnings */}
            <div className="rounded-xl border border-border/70 bg-secondary/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Example payout</p>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                {[
                  { label: "Sale amount", value: "SLE 4,500,000" },
                  { label: "Commission (8%)", value: "SLE 360,000" },
                  { label: "Referrer earns 80%", value: "SLE 288,000", highlight: true },
                  { label: "Platform 20%", value: "SLE 72,000" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`rounded-lg p-3 ${item.highlight ? "bg-primary/10" : "bg-secondary/60"}`}
                  >
                    <p className={`text-xs ${item.highlight ? "text-primary" : "text-muted-foreground"}`}>{item.label}</p>
                    <p className={`mt-1 font-mono font-semibold ${item.highlight ? "text-primary" : ""}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild className="rounded-full gap-2" onClick={() => setOpen(false)}>
                <Link href="/signup">
                  <Download className="h-4 w-4" /> Enter the App — it&apos;s free
                </Link>
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
