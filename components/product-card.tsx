"use client"

import Link from "next/link"
import type { Product } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Package } from "lucide-react"

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/businesses/${product.businessId}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 glass-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="aspect-square overflow-hidden bg-muted relative">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-secondary/30">
            <Package className="h-12 w-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge className="bg-primary/90 backdrop-blur-md border-none text-[10px] font-bold uppercase tracking-wider">
            {product.category}
          </Badge>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </div>
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 flex-1">
          {product.description}
        </p>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-mono font-bold text-primary text-sm">
            SLE {product.price.toLocaleString()}
          </span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
