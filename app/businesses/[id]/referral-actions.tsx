"use client"

import Link from "next/link"
import { useState } from "react"
import { useUser } from "@/lib/use-user"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Copy, Link as LinkIcon, Share2, Sparkles } from "lucide-react"
import { toast } from "sonner"

export function ReferralActions({
  businessId,
  businessName,
  commissionPct,
}: {
  businessId: string
  businessName: string
  commissionPct: number
}) {
  const { user, isLoading } = useUser()
  const [code, setCode] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)

  async function generate() {
    if (!user) return
    setGenerating(true)
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to generate referral link")
      setCode(data.link.code)
      toast.success("Referral link ready! Share it with potential customers.")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setGenerating(false)
    }
  }

  const link = code && typeof window !== "undefined" ? `${window.location.origin}/r/${code}` : null

  return (
    <Card className="sticky top-20 self-start border-primary/30 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-primary" /> Refer this business
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground leading-relaxed">
          Share your unique link. When a sale happens, you earn{" "}
          <span className="font-semibold text-primary">
            {(commissionPct * 0.8).toFixed(1)}% of every sale
          </span>{" "}
          paid via Orange Money.
        </p>

        {isLoading ? (
          <div className="h-9 animate-pulse rounded bg-secondary" />
        ) : !user ? (
          <div className="space-y-2">
            <Button asChild className="w-full">
              <Link href="/signup?role=referrer">Sign up as a referrer</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/login">I already have an account</Link>
            </Button>
          </div>
        ) : user.role !== "referrer" ? (
          <div className="rounded-md bg-secondary/60 p-3 text-xs text-muted-foreground">
            Only referrer accounts can generate links. Sign in with a referrer account to refer businesses.
          </div>
        ) : !link ? (
          <Button onClick={generate} disabled={generating} className="w-full">
            <LinkIcon className="mr-1.5 h-4 w-4" />
            {generating ? "Generating…" : "Generate referral link"}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border bg-card p-3">
              <p className="text-xs text-muted-foreground">Your referral link for {businessName}</p>
              <p className="mt-1 break-all font-mono text-xs text-foreground">{link}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(link)
                  toast.success("Link copied")
                }}
              >
                <Copy className="mr-1.5 h-4 w-4" /> Copy
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (navigator.share) {
                    navigator
                      .share({ title: businessName, text: `Check out ${businessName}`, url: link })
                      .catch(() => {})
                  } else {
                    navigator.clipboard.writeText(link)
                    toast.success("Link copied")
                  }
                }}
              >
                <Share2 className="mr-1.5 h-4 w-4" /> Share
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Code: <span className="font-mono font-semibold text-foreground">{code}</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
