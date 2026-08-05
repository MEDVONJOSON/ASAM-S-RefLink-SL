"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { mutate } from "swr"
import { Users, Store, ShoppingBag, ArrowLeft, ArrowRight, Smartphone, Mail, ShieldCheck } from "lucide-react"

type Role = "referrer" | "business" | "client"

const ROLES: { value: Role; label: string; description: string; icon: typeof Users }[] = [
  {
    value: "referrer",
    label: "I'm a Referrer",
    description: "Earn commissions by referring customers to businesses",
    icon: Users,
  },
  {
    value: "business",
    label: "I'm a Business",
    description: "List your business and get customers through referrals",
    icon: Store,
  },
  {
    value: "client",
    label: "I'm a Client",
    description: "Find trusted businesses and services near you",
    icon: ShoppingBag,
  },
]

interface Props {
  initialRole?: Role
  refCode?: string
  googleId?: string
  email?: string
  name?: string
}

export function GetStartedForm({ initialRole, refCode, googleId, email: initialEmail, name: initialName }: Props) {
  const router = useRouter()
  const [step, setStep] = useState<"role" | "form" | "otp">(initialRole ? "form" : "role")
  const [role, setRole] = useState<Role | undefined>(initialRole)
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const [googleIdState, setGoogleIdState] = useState(googleId || "")

  useEffect(() => {
    const renderGoogleButton = () => {
      if (typeof window === "undefined" || !(window as any).google) return

      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      })
      
      if (googleButtonRef.current) {
        (window as any).google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          width: googleButtonRef.current.offsetWidth > 0 ? googleButtonRef.current.offsetWidth : undefined,
        })
      }
    }

    if (step === "role") {
      if ((window as any).google) {
        renderGoogleButton()
      } else {
        const interval = setInterval(() => {
          if ((window as any).google) {
            clearInterval(interval)
            renderGoogleButton()
          }
        }, 100)
        return () => clearInterval(interval)
      }
    }
  }, [step])

  async function handleGoogleCallback(response: any) {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: response.credential }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Google login failed")

      if (data.action === "login") {
        await mutate("/api/auth/me")
        const r = data.user.role
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`)
        router.push(
          r === "business"
            ? "/dashboard/business"
            : r === "referrer"
              ? "/dashboard/referrer"
              : r === "client"
                ? "/dashboard/client"
                : "/admin"
        )
      } else if (data.action === "signup") {
        setGoogleIdState(data.googleId)
        setName(data.name || "")
        setEmail(data.email || "")
        toast.info("Google account connected! Please choose your role below.")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  // Referrer fields
  const [name, setName] = useState(initialName || "")
  const [phone, setPhone] = useState("")
  const [referCode, setReferCode] = useState(refCode || "")
  const [otpCode, setOtpCode] = useState("")

  // Business fields
  const [email, setEmail] = useState(initialEmail || "")
  const [businessName, setBusinessName] = useState("")
  const [businessCode, setBusinessCode] = useState("")

  // Client fields (phone is shared)
  // otpCode is shared

  // Auto-fill ref code from URL
  useEffect(() => {
    if (refCode) setReferCode(refCode)
  }, [refCode])

  function selectRole(r: Role) {
    setRole(r)
    setStep("form")
  }

  async function sendOtp() {
    if (!phone || phone.length < 6) {
      toast.error("Enter a valid phone number")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to send OTP")
      setOtpSent(true)
      setStep("otp")
      toast.success("OTP sent to your phone!")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      let payload: Record<string, any> = { role, googleId: googleIdState }
      if (googleIdState) {
        payload.name = name
        payload.email = email
      }

      if (role === "referrer") {
        payload = { ...payload, phone, referCode, otpCode }
      } else if (role === "business") {
        payload = { ...payload, email, businessName, businessCode }
      } else if (role === "client") {
        payload = { ...payload, phone, otpCode }
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Signup failed")
      await mutate("/api/auth/me")
      toast.success("Welcome to RefLink SL! 🎉")
      router.push(
        role === "business" ? "/dashboard/business" : role === "client" ? "/dashboard/client" : "/dashboard/referrer",
      )
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 1: Role Selection ───
  if (step === "role") {
    return (
      <div className="mt-8">
        <div className="grid gap-3 sm:grid-cols-3">
          {ROLES.map(({ value, label, description, icon: Icon }) => (
            <button
              key={value}
              onClick={() => selectRole(value)}
              className="group relative flex flex-col items-center gap-3 rounded-xl border-2 border-border/70 bg-secondary/30 p-6 text-center transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:scale-110">
                <Icon className="h-7 w-7" />
              </div>
              <div>
                <p className="font-semibold text-sm">{label}</p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
              </div>
              <ArrowRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground/0 transition-all duration-300 group-hover:text-primary group-hover:translate-x-0.5 group-hover:opacity-100" />
            </button>
          ))}
        </div>
        
        {!googleIdState && (
          <div className="mt-6">
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/70" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>
            <div ref={googleButtonRef} className="flex justify-center w-full" />
          </div>
        )}
      </div>
    )
  }

  // ─── Step 2: Role-specific form ───
  if (step === "form") {
    return (
      <div className="mt-6">
        <button
          onClick={() => { setStep("role"); setRole(undefined); setOtpSent(false); setOtpCode("") }}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Change role
        </button>

        <div className="mb-5 flex items-center gap-3 rounded-lg bg-secondary/50 px-4 py-3">
          {role && (() => {
            const r = ROLES.find((r) => r.value === role)!
            const Icon = r.icon
            return (
              <>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.label}</p>
                  <p className="text-xs text-muted-foreground">{r.description}</p>
                </div>
              </>
            )
          })()}
        </div>

        {/* ── Referrer Form ── */}
        {role === "referrer" && (
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ref-phone">
                  <Smartphone className="mr-1.5 inline h-4 w-4" />
                  Phone number
                </FieldLabel>
                <Input
                  id="ref-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+232 78 000 000"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="ref-code">
                  <ShieldCheck className="mr-1.5 inline h-4 w-4" />
                  ASAM&apos;S Registration Code
                </FieldLabel>
                <Input
                  id="ref-code"
                  value={referCode}
                  onChange={(e) => setReferCode(e.target.value)}
                  placeholder="Enter your ASAM'S code"
                  required
                />
                <FieldDescription>
                  The unique code you received when registering with ASAM&apos;S. This code will be embedded in all your referral links.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
              {loading ? <Spinner className="mr-2" /> : null}
              Create account
            </Button>
          </form>
        )}

        {/* ── Business Form ── */}
        {role === "business" && (
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="biz-email">
                  <Mail className="mr-1.5 inline h-4 w-4" />
                  Email address
                </FieldLabel>
                <Input
                  id="biz-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@business.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="biz-name">
                  <Store className="mr-1.5 inline h-4 w-4" />
                  Business name
                </FieldLabel>
                <Input
                  id="biz-name"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business Name"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="biz-code">
                  <ShieldCheck className="mr-1.5 inline h-4 w-4" />
                  ASAM&apos;S Authorization Code
                </FieldLabel>
                <Input
                  id="biz-code"
                  value={businessCode}
                  onChange={(e) => setBusinessCode(e.target.value)}
                  placeholder="Enter your authorization code"
                  required
                />
                <FieldDescription>
                  The invite code provided by ASAM&apos;S to authorize your business on the platform.
                </FieldDescription>
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
              {loading ? <Spinner className="mr-2" /> : null}
              Create business account
            </Button>
          </form>
        )}

        {/* ── Client Form ── */}
        {role === "client" && (
          <form onSubmit={onSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="client-phone">
                  <Smartphone className="mr-1.5 inline h-4 w-4" />
                  Phone number
                </FieldLabel>
                <Input
                  id="client-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+232 78 000 000"
                  required
                />
                  Sign up instantly without a password.
              </Field>
            </FieldGroup>
            <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
              {loading ? <Spinner className="mr-2" /> : null}
              Create account
            </Button>
          </form>
        )}

        {/* Google Sign-In button (scaffolded) */}
        <div className="mt-4">
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/70" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground">or continue with</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={() => toast.info("Google Sign-In will be available once OAuth credentials are configured.")}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Sign in with Google
          </Button>
        </div>
      </div>
    )
  }

  // ─── Step 3: OTP Verification ───
  if (step === "otp") {
    return (
      <form onSubmit={onSubmit} className="mt-6">
        <button
          type="button"
          onClick={() => { setStep("form"); setOtpSent(false); setOtpCode("") }}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-5 rounded-lg bg-accent/10 border border-accent/20 px-4 py-3">
          <p className="text-sm font-medium text-accent">OTP sent!</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            We sent a 6-digit code to <span className="font-mono font-semibold">{phone}</span>. Enter it below.
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="otp-input">Verification code</FieldLabel>
            <Input
              id="otp-input"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="000000"
              maxLength={6}
              className="text-center text-2xl tracking-[0.5em] font-mono"
              required
              autoFocus
            />
          </Field>
        </FieldGroup>

        <Button type="submit" disabled={loading || otpCode.length !== 6} className="mt-6 w-full" size="lg">
          {loading ? <Spinner className="mr-2" /> : null}
          Verify & Create Account
        </Button>

        <button
          type="button"
          onClick={sendOtp}
          className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Didn&apos;t receive it? <span className="font-semibold underline">Resend OTP</span>
        </button>
      </form>
    )
  }

  return null
}
