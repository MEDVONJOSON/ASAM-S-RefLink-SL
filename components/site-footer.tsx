import Link from "next/link"
import { Logo } from "./logo"

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-secondary/50 dark:bg-card/50">
      <div className="container mx-auto px-4 py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-muted-foreground text-pretty">
              Sierra Leone&apos;s pay-per-result referral network. Built and operated by{" "}
              <strong className="text-primary">ASAM&apos;S REFLINK SL</strong>.
              We deliver customers first, and only earn when you earn.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/businesses" className="hover:text-primary">Browse businesses</Link></li>
              <li><Link href="/how-it-works" className="hover:text-primary">How it works</Link></li>
              <li><Link href="/for-referrers" className="hover:text-primary">For referrers</Link></li>
              <li><Link href="/get-started" className="hover:text-primary">Create account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>+232 78 678374</li>
              <li>asesay5170@gmail.com</li>
              <li>Freetown · Bo · Kenema</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ASAM&apos;S REFLINK SL. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <p>Powered by Alimzo Services &amp; Marketing</p>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Login</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
