import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { GetStartedForm } from "./get-started-form"
import Link from "next/link"

export const metadata = { title: "Get Started — RefLink SL" }

export default async function GetStartedPage({ searchParams }: { searchParams: Promise<{ role?: string; ref?: string; googleId?: string; email?: string; name?: string }> }) {
  const sp = await searchParams
  const initialRole = sp?.role === "business" ? "business" : sp?.role === "client" ? "client" : sp?.role === "referrer" ? "referrer" : undefined
  const refCode = sp?.ref || undefined
  const googleId = sp?.googleId || undefined
  const email = sp?.email || undefined
  const name = sp?.name || undefined

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl border border-border/70 bg-card p-6 md:p-8 relative overflow-hidden">
            {/* Decorative gradient blobs */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-accent rounded-full mix-blend-multiply filter blur-3xl opacity-10 dark:opacity-5" />
            
            <div className="relative z-10">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Get Started with RefLink SL</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Free forever. Choose how you want to use the platform.
              </p>
              <GetStartedForm initialRole={initialRole} refCode={refCode} googleId={googleId} email={email} name={name} />
              <p className="mt-6 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
