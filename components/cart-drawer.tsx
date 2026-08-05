"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { X, Plus, Minus, ShoppingCart, Trash2, CreditCard } from "lucide-react"
import { CheckoutModal } from "./checkout-modal"

export function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, totalPrice, totalCount, clearCart } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-card shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="font-black text-base">Your Cart</h2>
            {totalCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-black rounded-full px-2 py-0.5">
                {totalCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-destructive hover:underline font-semibold"
              >
                Clear all
              </button>
            )}
            <button
              onClick={closeCart}
              className="rounded-full p-1.5 hover:bg-secondary transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="rounded-full bg-secondary p-6">
                <ShoppingCart className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <div>
                <p className="font-bold text-base">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Add items from the marketplace to get started</p>
              </div>
              <button
                onClick={closeCart}
                className="rounded-full border border-primary text-primary text-sm font-bold px-5 py-2 hover:bg-primary/10 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex gap-3 rounded-xl border border-border bg-background p-3">
                {/* Thumbnail */}
                <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-secondary/30 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingCart className="h-6 w-6 text-muted-foreground/30" />
                  )}
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-xs leading-snug line-clamp-2">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.businessName}</p>
                  <p className="font-black text-primary text-sm mt-1">SLE {(item.price * item.qty).toLocaleString()}</p>
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="rounded-full border border-border h-6 w-6 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="rounded-full border border-border h-6 w-6 flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="ml-auto text-destructive hover:text-destructive/70 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with totals + CTA */}
        {items.length > 0 && (
          <div className="border-t border-border p-4 space-y-3 bg-card">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal ({totalCount} item{totalCount !== 1 ? "s" : ""})</span>
              <span className="font-black">SLE {totalPrice.toLocaleString()}</span>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Delivery and taxes calculated at checkout
            </p>
            <button
              onClick={() => { closeCart(); setShowCheckout(true) }}
              className="w-full rounded-full bg-amber-400 hover:bg-amber-500 active:scale-95 text-black font-black py-3 text-sm uppercase tracking-wide transition-all duration-150 flex items-center justify-center gap-2 shadow-md"
            >
              <CreditCard className="h-4 w-4" />
              Proceed to Checkout
            </button>
            <button
              onClick={closeCart}
              className="w-full rounded-full border border-border text-sm font-bold py-2.5 hover:bg-secondary transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {showCheckout && (
        <CheckoutModal onClose={() => setShowCheckout(false)} />
      )}
    </>
  )
}
