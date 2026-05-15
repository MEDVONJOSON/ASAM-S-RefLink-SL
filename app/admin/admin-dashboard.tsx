"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import type { Business, Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShieldCheck, ShieldX, Check, X, Package, Clock, Eye } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function AdminDashboard({
  businesses,
  sales,
  products,
}: {
  businesses: Business[]
  sales: any[]
  products: Product[]
}) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)

  async function toggleVerify(b: Business) {
    setBusy(b.id)
    try {
      const res = await fetch("/api/admin/verify-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: b.id, verified: !b.verified }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed")
      }
      toast.success(b.verified ? "Verification removed" : "Business verified")
      router.refresh()
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`)
    } finally {
      setBusy(null)
    }
  }

  async function updateStatus(id: string, status: "confirmed" | "rejected") {
    setBusy(id)
    try {
      const res = await fetch(`/api/sales/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed")
      }
      toast.success(status === "confirmed" ? "Sale confirmed" : "Sale rejected")
      router.refresh()
    } catch (err: any) {
      toast.error(`Failed: ${err.message}`)
    } finally {
      setBusy(null)
    }
  }

  const verified = businesses.filter((b) => b.verified).length
  const pendingBiz = businesses.filter((b) => !b.verified).length
  const pendingSales = sales.filter((s) => s.status === "pending").length
  const pendingProducts = products.filter((p) => p.status === "pending").length

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">RefLink SL — Admin</h1>
      <p className="text-sm text-muted-foreground">Verify businesses, review products, and confirm referral sales.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Verified businesses" value={String(verified)} accent />
        <Stat label="Awaiting verification" value={String(pendingBiz)} />
        <Stat label="Pending sales" value={String(pendingSales)} />
        <Stat label="Pending products" value={String(pendingProducts)} warn={pendingProducts > 0} />
      </div>

      <Tabs defaultValue="products" className="mt-8">
        <TabsList>
          <TabsTrigger value="products" id="admin-tab-products">
            <Package className="h-4 w-4 mr-1.5" />
            Products
            {pendingProducts > 0 && (
              <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {pendingProducts}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="businesses">Businesses</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
        </TabsList>

        {/* ── Products Tab ── */}
        <TabsContent value="products">
          <AdminProductsPanel products={products} onRefresh={() => router.refresh()} />
        </TabsContent>

        {/* ── Businesses Tab ── */}
        <TabsContent value="businesses">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All businesses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {businesses.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.name}</TableCell>
                        <TableCell>{b.category}</TableCell>
                        <TableCell>{b.city}</TableCell>
                        <TableCell>{b.commissionPct}%</TableCell>
                        <TableCell>
                          {b.verified ? (
                            <Badge className="bg-accent text-accent-foreground">Verified</Badge>
                          ) : (
                            <Badge variant="outline">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={b.verified ? "outline" : "default"}
                            disabled={busy === b.id}
                            onClick={() => toggleVerify(b)}
                          >
                            {b.verified ? (
                              <><ShieldX className="mr-1 h-3.5 w-3.5" /> Unverify</>
                            ) : (
                              <><ShieldCheck className="mr-1 h-3.5 w-3.5" /> Verify</>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Sales Tab ── */}
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">All sales</CardTitle>
            </CardHeader>
            <CardContent>
              {sales.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Business</TableHead>
                        <TableHead>Referrer</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Commission</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sales.map((s) => (
                        <TableRow key={s.id}>
                          <TableCell className="font-medium">{s.businessName}</TableCell>
                          <TableCell>{s.referrerName}</TableCell>
                          <TableCell>{s.customerName}</TableCell>
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
                                <Button size="sm" disabled={busy === s.id} onClick={() => updateStatus(s.id, "confirmed")}>
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                                <Button size="sm" variant="outline" disabled={busy === s.id} onClick={() => updateStatus(s.id, "rejected")}>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Admin Products Panel ──────────────────────────────────────────────────────
function AdminProductsPanel({ products, onRefresh }: { products: Product[]; onRefresh: () => void }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [rejectTarget, setRejectTarget] = useState<Product | null>(null)
  const [rejectNote, setRejectNote] = useState("")
  const [viewTarget, setViewTarget] = useState<Product | null>(null)

  const pending = products.filter((p) => p.status === "pending")
  const reviewed = products.filter((p) => p.status !== "pending")

  async function approve(product: Product) {
    setBusy(product.id)
    try {
      const res = await fetch(`/api/admin/products/${product.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed")
      }
      toast.success(`"${product.name}" approved — now live in marketplace!`)
      onRefresh()
    } catch (err: any) {
      toast.error(`Failed to approve: ${err.message}`)
    } finally {
      setBusy(null)
    }
  }

  async function submitRejection() {
    if (!rejectTarget) return
    setBusy(rejectTarget.id)
    try {
      const res = await fetch(`/api/admin/products/${rejectTarget.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectionNote: rejectNote }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "Failed")
      }
      toast.success("Product rejected with note sent to business.")
      setRejectTarget(null)
      setRejectNote("")
      onRefresh()
    } catch (err: any) {
      toast.error(`Failed to reject: ${err.message}`)
    } finally {
      setBusy(null)
    }
  }

  return (
    <>
      {/* Pending products */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-500" />
            Pending Review
            {pending.length > 0 && (
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30">{pending.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-muted-foreground">No products awaiting review. ✓</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {p.imageUrl && (
                            <img src={p.imageUrl} alt={p.name} className="h-10 w-10 rounded-md object-cover border border-white/10 shrink-0" />
                          )}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">{p.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="text-right font-mono">SLE {p.price.toLocaleString()}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => setViewTarget(p)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 bg-emerald-600 hover:bg-emerald-700"
                            disabled={busy === p.id}
                            onClick={() => approve(p)}
                          >
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 border-red-500/30 text-red-400 hover:bg-red-500/10"
                            disabled={busy === p.id}
                            onClick={() => { setRejectTarget(p); setRejectNote("") }}
                          >
                            <X className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reviewed products */}
      {reviewed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base text-muted-foreground">Reviewed Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviewed.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{p.category}</TableCell>
                      <TableCell className="text-right font-mono">SLE {p.price.toLocaleString()}</TableCell>
                      <TableCell>
                        {p.status === "approved" && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">Approved</Badge>}
                        {p.status === "rejected" && <Badge className="bg-red-500/10 text-red-400 border-red-500/20">Rejected</Badge>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reject dialog */}
      <Dialog open={!!rejectTarget} onOpenChange={(v) => { if (!v) setRejectTarget(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Product</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mt-1">
            Rejecting <span className="font-semibold text-foreground">{rejectTarget?.name}</span>. Provide a reason so the business can fix and resubmit.
          </p>
          <Input
            className="mt-3"
            placeholder="e.g. Image is unclear, price missing details…"
            value={rejectNote}
            onChange={(e) => setRejectNote(e.target.value)}
          />
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectNote.trim() || busy === rejectTarget?.id}
              onClick={submitRejection}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View product dialog */}
      <Dialog open={!!viewTarget} onOpenChange={(v) => { if (!v) setViewTarget(null) }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{viewTarget?.name}</DialogTitle>
          </DialogHeader>
          {viewTarget?.imageUrl && (
            <img src={viewTarget.imageUrl} alt={viewTarget.name} className="w-full rounded-lg object-cover max-h-60 mt-2" />
          )}
          <div className="space-y-3 mt-3 text-sm">
            <Row label="Category" value={viewTarget?.category ?? ""} />
            <Row label="Price" value={`SLE ${viewTarget?.price.toLocaleString() ?? 0}`} />
            <div>
              <p className="text-muted-foreground mb-1">Description</p>
              <p className="leading-relaxed">{viewTarget?.description}</p>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setViewTarget(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function Stat({ label, value, accent, warn }: { label: string; value: string; accent?: boolean; warn?: boolean }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={`mt-1 text-2xl font-bold ${accent ? "text-primary" : warn ? "text-amber-500" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border/50 py-1.5 last:border-none">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
