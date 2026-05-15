import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { SignupForm } from "./signup-form"
import Link from "next/link"

export const metadata = { title: "Create your account" }

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const sp = await searchParams
  const initialRole = sp?.role === "business" ? "business" : "referrer"
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl">
          <div className="rounded-2xl border border-border/70 bg-card p-6 md:p-8">
            <h1 className="text-2xl font-bold tracking-tight">Create your RefLink SL account</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Free forever. Choose how you want to use the platform.
            </p>
            <SignupForm initialRole={initialRole} />
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
