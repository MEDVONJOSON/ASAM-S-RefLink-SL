import { notFound } from "next/navigation"
import Link from "next/link"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Phone, MapPin } from "lucide-react"
import prisma from "@/lib/db"

export const metadata = { title: "You were referred" }

export default async function ReferralLandingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params
  const link = await prisma.referralLink.update({
    where: { code: code.toUpperCase() },
    data: { clicks: { increment: 1 } },
    include: { business: true, referrer: true },
  }).catch(() => null)
  if (!link) notFound()

  const biz = link.business
  const referrer = link.referrer

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 bg-secondary/20">
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-2xl rounded-3xl border border-border/70 bg-card p-8 shadow-sm">
            <Badge className="bg-accent text-accent-foreground hover:bg-accent">
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              You&apos;ve been referred by {referrer?.name ?? "a RefLink SL referrer"}
            </Badge>
            <h1 className="mt-4 text-balance text-3xl font-bold tracking-tight md:text-4xl">
              {biz.name}
            </h1>
            <p className="mt-2 text-muted-foreground">{biz.category} · {biz.city}</p>
            <p className="mt-4 leading-relaxed text-muted-foreground">{biz.description}</p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border/70 bg-secondary/40 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Address</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm">
                  <MapPin className="h-4 w-4" /> {biz.address}, {biz.city}
                </p>
              </div>
              <div className="rounded-xl border border-border/70 bg-secondary/40 p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Phone</p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-mono">
                  <Phone className="h-4 w-4" /> {biz.phone}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4 text-sm">
              <p className="font-semibold text-primary">When you buy, mention this code:</p>
              <p className="mt-1 font-mono text-2xl font-bold tracking-widest text-foreground">
                {link.code}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                The business records the sale with this code. The referrer is paid automatically once
                the sale is confirmed.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <a href={`tel:${biz.phone.replace(/\s+/g, "")}`}>
                  <Phone className="mr-1.5 h-4 w-4" /> Call business
                </a>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/businesses/${biz.id}`}>View full profile</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/get-started?role=referrer&ref=${link.code}`}>
                  Sign up to become a referrer
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
