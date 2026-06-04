"use client"

import { useState } from "react"
import useSWR from "swr"
import type { Business, SafeUser } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { ShieldCheck, Plus, Check, X, ShieldAlert, Wallet, TrendingUp, Receipt, Package, ImagePlus } from "lucide-react"
import { toast } from "sonner"
import { ProductsTab } from "./products-tab"
import { SettingsTab } from "./settings-tab"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function BusinessDashboard({ user, business }: { user: SafeUser; business: Business }) {
  const { data: salesData, mutate: refreshSales } = useSWR<{ sales: any[] }>("/api/sales", fetcher)
  const sales = salesData?.sales ?? []

  const stats = {
    confirmed: sales.filter((s) => s.status === "confirmed").length,
    pending: sales.filter((s) => s.status === "pending").length,
    revenue: sales.filter((s) => s.status === "confirmed").reduce((s, x) => s + x.amount, 0),
    paidOut: sales
      .filter((s) => s.status === "confirmed")
      .reduce((s, x) => s + x.commissionAmount, 0),
  }

  async function updateStatus(id: string, status: "confirmed" | "rejected") {
    const res = await fetch(`/api/sales/${id}/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      toast.success(status === "confirmed" ? "Sale confirmed — referrer paid." : "Sale rejected.")
      refreshSales()
    } else {
      toast.error("Failed")
    }
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-4">
          {/* Business profile image thumbnail */}
          {business.imageUrl ? (
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-md">
              <img src={business.imageUrl} alt={business.name} className="h-full w-full object-cover" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                const settingsTab = document.getElementById("tab-settings")
                settingsTab?.click()
              }}
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-secondary/50 hover:border-primary/40 hover:bg-primary/5 transition-colors text-muted-foreground hover:text-primary"
              title="Upload your business profile image"
            >
              <ImagePlus className="h-6 w-6" />
            </button>
          )}
          <div>
            <p className="text-sm text-muted-foreground">Business dashboard</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">{business.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{business.category} · {business.city}</p>
          </div>
        </div>
        {business.verified ? (
          <Badge className="gap-1 bg-accent text-accent-foreground hover:bg-accent">
            <ShieldCheck className="h-3.5 w-3.5" /> Verified
          </Badge>
        ) : (
          <Badge variant="outline" className="gap-1 border-amber-400 text-amber-600">
            <ShieldAlert className="h-3.5 w-3.5" /> Awaiting verification
          </Badge>
        )}
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Confirmed sales" value={String(stats.confirmed)} icon={Check} accent />
        <StatCard label="Pending review" value={String(stats.pending)} icon={Receipt} />
        <StatCard label="Revenue earned" value={`SLE ${stats.revenue.toLocaleString()}`} icon={TrendingUp} />
        <StatCard label="Commission paid" value={`SLE ${stats.paidOut.toLocaleString()}`} icon={Wallet} />
      </div>

      <Tabs defaultValue="sales" className="mt-8">
        <TabsList>
          <TabsTrigger value="sales">
            <Receipt className="h-4 w-4 mr-1.5" /> Sales
          </TabsTrigger>
          <TabsTrigger value="products" id="tab-products">
            <Package className="h-4 w-4 mr-1.5" /> My Products
          </TabsTrigger>
          <TabsTrigger value="settings" id="tab-settings">
            <ShieldCheck className="h-4 w-4 mr-1.5" /> Settings
          </TabsTrigger>
        </TabsList>

        {/* ── Sales Tab ── */}
        <TabsContent value="sales">
          <div className="mt-4 grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 glass-card border-white/10 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Sales referred to you</CardTitle>
                <ReportSaleDialog onCreated={refreshSales} businessName={business.name} commissionPct={business.commissionPct} />
              </CardHeader>
              <CardContent>
                {sales.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No referrals reported yet. When a customer mentions a referral code, click
                    &quot;Report sale&quot; to record it.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Customer</TableHead>
                          <TableHead>Referrer</TableHead>
                          <TableHead>Code</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead className="text-right">Commission</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sales.map((s) => (
                          <TableRow key={s.id}>
                            <TableCell className="font-medium">
                              {s.customerName}
                              <span className="block text-xs text-muted-foreground">{s.customerPhone}</span>
                            </TableCell>
                            <TableCell>{s.referrerName}</TableCell>
                            <TableCell><span className="font-mono text-xs">{s.referralCode}</span></TableCell>
                            <TableCell className="text-right font-mono">SLE {s.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-right font-mono">SLE {s.commissionAmount.toLocaleString()}</TableCell>
                            <TableCell>
                              {s.status === "confirmed" && <Badge className="bg-accent text-accent-foreground">Confirmed</Badge>}
                              {s.status === "pending" && <Badge variant="outline">Pending</Badge>}
                              {s.status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
                            </TableCell>
                            <TableCell className="text-right">
                              {s.status === "pending" ? (
                                <div className="flex justify-end gap-1">
                                  <Button size="sm" onClick={() => updateStatus(s.id, "confirmed")}>
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => updateStatus(s.id, "rejected")}>
                                    <X className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card border-white/10 shadow-md">
              <CardHeader>
                <CardTitle className="text-base">Listing summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <Row label="Owner" value={user.name} />
                <Row label="Address" value={`${business.address}, ${business.city}`} />
                <Row label="Phone" value={business.phone} mono />
                <Row label="Commission" value={`${business.commissionPct}%`} />
                <Row label="Status" value={business.verified ? "Verified" : "Pending verification"} />
                <p className="pt-2 text-xs text-muted-foreground">
                  Need to update your listing or change commission? Contact RefLink SL support at
                  asesay5170@gmail.com.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Products Tab ── */}
        <TabsContent value="products">
          <div className="mt-4">
            <ProductsTab businessId={business.id} />
          </div>
        </TabsContent>

        {/* ── Settings Tab ── */}
        <TabsContent value="settings">
          <SettingsTab business={business} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ReportSaleDialog({
  onCreated,
  businessName,
  commissionPct,
}: {
  onCreated: () => void
  businessName: string
  commissionPct: number
}) {
  const [open, setOpen] = useState(false)
  const [referralCode, setReferralCode] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralCode,
          customerName,
          customerPhone,
          amount: Number(amount),
          note,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to report")
      toast.success("Sale recorded as pending. Confirm to release commission.")
      setOpen(false)
      setReferralCode("")
      setCustomerName("")
      setCustomerPhone("")
      setAmount("")
      setNote("")
      onCreated()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  const expectedCommission = amount ? (Number(amount) * commissionPct) / 100 : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1 h-4 w-4" /> Report sale
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report a referred sale</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="rcode">Referral code</FieldLabel>
              <Input
                id="rcode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="ABCDEF"
                className="font-mono uppercase"
                required
              />
              <FieldDescription>The code the customer mentioned.</FieldDescription>
            </Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="cn">Customer name</FieldLabel>
                <Input id="cn" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="cp">Customer phone</FieldLabel>
                <Input id="cp" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} required />
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="amt">Sale amount (SLE)</FieldLabel>
              <Input
                id="amt"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <FieldDescription>
                {businessName} pays {commissionPct}% commission ={" "}
                <span className="font-mono font-semibold">SLE {expectedCommission.toLocaleString()}</span>
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="note">Note (optional)</FieldLabel>
              <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Record sale
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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
