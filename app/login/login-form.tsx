"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { mutate } from "swr"

export function LoginForm() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Login failed")
      await mutate("/api/auth/me")
      const role = data.user.role
      toast.success(`Welcome, ${data.user.name.split(" ")[0]}`)
      router.push(
        role === "business"
          ? "/dashboard/business"
          : role === "referrer"
            ? "/dashboard/referrer"
            : "/admin",
      )
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6">
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="identifier">Phone, email or signature</FieldLabel>
          <Input
            id="identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="e.g. +232 78 000 000 or signature"
            required
            autoComplete="username"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={loading} className="mt-6 w-full">
        {loading ? <Spinner className="mr-2" /> : null}
        Log in
      </Button>
    </form>
  )
}
