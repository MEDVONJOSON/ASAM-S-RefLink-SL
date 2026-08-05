"use client"

import Link from "next/link"
import type { Product } from "@/lib/types"
import { Package, Star, Tag } from "lucide-react"

function StarRow({ rating, count }: { rating: string; count: number }) {
  const r = parseFloat(rating)
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = Math.min(1, Math.max(0, r - (i - 1)))
          return (
            <span key={i} className="relative inline-block text-border text-sm leading-none">
              <Star className="h-3.5 w-3.5 fill-border stroke-none" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="h-3.5 w-3.5 fill-amber-400 stroke-none" />
              </span>
            </span>
          )
        })}
      </div>
      <span className="text-[11px] text-primary font-semibold hover:underline cursor-pointer">
        {count.toLocaleString()}
      </span>
    </div>
  )
}

function getRating(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return (3.8 + (n % 12) * 0.1).toFixed(1)
}
function getReviewCount(id: string) {
  const n = id.charCodeAt(1) ?? 5
  return ((n * 137 + 200) % 2800) + 30
}

export function ProductCard({ product }: { product: Product }) {
  const rating = getRating(product.id)
  const reviews = getReviewCount(product.id)
  const isNew = reviews < 150

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-shadow duration-300 relative">
      {/* Badge */}
      {isNew && (
        <div className="absolute top-0 left-0 z-10 bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-br-lg">
          New
        </div>
      )}

      {/* Image */}
      <div className="aspect-[4/3] overflow-hidden bg-secondary/30 flex items-center justify-center relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <Package className="h-12 w-12 text-muted-foreground/30" />
        )}
        {/* Category badge */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-primary/90 backdrop-blur-sm text-primary-foreground text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full">
          <Tag className="h-2.5 w-2.5" />
          {product.category}
        </div>
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        {/* Title */}
        <Link
          href={`/businesses/${product.businessId}`}
          className="text-[13px] sm:text-sm font-semibold leading-snug line-clamp-2 hover:text-primary hover:underline transition-colors"
        >
          {product.name}
        </Link>

        {/* Stars */}
        <StarRow rating={rating} count={reviews} />

        {/* Price */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-lg font-black text-foreground">
            SLE {product.price.toLocaleString()}
          </span>
        </div>

        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
          {product.description}
        </p>

        {/* CTA */}
        <Link
          href={`/businesses/${product.businessId}`}
          className="mt-3 w-full rounded-full bg-primary py-1.5 text-center text-xs font-black uppercase tracking-wide text-primary-foreground hover:brightness-110 active:scale-95 transition-all duration-150 shadow-sm"
        >
          View &amp; Refer
        </Link>
      </div>
    </div>
  )
}
