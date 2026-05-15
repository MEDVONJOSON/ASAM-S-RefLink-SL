"use client"

import { useState, useRef } from "react"
import useSWR from "swr"
import type { Product } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Package, Clock, CheckCircle2, XCircle, ImagePlus, Trash2, Edit2 } from "lucide-react"
import { toast } from "sonner"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PRODUCT_CATEGORIES = [
  "Accommodation", "Food & Drinks", "Beauty & Wellness", "Construction Materials",
  "Fashion & Clothing", "Electronics", "Furniture", "Professional Services",
  "Auto Parts", "Agriculture", "Healthcare", "Education", "Other",
]

export function ProductsTab({ businessId }: { businessId: string }) {
  const { data, mutate } = useSWR<{ products: Product[] }>("/api/products", fetcher)
  const products = data?.products ?? []

  const pending = products.filter((p) => p.status === "pending")
  const approved = products.filter((p) => p.status === "approved")
  const rejected = products.filter((p) => p.status === "rejected")

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <MiniStat label="Approved" value={approved.length} color="text-emerald-500" icon={CheckCircle2} />
        <MiniStat label="Pending Review" value={pending.length} color="text-amber-500" icon={Clock} />
        <MiniStat label="Rejected" value={rejected.length} color="text-red-500" icon={XCircle} />
      </div>

      {/* Add product button */}
      <div className="flex justify-end">
        <AddProductDialog onCreated={mutate} />
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
          <Package className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="font-medium text-muted-foreground">No products yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Add your first product — it will appear in the marketplace once approved by admin.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onMutate={mutate} />
          ))}
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value, color, icon: Icon }: { label: string; value: number; color: string; icon: any }) {
  return (
    <div className="glass-card border-white/10 rounded-xl p-3 flex items-center gap-3">
      <Icon className={`h-5 w-5 ${color}`} />
      <div>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function ProductCard({ product, onMutate }: { product: Product; onMutate: () => void }) {
  const [deleting, setDeleting] = useState(false)

  async function deleteProduct() {
    if (!confirm("Delete this product?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
      toast.success("Product deleted")
      onMutate()
    } catch {
      toast.error("Failed to delete product")
    } finally {
      setDeleting(false)
    }
  }

  const statusConfig = {
    pending: { label: "Pending Review", className: "border-amber-400 text-amber-500" },
    approved: { label: "Approved", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30" },
    rejected: { label: "Rejected", className: "bg-red-500/10 text-red-400 border-red-500/30" },
  }
  const sc = statusConfig[product.status as keyof typeof statusConfig] ?? statusConfig.pending

  return (
    <div className="glass-card border-white/10 rounded-xl overflow-hidden group hover:-translate-y-0.5 transition-all duration-200">
      {product.imageUrl && (
        <div className="h-40 overflow-hidden bg-secondary">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold leading-tight">{product.name}</p>
            <p className="text-xs text-muted-foreground">{product.category}</p>
          </div>
          <Badge variant="outline" className={`shrink-0 text-xs ${sc.className}`}>{sc.label}</Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-primary">SLE {product.price.toLocaleString()}</span>
          <div className="flex gap-1">
            <EditProductDialog product={product} onUpdated={onMutate} />
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={deleteProduct}
              disabled={deleting}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
        {product.status === "rejected" && product.rejectionNote && (
          <p className="text-xs text-red-400 bg-red-500/10 rounded-md px-2 py-1.5 border border-red-500/20">
            <span className="font-semibold">Rejection note:</span> {product.rejectionNote}
          </p>
        )}
      </div>
    </div>
  )
}

function EditProductDialog({ product, onUpdated }: { product: Product; onUpdated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(product.name)
  const [description, setDescription] = useState(product.description)
  const [price, setPrice] = useState(String(product.price))
  const [category, setCategory] = useState(product.category)
  const [imageUrl, setImageUrl] = useState<string | undefined>(product.imageUrl ?? undefined)
  const [preview, setPreview] = useState<string | undefined>(product.imageUrl ?? undefined)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      setImageUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, price: Number(price), category, imageUrl }),
      })
      if (!res.ok) throw new Error("Failed")
      toast.success("Product updated! It will be reviewed again by admin.")
      setOpen(false)
      onUpdated()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-2">
          <FieldGroup>
            <Field>
              <FieldLabel>Product Image</FieldLabel>
              <div
                className="relative mt-1 flex h-36 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-secondary/50 overflow-hidden"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus className="h-7 w-7" />
                    <span className="text-xs">Click to upload</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </Field>
            <Field>
              <FieldLabel>Name</FieldLabel>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field>
              <FieldLabel>Category</FieldLabel>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel>Price (SLE)</FieldLabel>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </Field>
            <Field>
              <FieldLabel>Description</FieldLabel>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
              />
            </Field>
          </FieldGroup>
          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddProductDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState(PRODUCT_CATEGORIES[0])
  const [imageUrl, setImageUrl] = useState<string | undefined>()
  const [preview, setPreview] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image too large — max 4 MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPreview(dataUrl)
      setImageUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  function reset() {
    setName(""); setDescription(""); setPrice(""); setCategory(PRODUCT_CATEGORIES[0])
    setImageUrl(undefined); setPreview(undefined)
    if (fileRef.current) fileRef.current.value = ""
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, price: Number(price), category, imageUrl }),
      })
      
      let data
      try {
        data = await res.json()
      } catch (e) {
        console.error("Failed to parse JSON:", e)
        const text = await res.text().catch(() => "No body")
        throw new Error(`Server returned non-JSON response (${res.status}): ${text.slice(0, 100)}`)
      }

      if (!res.ok) throw new Error(data.error || "Failed")
      toast.success("Product submitted! It will appear in the marketplace once admin approves it.")
      setOpen(false)
      reset()
      onCreated()
    } catch (e: any) {
      console.error("Submission error:", e)
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button id="add-product-btn">
          <Plus className="mr-1.5 h-4 w-4" /> Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>List a New Product</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="mt-2">
          <FieldGroup>
            {/* Image upload */}
            <Field>
              <FieldLabel>Product Image</FieldLabel>
              <div
                className="relative mt-1 flex h-36 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-secondary/50 hover:border-primary/40 hover:bg-primary/5 transition-colors overflow-hidden"
                onClick={() => fileRef.current?.click()}
              >
                {preview ? (
                  <img src={preview} alt="preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <ImagePlus className="h-7 w-7" />
                    <span className="text-xs">Click to upload (max 4 MB)</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <FieldDescription>JPG, PNG, WEBP. Shown in the marketplace listing.</FieldDescription>
            </Field>

            {/* Name */}
            <Field>
              <FieldLabel htmlFor="prod-name">Product / Service Name</FieldLabel>
              <Input id="prod-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Deluxe Room, 50kg Cement Bag" required />
            </Field>

            {/* Category */}
            <Field>
              <FieldLabel htmlFor="prod-cat">Category</FieldLabel>
              <select
                id="prod-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            {/* Price */}
            <Field>
              <FieldLabel htmlFor="prod-price">Price (SLE)</FieldLabel>
              <Input
                id="prod-price"
                type="number"
                min={1}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 500000"
                required
              />
              <FieldDescription>Set your selling price in Sierra Leonean Leones.</FieldDescription>
            </Field>

            {/* Description */}
            <Field>
              <FieldLabel htmlFor="prod-desc">Description</FieldLabel>
              <textarea
                id="prod-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe this product or service in detail…"
                required
                minLength={5}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
              <FieldDescription>Min 5 characters. The more detail, the better for referrers.</FieldDescription>
            </Field>
          </FieldGroup>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner className="mr-2" /> : null}
              Submit for Review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
