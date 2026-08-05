"use client"

import { useMemo, useState } from "react"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { BusinessCard } from "@/components/business-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import type { Business, Product } from "@/lib/types"
import { Search, Store, Package, SlidersHorizontal, ChevronDown, X, ShieldCheck } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const CATEGORIES = [
  "Hospitality",
  "Food & Catering",
  "Construction",
  "Real Estate",
  "Professional Services",
  "Retail",
  "Transportation",
  "Beauty & Wellness",
]

const CITIES = ["Freetown", "Bo", "Kenema", "Makeni"]
const SORT_OPTIONS = [
  { label: "Featured", value: "featured" },
  { label: "Commission: High to Low", value: "commission_desc" },
  { label: "Commission: Low to High", value: "commission_asc" },
  { label: "Name: A–Z", value: "name_asc" },
  { label: "Name: Z–A", value: "name_desc" },
]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const GRID = "grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4"

function sortBusinesses(list: Business[], sort: string): Business[] {
  const s = [...list]
  if (sort === "commission_desc") return s.sort((a, b) => b.commissionPct - a.commissionPct)
  if (sort === "commission_asc") return s.sort((a, b) => a.commissionPct - b.commissionPct)
  if (sort === "name_asc") return s.sort((a, b) => a.name.localeCompare(b.name))
  if (sort === "name_desc") return s.sort((a, b) => b.name.localeCompare(a.name))
  return s
}
function sortProducts(list: Product[], sort: string): Product[] {
  const s = [...list]
  if (sort === "name_asc") return s.sort((a, b) => a.name.localeCompare(b.name))
  if (sort === "name_desc") return s.sort((a, b) => b.name.localeCompare(a.name))
  if (sort === "commission_desc") return s.sort((a, b) => b.price - a.price)
  if (sort === "commission_asc") return s.sort((a, b) => a.price - b.price)
  return s
}

// ─── Sidebar ────────────────────────────────────────────────────────────────
interface SidebarProps {
  activeTab: string
  categories: string[]
  cities: string[]
  verifiedOnly: boolean
  highCommOnly: boolean
  onCategoryToggle: (c: string) => void
  onCityToggle: (c: string) => void
  onVerifiedToggle: () => void
  onHighCommToggle: () => void
  onClear: () => void
}

function Sidebar({
  activeTab,
  categories,
  cities,
  verifiedOnly,
  highCommOnly,
  onCategoryToggle,
  onCityToggle,
  onVerifiedToggle,
  onHighCommToggle,
  onClear,
}: SidebarProps) {
  const hasFilters = categories.length > 0 || cities.length > 0 || verifiedOnly || highCommOnly

  return (
    <aside className="w-full space-y-5 text-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h2 className="font-bold text-base tracking-tight">Filters</h2>
        {hasFilters && (
          <button
            onClick={onClear}
            className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
          >
            <X className="h-3 w-3" /> Clear all
          </button>
        )}
      </div>

      {/* Department / Category */}
      <div>
        <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2">Department</h3>
        <ul className="space-y-1.5">
          {CATEGORIES.map((c) => (
            <li key={c}>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={categories.includes(c)}
                  onChange={() => onCategoryToggle(c)}
                  className="accent-primary h-3.5 w-3.5 rounded"
                />
                <span className={cn("transition-colors text-[13px]", categories.includes(c) ? "font-bold text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                  {c}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* City filter (businesses only) */}
      {activeTab === "businesses" && (
        <div className="border-t border-border pt-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2">Location</h3>
          <ul className="space-y-1.5">
            {CITIES.map((c) => (
              <li key={c}>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={cities.includes(c)}
                    onChange={() => onCityToggle(c)}
                    className="accent-primary h-3.5 w-3.5 rounded"
                  />
                  <span className={cn("transition-colors text-[13px]", cities.includes(c) ? "font-bold text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                    {c}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Deals & Discounts */}
      {activeTab === "businesses" && (
        <div className="border-t border-border pt-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-muted-foreground mb-2">Deals &amp; Features</h3>
          <ul className="space-y-1.5">
            <li>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={verifiedOnly}
                  onChange={onVerifiedToggle}
                  className="accent-primary h-3.5 w-3.5 rounded"
                />
                <span className={cn("flex items-center gap-1 text-[13px] transition-colors", verifiedOnly ? "font-bold text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Verified Only
                </span>
              </label>
            </li>
            <li>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={highCommOnly}
                  onChange={onHighCommToggle}
                  className="accent-primary h-3.5 w-3.5 rounded"
                />
                <span className={cn("text-[13px] transition-colors", highCommOnly ? "font-bold text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                  High Commission (≥15%)
                </span>
              </label>
            </li>
          </ul>
        </div>
      )}
    </aside>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function BusinessDirectory({ initial }: { initial: Business[] }) {
  const [activeTab, setActiveTab] = useState("businesses")
  const [q, setQ] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [highCommOnly, setHighCommOnly] = useState(false)
  const [sort, setSort] = useState("featured")
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  function toggleCategory(c: string) {
    setCategories((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }
  function toggleCity(c: string) {
    setCities((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c])
  }
  function clearAll() {
    setCategories([]); setCities([]); setVerifiedOnly(false); setHighCommOnly(false)
  }

  // API params — we pass single category for now (API supports one); multi-filter client-side
  const bizParams = new URLSearchParams()
  if (q) bizParams.set("q", q)
  const bizKey = `/api/businesses?${bizParams.toString()}`
  const prodParams = new URLSearchParams()
  if (q) prodParams.set("q", q)
  const prodKey = `/api/products?approvedOnly=true&${prodParams.toString()}`

  const { data: bizData, isLoading: bizLoading } = useSWR<{ businesses: Business[] }>(bizKey, fetcher, {
    fallbackData: { businesses: initial },
    keepPreviousData: true,
  })
  const { data: prodData, isLoading: prodLoading } = useSWR<{ products: Product[] }>(prodKey, fetcher, {
    keepPreviousData: true,
  })

  // Client-side filter + sort
  const allBusinesses = bizData?.businesses ?? []
  const allProducts = prodData?.products ?? []

  const businesses = useMemo(() => {
    let list = allBusinesses
    if (categories.length > 0) list = list.filter((b) => categories.includes(b.category))
    if (cities.length > 0) list = list.filter((b) => cities.includes(b.city))
    if (verifiedOnly) list = list.filter((b) => b.verified)
    if (highCommOnly) list = list.filter((b) => b.commissionPct >= 15)
    return sortBusinesses(list, sort)
  }, [allBusinesses, categories, cities, verifiedOnly, highCommOnly, sort])

  const products = useMemo(() => {
    let list = allProducts
    if (categories.length > 0) list = list.filter((p) => categories.includes(p.category))
    return sortProducts(list, sort)
  }, [allProducts, categories, sort])

  const isLoading = activeTab === "businesses" ? bizLoading : prodLoading
  const resultCount = activeTab === "businesses" ? businesses.length : products.length
  const sortLabel = SORT_OPTIONS.find((o) => o.value === sort)?.label ?? "Featured"

  const sidebarProps: SidebarProps = {
    activeTab,
    categories,
    cities,
    verifiedOnly,
    highCommOnly,
    onCategoryToggle: toggleCategory,
    onCityToggle: toggleCity,
    onVerifiedToggle: () => setVerifiedOnly((v) => !v),
    onHighCommToggle: () => setHighCommOnly((v) => !v),
    onClear: clearAll,
  }

  return (
    <section className="container mx-auto px-4 pb-20">
      {/* ── Search bar ─────────────────────────────────────── */}
      <div className="mx-auto max-w-3xl -mt-10 relative z-20 mb-8 flex items-center gap-3 rounded-2xl border border-border/60 bg-card shadow-xl px-4 py-2">
        <Search className="h-5 w-5 text-muted-foreground shrink-0" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={activeTab === "businesses" ? "Search hotels, plumbers, caterers…" : "Search products, services, deals…"}
          className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-base h-10 font-medium px-0"
        />
        {q && (
          <button onClick={() => setQ("")} className="text-muted-foreground hover:text-foreground shrink-0">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* ── Tab switcher ───────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <TabsList className="bg-secondary/40 p-1 rounded-xl h-11 w-fit">
            <TabsTrigger value="businesses" className="rounded-lg px-5 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
              <Store className="h-4 w-4" /> Businesses
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg px-5 h-9 data-[state=active]:bg-background data-[state=active]:shadow-sm gap-2">
              <Package className="h-4 w-4" /> Products
            </TabsTrigger>
          </TabsList>

          {/* Mobile filters button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-secondary/40 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
            {(categories.length + cities.length + (verifiedOnly ? 1 : 0) + (highCommOnly ? 1 : 0)) > 0 && (
              <span className="bg-primary text-primary-foreground text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                {categories.length + cities.length + (verifiedOnly ? 1 : 0) + (highCommOnly ? 1 : 0)}
              </span>
            )}
          </button>
        </div>

        {/* ── Layout: sidebar + content ───────────────────── */}
        <div className="flex gap-8 items-start">
          {/* Desktop sidebar */}
          <div className="hidden lg:block w-52 shrink-0 sticky top-24">
            <Sidebar {...sidebarProps} />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4 gap-4">
              <p className="text-sm text-muted-foreground font-medium">
                {isLoading ? (
                  <span className="animate-pulse">Searching…</span>
                ) : (
                  <>
                    <span className="text-foreground font-bold">
                      1–{Math.min(resultCount, resultCount)} of {resultCount.toLocaleString()}
                    </span>{" "}
                    result{resultCount !== 1 ? "s" : ""}
                  </>
                )}
              </p>

              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown((v) => !v)}
                  className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/40 transition-colors whitespace-nowrap"
                >
                  <span className="text-muted-foreground">Sort by:</span>
                  <span>{sortLabel}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showSortDropdown && "rotate-180")} />
                </button>
                {showSortDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowSortDropdown(false)} />
                    <div className="absolute right-0 top-full mt-1 z-20 w-52 rounded-xl border border-border bg-card shadow-xl py-1 animate-in fade-in slide-in-from-top-1 duration-150">
                      {SORT_OPTIONS.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => { setSort(o.value); setShowSortDropdown(false) }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-sm transition-colors hover:bg-secondary/50",
                            sort === o.value ? "font-bold text-primary" : "text-foreground"
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── Businesses Tab ─────────────────────────── */}
            <TabsContent value="businesses" className="mt-0 outline-none">
              {isLoading ? (
                <div className={GRID}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 w-full rounded-xl" />
                  ))}
                </div>
              ) : businesses.length === 0 ? (
                <Empty className="mt-10">
                  <EmptyHeader>
                    <EmptyTitle>No businesses match</EmptyTitle>
                    <EmptyDescription>Try adjusting your filters or search terms.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className={cn(GRID, "animate-in fade-in duration-400")}>
                  {businesses.map((b) => (
                    <BusinessCard key={b.id} business={b} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Products Tab ───────────────────────────── */}
            <TabsContent value="products" className="mt-0 outline-none">
              {isLoading ? (
                <div className={GRID}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-72 w-full rounded-xl" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <Empty className="mt-10">
                  <EmptyHeader>
                    <EmptyTitle>No products match</EmptyTitle>
                    <EmptyDescription>Try adjusting your filters or search terms.</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : (
                <div className={cn(GRID, "animate-in fade-in duration-400")}>
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </TabsContent>
          </div>
        </div>
      </Tabs>

      {/* ── Mobile Filter Drawer ───────────────────────────── */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border p-6 shadow-2xl max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black text-lg">Filters</h2>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="rounded-full bg-secondary p-2 hover:bg-secondary/70"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Sidebar {...sidebarProps} />
            <button
              onClick={() => setShowMobileFilters(false)}
              className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-black uppercase tracking-wide text-primary-foreground hover:brightness-110 transition-all"
            >
              Show {resultCount} result{resultCount !== 1 ? "s" : ""}
            </button>
          </div>
        </>
      )}
    </section>
  )
}
