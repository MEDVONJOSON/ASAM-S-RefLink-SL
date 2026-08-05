"use client"
import Link from "next/link"
import { ShieldCheck, MapPin, Star } from "lucide-react"
import type { Business } from "@/lib/types"

const categoryColors: Record<string, string> = {
  Hospitality: "from-orange-200 to-amber-100",
  "Food & Catering": "from-rose-200 to-orange-100",
  Construction: "from-stone-300 to-stone-100",
  "Real Estate": "from-emerald-200 to-teal-100",
  "Professional Services": "from-sky-200 to-cyan-100",
  Retail: "from-pink-200 to-rose-100",
  Transportation: "from-zinc-300 to-zinc-100",
  "Beauty & Wellness": "from-fuchsia-200 to-pink-100",
  Other: "from-orange-100 to-amber-50",
}

// Deterministic pseudo-rating from business id
function getRating(id: string) {
  const n = id.charCodeAt(0) + id.charCodeAt(id.length - 1)
  return (3.8 + (n % 12) * 0.1).toFixed(1)
}
function getReviewCount(id: string) {
  const n = id.charCodeAt(1) ?? 5
  return ((n * 137 + 200) % 4800) + 50
}

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

export function BusinessCard({ business }: { business: Business }) {
  const grad = categoryColors[business.category] ?? categoryColors.Other
  const initials = business.name.substring(0, 2).toUpperCase()
  const rating = getRating(business.id)
  const reviews = getReviewCount(business.id)
  const isTopReferred = reviews > 3000
  const hasHighComm = business.commissionPct >= 15

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border/60 bg-card hover:shadow-[0_4px_20px_rgba(0,0,0,0.10)] transition-shadow duration-300 relative">
      {/* Badge ribbons */}
      {isTopReferred && (
        <div className="absolute top-0 left-0 z-10 bg-[#c7511f] text-white text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-br-lg">
          Top Referred
        </div>
      )}
      {!isTopReferred && hasHighComm && (
        <div className="absolute top-0 left-0 z-10 bg-destructive text-white text-[10px] font-black uppercase tracking-wide px-2 py-0.5 rounded-br-lg">
          High Commission
        </div>
      )}

      {/* Image */}
      <div className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${grad} flex items-center justify-center`}>
        {business.imageUrl ? (
          <img
            src={business.imageUrl}
            alt={business.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none" }}
          />
        ) : (
          <span className="text-5xl font-black text-black/20 select-none">{initials}</span>
        )}
        {business.verified && (
          <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent/90 backdrop-blur-sm text-accent-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            <ShieldCheck className="h-3 w-3" /> Verified
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="flex flex-col flex-1 p-3 gap-1">
        {/* Title */}
        <Link
          href={`/businesses/${business.id}`}
          className="text-[13px] sm:text-sm font-semibold leading-snug line-clamp-2 hover:text-primary hover:underline transition-colors"
        >
          {business.name}
        </Link>

        {/* Category */}
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold opacity-75">
          {business.category}
        </p>

        {/* Stars */}
        <StarRow rating={rating} count={reviews} />

        {/* Commission */}
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-lg font-black text-foreground">{business.commissionPct}%</span>
          <span className="text-xs text-muted-foreground font-medium">commission</span>
        </div>
        <p className="text-[11px] text-accent font-semibold">
          Earn via Orange Money
        </p>

        {/* Location */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{business.city}</span>
        </div>

        {/* CTA */}
        <Link
          href={`/businesses/${business.id}`}
          className="mt-3 w-full rounded-full bg-primary py-1.5 text-center text-xs font-black uppercase tracking-wide text-primary-foreground hover:brightness-110 active:scale-95 transition-all duration-150 shadow-sm"
        >
          Refer &amp; Earn
        </Link>
      </div>
    </div>
  )
}
