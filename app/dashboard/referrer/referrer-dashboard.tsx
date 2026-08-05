"use client"

import Link from "next/link"
import useSWR from "swr"
import { useMemo } from "react"
import type { SafeUser } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { GraduationCap, Wallet, Link as LinkIcon, Copy, Sparkles, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { EditProfileModal } from "./edit-profile-modal"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ReferrerDashboard({ user }: { user: SafeUser }) {
  const { data: linksData, mutate: refreshLinks } = useSWR<{ links: any[] }>("/api/referrals", fetcher)
  const { data: salesData, mutate: refreshSales } = useSWR<{ sales: any[] }>("/api/sales", fetcher)

  const links = linksData?.links ?? []
  const sales = salesData?.sales ?? []

  const stats = useMemo(() => {
    const totalLinks = links.length
    const totalClicks = links.reduce((s, l) => s + (l.clicks ?? 0), 0)
    const confirmed = sales.filter((s) => s.status === "confirmed")
    const pending = sales.filter((s) => s.status === "pending")
    const totalEarned = confirmed.reduce((s, x) => s + (x.referrerEarning ?? 0), 0)
    const pendingEarn = pending.reduce((s, x) => s + (x.referrerEarning ?? 0), 0)
    return { totalLinks, totalClicks, totalEarned, pendingEarn, sales: sales.length }
  }, [links, sales])

  async function completeTraining() {
    const res = await fetch("/api/referrer/training", { method: "POST" })
    if (res.ok) {
      toast.success("Training complete! You're now a certified referrer.")
      window.location.reload()
    }
  }

  const trained = user.trainingCompleted

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          {user.imageUrl ? (
            <img src={user.imageUrl} alt={user.name} className="h-14 w-14 rounded-full object-cover border border-white/20" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/20 bg-primary/10 text-xl font-bold text-primary">
              {user.name[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Referrer dashboard</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
              Hi {user.name.split(" ")[0]} — let&apos;s earn.
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <EditProfileModal user={user} />
          <Badge variant="outline" className="gap-1.5 w-fit">
            <Sparkles className="h-3 w-3" /> ASAM&apos;S Code: <span className="font-mono">{user.registeredReferrerCode || user.referrerCode}</span>
          </Badge>
        </div>
      </header>

      {!trained && (
        <Card className="mt-6 border-primary/40 bg-primary/5 glass-card shadow-lg shadow-primary/5">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="h-6 w-6 text-primary" />
              <div>
                <p className="font-semibold">Complete your free training</p>
                <p className="text-sm text-muted-foreground">
                  Get certified and unlock higher trust with businesses.
                </p>
              </div>
            </div>
            <Button onClick={completeTraining}>Mark training complete</Button>
          </CardContent>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total earned" value={`SLE ${stats.totalEarned.toLocaleString()}`} icon={Wallet} accent />
        <StatCard label="Pending payouts" value={`SLE ${stats.pendingEarn.toLocaleString()}`} icon={TrendingUp} />
        <StatCard label="Active links" value={String(stats.totalLinks)} icon={LinkIcon} />
        <StatCard label="Total clicks" value={String(stats.totalClicks)} icon={Sparkles} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 glass-card border-white/10 shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Your referral links</CardTitle>
            <Button asChild size="sm" variant="outline">
              <Link href="/businesses">+ Generate new</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {links.length === 0 ? (
              <Empty>
                <EmptyHeader>
                  <EmptyTitle>No referral links yet</EmptyTitle>
                  <EmptyDescription>
                    Browse the directory and generate a link for any verified business.
                  </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                  <Button asChild><Link href="/businesses">Browse businesses</Link></Button>
                </EmptyContent>
              </Empty>
            ) : (
              <div className="space-y-3">
                {links.map((l) => {
                  const url = typeof window !== "undefined" ? `${window.location.origin}/r/${l.code}` : `/r/${l.code}`
                  return (
                    <div key={l.id} className="rounded-lg border border-white/10 glass p-4 transition-all hover:bg-secondary/40">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold">{l.businessName}</p>
                          <p className="text-xs text-muted-foreground">{l.businessCity} · {l.clicks} clicks</p>
                        </div>
                        <Badge variant="outline" className="font-mono">{l.code}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <code className="flex-1 truncate rounded bg-background px-2 py-1 text-xs">{url}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            navigator.clipboard.writeText(url)
                            toast.success("Link copied")
                          }}
                        >
                          <Copy className="mr-1 h-3.5 w-3.5" /> Copy
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 glass-card border-white/10 shadow-md">
          <CardHeader>
            <CardTitle className="text-base">Earnings detail</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <Row label="Confirmed sales" value={String(sales.filter((s) => s.status === "confirmed").length)} />
              <Row label="Pending sales" value={String(sales.filter((s) => s.status === "pending").length)} />
              <Row label="Rejected sales" value={String(sales.filter((s) => s.status === "rejected").length)} />
              <Row label="Orange Money" value={user.orangeMoneyNumber || user.phone || "—"} mono />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 glass-card border-white/10 shadow-md">
        <CardHeader>
          <CardTitle className="text-base">Recent sales</CardTitle>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sales yet. Share your links to start earning.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Sale</TableHead>
                    <TableHead className="text-right">Your earning</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.businessName}</TableCell>
                      <TableCell className="text-muted-foreground">{s.customerName}</TableCell>
                      <TableCell className="text-right font-mono">SLE {s.amount.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono font-semibold text-primary">
                        SLE {s.referrerEarning.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string; icon: any; accent?: boolean }) {
  return (
    <Card className="glass-card border-white/10 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className={`mt-1 text-xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
          </div>
          <span className={`flex h-8 w-8 items-center justify-center rounded-md ${accent ? "bg-primary/10 text-primary" : "bg-secondary"}`}>
            <Icon className="h-4 w-4" />
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-1.5 last:border-none">
      <span className="text-muted-foreground">{label}</span>
      <span className={mono ? "font-mono" : "font-semibold"}>{value}</span>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") return <Badge className="bg-accent text-accent-foreground hover:bg-accent">Confirmed</Badge>
  if (status === "pending") return <Badge variant="outline">Pending</Badge>
  return <Badge variant="destructive">Rejected</Badge>
}
