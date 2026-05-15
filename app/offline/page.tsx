import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { WifiOff } from "lucide-react"

export const metadata = { title: "You're offline" }

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="text-center">
          <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
            <WifiOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">You&apos;re offline</h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            RefLink SL needs an internet connection to load the latest businesses and confirm sales.
            We&apos;ll reconnect automatically.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
