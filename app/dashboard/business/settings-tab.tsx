"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import type { Business } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { ImagePlus, Save } from "lucide-react"

export function SettingsTab({ business }: { business: Business }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(business.name)
  const [description, setDescription] = useState(business.description)
  const [phone, setPhone] = useState(business.phone)
  const [address, setAddress] = useState(business.address)
  const [city, setCity] = useState(business.city)

  const [imageUrl, setImageUrl] = useState<string | undefined>(business.imageUrl ?? undefined)
  const [preview, setPreview] = useState<string | undefined>(business.imageUrl ?? undefined)
  const fileRef = useRef<HTMLInputElement>(null)

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
      setPreview(dataUrl)
      setImageUrl(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/businesses/${business.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, phone, address, city, imageUrl }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || "Failed to update profile")
      }
      toast.success("Business profile updated successfully!")
      router.refresh()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto glass-card rounded-xl border border-white/10 p-6 mt-6">
      <h2 className="text-xl font-bold mb-6">Business Settings</h2>
      <form onSubmit={onSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel>Business Logo / Advert Image</FieldLabel>
            <div
              className="relative mt-1 flex h-48 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-secondary/50 hover:border-primary/40 hover:bg-primary/5 transition-colors overflow-hidden group"
              onClick={() => fileRef.current?.click()}
            >
              {preview ? (
                <>
                  <img src={preview} alt="Business logo preview" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                    <ImagePlus className="h-8 w-8 mb-2" />
                    <span className="text-sm font-medium">Change image</span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImagePlus className="h-8 w-8" />
                  <span className="text-sm font-medium">Click to upload your logo</span>
                  <span className="text-xs">JPG, PNG, WEBP (max 4 MB)</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <FieldDescription>This image will be displayed on your marketplace card.</FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="b-name">Business Name</FieldLabel>
            <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </Field>

          <Field>
            <FieldLabel htmlFor="b-desc">Description</FieldLabel>
            <textarea
              id="b-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="b-city">City</FieldLabel>
              <select
                id="b-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                required
              >
                <option value="Freetown">Freetown</option>
                <option value="Bo">Bo</option>
                <option value="Kenema">Kenema</option>
                <option value="Makeni">Makeni</option>
              </select>
            </Field>

            <Field>
              <FieldLabel htmlFor="b-phone">Phone</FieldLabel>
              <Input id="b-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="b-addr">Address</FieldLabel>
            <Input id="b-addr" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </Field>
        </FieldGroup>

        <div className="mt-8 flex justify-end">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Spinner className="mr-2" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
