import { AdminLoginForm } from "./admin-login-form"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export const metadata = { title: "Admin Login" }

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-border/70 bg-card p-6 md:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Admin Login</h1>
                <p className="text-xs text-muted-foreground">Restricted access — authorized personnel only</p>
              </div>
            </div>
            <AdminLoginForm />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
