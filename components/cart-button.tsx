"use client"

import { useCart } from "@/lib/cart-context"
import { useUser } from "@/lib/use-user"
import { ShoppingCart } from "lucide-react"
import { CartDrawer } from "./cart-drawer"

export function CartButton() {
  const { user } = useUser()
  const { totalCount, openCart } = useCart()

  // Only show for client role
  if (!user || user.role !== "client") return null

  return (
    <>
      <button
        onClick={openCart}
        id="cart-button"
        aria-label="Open cart"
        className="relative flex items-center justify-center rounded-full p-2 hover:bg-primary/10 transition-colors"
      >
        <ShoppingCart className="h-5 w-5 text-foreground" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-black text-primary-foreground">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        )}
      </button>
      <CartDrawer />
    </>
  )
}
