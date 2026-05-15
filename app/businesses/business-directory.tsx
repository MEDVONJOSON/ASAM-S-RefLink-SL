"use client"

import { useState } from "react"
import useSWR from "swr"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { BusinessCard } from "@/components/business-card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ProductCard } from "@/components/product-card"
import type { Business, Product } from "@/lib/types"
import { Search, Store, Package } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

const CATEGORIES = [
  "All",
  "Hospitality",
  "Food & Catering",
  "Construction",
  "Real Estate",
  "Professional Services",
  "Retail",
  "Transportation",
  "Beauty & Wellness",
]

const CITIES = ["All", "Freetown", "Bo", "Kenema", "Makeni"]

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function BusinessDirectory({ initial }: { initial: Business[] }) {
  const [activeTab, setActiveTab] = useState("businesses")
  const [q, setQ] = useState("")
  const [category, setCategory] = useState("All")
  const [city, setCity] = useState("All")

  const bizParams = new URLSearchParams()
  if (q) bizParams.set("q", q)
  if (category !== "All") bizParams.set("category", category)
  if (city !== "All") bizParams.set("city", city)
  const bizKey = `/api/businesses?${bizParams.toString()}`

  const prodParams = new URLSearchParams()
  if (q) prodParams.set("q", q)
  if (category !== "All") prodParams.set("category", category)
  // Products don't have city filtering yet in the store helper, but we'll include it for future-proofing
  const prodKey = `/api/products?approvedOnly=true&${prodParams.toString()}`

  const { data: bizData, isLoading: bizLoading } = useSWR<{ businesses: Business[] }>(bizKey, fetcher, {
    fallbackData: { businesses: initial },
    keepPreviousData: true,
  })

  const { data: prodData, isLoading: prodLoading } = useSWR<{ products: Product[] }>(prodKey, fetcher, {
    keepPreviousData: true,
  })

  const businesses = bizData?.businesses ?? []
  const products = prodData?.products ?? []
  const isLoading = activeTab === "businesses" ? bizLoading : prodLoading

  return (
    <section className="container mx-auto px-4 pb-20">
      <div className="mx-auto max-w-5xl -mt-12 relative z-20 mb-10 flex flex-col gap-3 md:flex-row md:items-center rounded-3xl glass p-4 shadow-2xl shadow-primary/5 border border-white/20 backdrop-blur-xl bg-card/60">
        <div className="relative flex-1 group">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={activeTab === "businesses" ? "Search hotels, plumbers, caterers..." : "Search products, services, deals..."}
            className="pl-12 border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-base h-14 font-medium"
          />
        </div>
        <div className="hidden md:block w-px h-10 bg-border/60 mx-2" />
        <div className="flex gap-2">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full md:w-48 border-none bg-transparent shadow-none h-14 focus:ring-0 focus:ring-offset-0 font-medium hover:bg-secondary/40 rounded-xl transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-card border-none rounded-2xl">
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c} className="font-medium cursor-pointer rounded-xl">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {activeTab === "businesses" && (
            <>
              <div className="w-px h-10 bg-border/60 mx-1 hidden md:block" />
              <Select value={city} onValueChange={setCity}>
                <SelectTrigger className="w-full md:w-40 border-none bg-transparent shadow-none h-14 focus:ring-0 focus:ring-offset-0 font-medium hover:bg-secondary/40 rounded-xl transition-colors">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-card border-none rounded-2xl">
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c} className="font-medium cursor-pointer rounded-xl">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <TabsList className="bg-secondary/40 p-1 rounded-2xl h-12 w-fit">
            <TabsTrigger value="businesses" className="rounded-xl px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Store className="h-4 w-4 mr-2" />
              Businesses
            </TabsTrigger>
            <TabsTrigger value="products" className="rounded-xl px-6 h-10 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Package className="h-4 w-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground font-medium">
            {isLoading ? "Searching…" : activeTab === "businesses" 
              ? `${businesses.length} business${businesses.length === 1 ? "" : "es"} found`
              : `${products.length} product${products.length === 1 ? "" : "s"} found`}
          </div>
        </div>

        <TabsContent value="businesses" className="mt-0 outline-none">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          ) : businesses.length === 0 ? (
            <Empty className="mt-10">
              <EmptyHeader>
                <EmptyTitle>No businesses match</EmptyTitle>
                <EmptyDescription>Try a broader search or different filters.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
              {businesses.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="products" className="mt-0 outline-none">
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <Empty className="mt-10">
              <EmptyHeader>
                <EmptyTitle>No products match</EmptyTitle>
                <EmptyDescription>Try a broader search or different filters.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  )
}
