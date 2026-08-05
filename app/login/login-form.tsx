"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { mutate } from "swr"
import { ArrowLeft, Smartphone, KeyRound } from "lucide-react"

type LoginStep = "identify" | "otp" | "password"

export function LoginForm() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>("identify")
  const [identifier, setIdentifier] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [password, setPassword] = useState("")
  const [maskedPhone, setMaskedPhone] = useState("")
  const [detectedRole, setDetectedRole] = useState("")
  const [loading, setLoading] = useState(false)
  const googleButtonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const renderGoogleButton = () => {
      if (typeof window === "undefined" || !window.google) return

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      })
      
      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          width: googleButtonRef.current.offsetWidth,
        })
      }
    }

    if (step === "identify") {
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
        const role = data.user.role
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`)
        router.push(
          role === "business"
            ? "/dashboard/business"
            : role === "referrer"
              ? "/dashboard/referrer"
              : role === "client"
                ? "/dashboard/client"
                : "/admin"
        )
      } else if (data.action === "signup") {
        // Redirect to signup with pre-filled data
        const params = new URLSearchParams({
          googleId: data.googleId,
          email: data.email || "",
          name: data.name || "",
        })
        toast.info("Account not found. Please complete your registration.")
        router.push(`/get-started?${params.toString()}`)
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onIdentify(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")

      if (data.step === "redirect") {
        // Admin → redirect to admin login
        toast.info(data.message || "Redirecting to admin login…")
        router.push(data.redirectTo)
        return
      }

      if (data.user) {
        // Direct login (OTP bypassed)
        await mutate("/api/auth/me")
        const role = data.user.role
        toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`)
        router.push(
          role === "business"
            ? "/dashboard/business"
            : role === "referrer"
              ? "/dashboard/referrer"
              : role === "client"
                ? "/dashboard/client"
                : "/admin",
        )
        return
      }

      if (data.step === "otp") {
        setMaskedPhone(data.maskedPhone)
        setDetectedRole(data.role)
        setStep("otp")
        toast.success("OTP sent to your phone!")
      } else if (data.step === "password") {
        setDetectedRole(data.role)
        setStep("password")
      }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function onComplete(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Record<string, string> = { identifier }
      if (step === "otp") payload.otpCode = otpCode
      if (step === "password") payload.password = password

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")

      await mutate("/api/auth/me")
      const role = data.user.role
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`)
      router.push(
        role === "business"
          ? "/dashboard/business"
          : role === "referrer"
            ? "/dashboard/referrer"
            : role === "client"
              ? "/dashboard/client"
              : "/admin",
      )
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function resendOtp() {
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to resend")
      toast.success("New OTP sent!")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  // ─── Step 1: Identify ───
  if (step === "identify") {
    return (
      <div className="mt-6">
        <form onSubmit={onIdentify}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-identifier">
                <Smartphone className="mr-1.5 inline h-4 w-4" />
                Phone, email, or code
              </FieldLabel>
              <Input
                id="login-identifier"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. +232 78 000 000, your@email.com, or signature"
                required
                autoComplete="username"
                autoFocus
              />
              <FieldDescription>
                Enter any identifier linked to your account. We&apos;ll find you.
              </FieldDescription>
            </Field>
          </FieldGroup>
          <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
            {loading ? <Spinner className="mr-2" /> : null}
            Continue
          </Button>
        </form>

        {/* Google Sign-In placeholder */}
        <div className="mt-4">
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
      </div>
    )
  }

  // ─── Step 2a: OTP Verification ───
  if (step === "otp") {
    return (
      <form onSubmit={onComplete} className="mt-6">
        <button
          type="button"
          onClick={() => { setStep("identify"); setOtpCode("") }}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-5 rounded-lg bg-accent/10 border border-accent/20 px-4 py-3">
          <p className="text-sm font-medium text-accent">OTP sent!</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            We sent a 6-digit code to <span className="font-mono font-semibold">{maskedPhone}</span>. Enter it below.
          </p>
          {detectedRole && (
            <p className="mt-1 text-xs text-muted-foreground">
              Account type: <span className="capitalize font-semibold">{detectedRole}</span>
            </p>
          )}
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="login-otp">Verification code</FieldLabel>
            <Input
              id="login-otp"
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
          Log in
        </Button>

        <button
          type="button"
          onClick={resendOtp}
          className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          Didn&apos;t receive it? <span className="font-semibold underline">Resend OTP</span>
        </button>
      </form>
    )
  }

  // ─── Step 2b: Password (legacy business accounts) ───
  if (step === "password") {
    return (
      <form onSubmit={onComplete} className="mt-6">
        <button
          type="button"
          onClick={() => { setStep("identify"); setPassword("") }}
          className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-5 rounded-lg bg-secondary/50 px-4 py-3">
          <p className="text-sm font-medium">Password required</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Your account uses a password. Enter it below to continue.
          </p>
        </div>

        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="login-password">
              <KeyRound className="mr-1.5 inline h-4 w-4" />
              Password
            </FieldLabel>
            <Input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              autoFocus
            />
          </Field>
        </FieldGroup>

        <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
          {loading ? <Spinner className="mr-2" /> : null}
          Log in
        </Button>
      </form>
    )
  }

  return null
}
