import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center", className)} aria-label="ASAM'S REFLINK SL home">
      <div className="relative h-12 w-36 sm:h-14 sm:w-44 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="ASAM'S REFLINK SL — Alimzo Services and Marketing Logo"
          fill
          className="object-contain object-left"
          priority
        />
      </div>
    </Link>
  )
}
