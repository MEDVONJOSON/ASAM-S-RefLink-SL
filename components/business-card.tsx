"use client"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, ShieldCheck, ArrowRight } from "lucide-react"
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

const defaultImages = [
  "/businesses/real-estate.png",
  "/businesses/auto.png",
  "/businesses/real-estate.png",
  "/businesses/plumbing.png",
]

export function BusinessCard({ business }: { business: Business }) {
  const grad = categoryColors[business.category] ?? categoryColors.Other
  const imageIndex = business.name.charCodeAt(0) % defaultImages.length
  const imageUrl = business.imageUrl || defaultImages[imageIndex]

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-white/10 glass-card transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] hover:border-primary/30 bg-card/40">
      <div className={`relative h-28 bg-gradient-to-br ${grad} overflow-hidden`}>
        <img
          src={imageUrl}
          alt={business.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            // Fallback if specific image fails
            (e.target as HTMLImageElement).src = defaultImages[imageIndex];
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

        {business.verified && (
          <Badge className="absolute right-2 top-2 gap-1 bg-accent text-accent-foreground shadow-lg backdrop-blur-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
            <ShieldCheck className="h-3 w-3" /> Verified
          </Badge>
        )}

        <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
          <span className="rounded-md bg-primary/90 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-black text-primary-foreground shadow-lg">
            {business.commissionPct}%
          </span>
        </div>
      </div>

      <CardContent className="flex flex-1 flex-col gap-1 p-3.5 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 text-[15px] font-bold leading-tight tracking-tight transition-colors group-hover:text-primary">
            {business.name}
          </h3>
        </div>
        <p className="text-[10px] uppercase tracking-widest text-primary font-bold opacity-80">{business.category}</p>
        <p className="line-clamp-2 text-xs text-muted-foreground mt-1 leading-relaxed font-medium">
          {business.description}
        </p>
        <div className="mt-auto pt-3 flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground/80">
          <MapPin className="h-3.5 w-3.5 text-accent" />
          <span>{business.city}</span>
        </div>
      </CardContent>

      <CardFooter className="border-t border-white/5 bg-secondary/20 p-2.5 backdrop-blur-xl">
        <Link
          href={`/businesses/${business.id}`}
          className="inline-flex w-full justify-between items-center text-[11px] font-black uppercase tracking-wider text-primary group/link"
        >
          View & refer
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 transition-all duration-300 group-hover/link:bg-primary group-hover/link:text-primary-foreground group-hover/link:translate-x-1">
            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/link:-rotate-45" />
          </span>
        </Link>
      </CardFooter>
    </Card>
  )
}

