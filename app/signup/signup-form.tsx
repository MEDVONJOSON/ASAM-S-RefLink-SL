"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"
import { mutate } from "swr"
import { ImagePlus } from "lucide-react"

const CATEGORIES = [
  "Hospitality",
  "Food & Catering",
  "Construction",
  "Real Estate",
  "Professional Services",
  "Retail",
  "Transportation",
  "Beauty & Wellness",
  "Other",
]

export function SignupForm({ initialRole }: { initialRole: "business" | "referrer" | "client" }) {
  const router = useRouter()
  const [role, setRole] = useState<"business" | "referrer" | "client">(initialRole)
  const [loading, setLoading] = useState(false)

  // Common
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  // Business
  const [businessName, setBusinessName] = useState("")
  const [category, setCategory] = useState("Hospitality")
  const [city, setCity] = useState("Freetown")
  const [address, setAddress] = useState("")
  const [description, setDescription] = useState("")
  const [commissionPct, setCommissionPct] = useState("10")

  // Business image
  const [businessImageUrl, setBusinessImageUrl] = useState<string | undefined>(undefined)
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined)
  const fileRef = useRef<HTMLInputElement>(null)

  // Referrer
  const [orangeMoneyNumber, setOrangeMoneyNumber] = useState("")
  const [registeredReferrerCode, setRegisteredReferrerCode] = useState("")

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image too large — max 4 MB")
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImagePreview(dataUrl)
      setBusinessImageUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const payload: Record<string, any> = {
        name,
        phone,
        email: email || undefined,
        password,
        role,
      }
      if (role === "business") {
        Object.assign(payload, {
          businessName,
          category,
          city,
          address,
          description,
          commissionPct: Number(commissionPct),
          imageUrl: businessImageUrl,
        })
      } else if (role === "referrer") {
        payload.orangeMoneyNumber = orangeMoneyNumber || phone
        payload.registeredReferrerCode = registeredReferrerCode
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Signup failed")
      await mutate("/api/auth/me")
      toast.success(`Welcome to RefLink SL, ${data.user.name.split(" ")[0]}!`)
      router.push(
        role === "business" ? "/dashboard/business" : role === "client" ? "/dashboard/client" : "/dashboard/referrer",
      )
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6">
      <Tabs value={role} onValueChange={(v) => setRole(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="referrer">I&apos;m a referrer</TabsTrigger>
          <TabsTrigger value="business">I&apos;m a business</TabsTrigger>
          <TabsTrigger value="client">I&apos;m a client</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <FieldGroup>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="name">Full name</FieldLabel>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="phone">Phone</FieldLabel>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+232 78 000 000"
                  required
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="email">Email (optional)</FieldLabel>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={4}
                  required
                />
              </Field>
            </div>
          </FieldGroup>
        </div>

        <TabsContent value="referrer" className="mt-2">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="asam-code">Referrer code (Registered at ASAM&apos;S)</FieldLabel>
              <Input
                id="asam-code"
                value={registeredReferrerCode}
                onChange={(e) => setRegisteredReferrerCode(e.target.value)}
                placeholder="Enter your ASAM'S registration code"
                required={role === "referrer"}
              />
              <FieldDescription>The unique code you received when registering with ASAM&apos;S.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="orange">Orange Money number</FieldLabel>
              <Input
                id="orange"
                value={orangeMoneyNumber}
                onChange={(e) => setOrangeMoneyNumber(e.target.value)}
                placeholder="Defaults to your phone number"
              />
              <FieldDescription>This is where your earnings will be sent.</FieldDescription>
            </Field>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="business" className="mt-2">
          <FieldGroup>
            {/* Business Profile Image Upload */}
            <Field>
              <FieldLabel>Business Profile Image</FieldLabel>
              <div
                className="relative mt-1 flex h-40 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-secondary/50 hover:border-primary/40 hover:bg-primary/5 transition-colors overflow-hidden group"
                onClick={() => fileRef.current?.click()}
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="Business image preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                      <ImagePlus className="h-7 w-7 mb-1.5" />
                      <span className="text-sm font-medium">Change image</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <ImagePlus className="h-7 w-7" />
                    <span className="text-sm font-medium">Upload your business image</span>
                    <span className="text-xs">JPG, PNG, WEBP (max 4 MB)</span>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <FieldDescription>This image will be your business profile on the marketplace. You can change it later in Settings.</FieldDescription>
            </Field>

            <Field>
              <FieldLabel htmlFor="bname">Business name</FieldLabel>
              <Input
                id="bname"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required={role === "business"}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel>City</FieldLabel>
                <Select value={city} onValueChange={setCity}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Freetown">Freetown</SelectItem>
                    <SelectItem value="Bo">Bo</SelectItem>
                    <SelectItem value="Kenema">Kenema</SelectItem>
                    <SelectItem value="Makeni">Makeni</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field>
              <FieldLabel htmlFor="address">Address</FieldLabel>
              <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <Field>
              <FieldLabel htmlFor="desc">Description</FieldLabel>
              <Textarea
                id="desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what you offer..."
                rows={3}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="comm">Commission you&apos;ll pay on each confirmed sale</FieldLabel>
              <Select value={commissionPct} onValueChange={setCommissionPct}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 7, 8, 10, 12, 15].map((c) => (
                    <SelectItem key={c} value={String(c)}>{c}%</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Between 5% and 15%. Higher commissions attract more referrers.
              </FieldDescription>
            </Field>
          </FieldGroup>
        </TabsContent>

        <TabsContent value="client" className="mt-2">
          <p className="text-sm text-muted-foreground">
            Create a client account to browse verified businesses and track purchases you make using referral codes.
            No extra details needed — you&apos;re all set with the info above.
          </p>
        </TabsContent>
      </Tabs>

      <Button type="submit" disabled={loading} className="mt-6 w-full" size="lg">
        {loading ? <Spinner className="mr-2" /> : null}
        Create account
      </Button>
    </form>
  )
}
