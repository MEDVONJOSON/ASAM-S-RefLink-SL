"use client"

import Link from "next/link"
import useSWR from "swr"
import { useMemo } from "react"
import type { SafeUser } from "@/lib/types"
import { EditProfileModal } from "./edit-profile-modal"
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
import { ShoppingBag, Store, Wallet, Sparkles } from "lucide-react"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function ClientDashboard({ user }: { user: SafeUser }) {
  const { data: salesData } = useSWR<{ sales: any[] }>("/api/sales", fetcher)
  const sales = salesData?.sales ?? []

  const stats = useMemo(() => {
    const confirmed = sales.filter((s) => s.status === "confirmed")
    const totalSpent = confirmed.reduce((s, x) => s + (x.amount ?? 0), 0)
    return { totalPurchases: sales.length, confirmed: confirmed.length, totalSpent }
  }, [sales])

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Client dashboard</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">
            Hi {user.name.split(" ")[0]} — welcome back.
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="gap-1.5 h-7">
            <Sparkles className="h-3 w-3" /> Client account
          </Badge>
          <EditProfileModal user={user} />
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total purchases" value={String(stats.totalPurchases)} icon={ShoppingBag} accent />
        <StatCard label="Confirmed" value={String(stats.confirmed)} icon={Sparkles} />
        <StatCard label="Total spent" value={`SLE ${stats.totalSpent.toLocaleString()}`} icon={Wallet} />
      </div>

      <Card className="mt-8 glass-card border-white/10 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Your purchase history</CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href="/businesses">
              <Store className="mr-1.5 h-3.5 w-3.5" /> Browse businesses
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {sales.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>No purchases yet</EmptyTitle>
                <EmptyDescription>
                  When a business reports a sale using your phone number, it will show up here.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild><Link href="/businesses">Browse businesses</Link></Button>
              </EmptyContent>
            </Empty>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.businessName}</TableCell>
                      <TableCell className="text-right font-mono">SLE {s.amount.toLocaleString()}</TableCell>
                      <TableCell>
                        <StatusBadge status={s.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(s.createdAt).toLocaleDateString()}
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

function StatusBadge({ status }: { status: string }) {
  if (status === "confirmed") return <Badge className="bg-accent text-accent-foreground hover:bg-accent">Confirmed</Badge>
  if (status === "pending") return <Badge variant="outline">Pending</Badge>
  return <Badge variant="destructive">Rejected</Badge>
}
