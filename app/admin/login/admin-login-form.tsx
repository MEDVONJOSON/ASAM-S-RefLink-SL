"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { mutate } from "swr"
import { Mail, KeyRound } from "lucide-react"

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      await mutate("/api/auth/me")
      toast.success("Welcome, Admin")
      router.push("/admin")
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="admin-email">
            <Mail className="mr-1.5 inline h-4 w-4" />
            Email address
          </FieldLabel>
          <Input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@reflink.sl"
            required
            autoComplete="username"
            autoFocus
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="admin-password">
            <KeyRound className="mr-1.5 inline h-4 w-4" />
            Password
          </FieldLabel>
          <Input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
        {loading ? <Spinner className="mr-2" /> : null}
        Sign in
      </Button>
    </form>
  )
}
