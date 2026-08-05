"use client"

import { useState } from "react"
import { useCart } from "@/lib/cart-context"
import { X, Smartphone, CheckCircle2, Copy, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"

type Step = "summary" | "payment" | "confirm"
type PaymentMethod = "orange_money" | "afri_money"

const PAYMENT_CONFIG = {
  orange_money: {
    label: "Orange Money",
    color: "bg-orange-500",
    textColor: "text-orange-500",
    borderColor: "border-orange-400",
    bgLight: "bg-orange-50 dark:bg-orange-950/20",
    logo: "🟠",
    ussd: "*144#",
    instructions: [
      "Dial *144# on your Orange SIM",
      'Select "Mobile Money"',
      'Select "Pay Bill"',
      "Enter Merchant Code: 12345",
      "Enter your Order Reference",
      "Enter your PIN to confirm",
    ],
  },
  afri_money: {
    label: "Afri Money",
    color: "bg-blue-600",
    textColor: "text-blue-600",
    borderColor: "border-blue-400",
    bgLight: "bg-blue-50 dark:bg-blue-950/20",
    logo: "🔵",
    ussd: "*678#",
    instructions: [
      "Dial *678# on your Afri Money SIM",
      'Select "Pay Merchant"',
      "Enter Merchant ID: 98765",
      "Enter your Order Reference",
      "Enter Amount in Leones",
      "Enter your PIN to confirm",
    ],
  },
}

export function CheckoutModal({ onClose }: { onClose: () => void }) {
  const { items, totalPrice, clearCart } = useCart()
  const [step, setStep] = useState<Step>("summary")
  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [mobileNumber, setMobileNumber] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderRef, setOrderRef] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const config = method ? PAYMENT_CONFIG[method] : null

  async function placeOrder() {
    if (!method || !mobileNumber.trim()) return
    setIsProcessing(true)
    setError(null)
    try {
      const res = await fetch("/api/client/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            businessId: i.businessId,
            name: i.name,
            price: i.price,
            qty: i.qty,
          })),
          totalAmount: totalPrice,
          paymentMethod: method,
          mobileNumber: mobileNumber.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to place order")
      setOrderRef(data.reference)
      clearCart()
      setStep("confirm")
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
        <div className="w-full max-w-md bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-black text-lg">
              {step === "summary" && "Order Summary"}
              {step === "payment" && "Choose Payment"}
              {step === "confirm" && "Order Placed! 🎉"}
            </h2>
            <button onClick={onClose} className="rounded-full p-1.5 hover:bg-secondary transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* ── Step 1: Summary ─────────────────────────── */}
          {step === "summary" && (
            <div className="p-5 space-y-4">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between text-sm py-1.5 border-b border-border/40 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold line-clamp-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.qty} × SLE {item.price.toLocaleString()}</p>
                    </div>
                    <span className="font-black ml-3 shrink-0">SLE {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="rounded-xl bg-secondary/30 p-4 space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">SLE {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="font-semibold text-accent">Arranged with business</span>
                </div>
                <div className="border-t border-border pt-1.5 flex justify-between font-black text-base">
                  <span>Total</span>
                  <span className="text-primary">SLE {totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => setStep("payment")}
                className="w-full rounded-full bg-amber-400 hover:bg-amber-500 text-black font-black py-3 text-sm uppercase tracking-wide transition-all active:scale-95 shadow-md"
              >
                Choose Payment Method →
              </button>
            </div>
          )}

          {/* ── Step 2: Payment ─────────────────────────── */}
          {step === "payment" && (
            <div className="p-5 space-y-4">
              <p className="text-sm text-muted-foreground">Select your mobile money provider and enter your number.</p>

              {/* Payment method cards */}
              <div className="grid grid-cols-2 gap-3">
                {(["orange_money", "afri_money"] as PaymentMethod[]).map((m) => {
                  const cfg = PAYMENT_CONFIG[m]
                  return (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200 ${
                        method === m
                          ? `${cfg.borderColor} ${cfg.bgLight}`
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <span className="text-3xl">{cfg.logo}</span>
                      <span className="font-black text-sm">{cfg.label}</span>
                      <span className={`text-xs font-mono font-bold ${cfg.textColor}`}>{cfg.ussd}</span>
                    </button>
                  )
                })}
              </div>

              {method && (
                <>
                  {/* USSD instructions */}
                  <div className={`rounded-xl ${config?.bgLight} p-4 border ${config?.borderColor}`}>
                    <p className={`text-xs font-black uppercase tracking-wider ${config?.textColor} mb-2`}>
                      {config?.label} Payment Steps
                    </p>
                    <ol className="space-y-1">
                      {config?.instructions.map((step, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className={`font-black ${config.textColor} shrink-0`}>{i + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Mobile number input */}
                  <div>
                    <label className="block text-xs font-bold mb-1.5 text-muted-foreground uppercase tracking-wider">
                      Your {config?.label} Number
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="e.g. 076 123 456"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-xl p-3">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </div>
                  )}

                  {/* Order total reminder */}
                  <div className="rounded-xl bg-secondary/40 p-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount to pay</span>
                    <span className="font-black text-primary">SLE {totalPrice.toLocaleString()}</span>
                  </div>

                  <button
                    onClick={placeOrder}
                    disabled={isProcessing || !mobileNumber.trim()}
                    className="w-full rounded-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-3 text-sm uppercase tracking-wide transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
                    ) : (
                      <>Confirm &amp; Place Order</>
                    )}
                  </button>
                  <button onClick={() => setStep("summary")} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors">
                    ← Back to summary
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Step 3: Confirmation ─────────────────────── */}
          {step === "confirm" && orderRef && (
            <div className="p-6 space-y-5 text-center">
              <div className="flex justify-center">
                <div className="rounded-full bg-accent/10 p-5">
                  <CheckCircle2 className="h-14 w-14 text-accent" />
                </div>
              </div>
              <div>
                <h3 className="font-black text-xl">Order Confirmed!</h3>
                <p className="text-muted-foreground text-sm mt-1.5">
                  Your order has been placed. Pay using {method === "orange_money" ? "Orange Money" : "Afri Money"} using the steps shown and quote your reference below.
                </p>
              </div>

              <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold mb-1">Order Reference</p>
                <p className="font-mono font-black text-2xl text-primary tracking-widest">{orderRef}</p>
                <button
                  onClick={() => { navigator.clipboard.writeText(orderRef); toast.success("Reference copied!") }}
                  className="mt-2 flex items-center gap-1.5 mx-auto text-xs text-primary hover:underline font-semibold"
                >
                  <Copy className="h-3 w-3" /> Copy reference
                </button>
              </div>

              <div className="rounded-xl bg-secondary/30 p-3 text-xs text-muted-foreground space-y-1 text-left">
                <p className="font-bold text-foreground">What to do next:</p>
                <p>1. Dial {config?.ussd ?? (method === "orange_money" ? "*144#" : "*678#")} on your mobile</p>
                <p>2. Follow the payment steps and use reference: <strong>{orderRef}</strong></p>
                <p>3. Screenshot your payment confirmation</p>
                <p>4. The business will contact you to arrange delivery</p>
              </div>

              <button
                onClick={onClose}
                className="w-full rounded-full bg-primary hover:brightness-110 text-primary-foreground font-black py-3 text-sm uppercase tracking-wide transition-all active:scale-95 shadow-md"
              >
                Done — Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
