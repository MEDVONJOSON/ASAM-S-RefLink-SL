import { redirect } from "next/navigation"

export const metadata = { title: "Get Started" }

/**
 * Legacy signup URL — redirects to the new unified /get-started page.
 * This keeps existing external links working.
 */
export default async function SignupRedirectPage({ searchParams }: { searchParams: Promise<{ role?: string }> }) {
  const sp = await searchParams
  const params = new URLSearchParams()
  if (sp?.role) params.set("role", sp.role)
  const target = params.toString() ? `/get-started?${params.toString()}` : "/get-started"
  redirect(target)
}
