"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { SafeUser } from "@/lib/types"

export function EditAdminProfileModal({ user }: { user: SafeUser }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email || "")
  const [imageUrl, setImageUrl] = useState<string | undefined>(user.imageUrl ?? undefined)
  const [preview, setPreview] = useState<string | undefined>(user.imageUrl ?? undefined)

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
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update profile")
      
      toast.success("Profile updated successfully")
      setOpen(false)
      window.location.reload()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Update your admin profile details.</DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="mt-4">
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="relative h-20 w-20 overflow-hidden rounded-full border border-white/20 bg-primary/10">
              {preview ? (
                <img src={preview} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-primary/50 text-2xl font-bold">
                  {name[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="admin-profile-pic"
                onChange={handleFileChange}
              />
              <label
                htmlFor="admin-profile-pic"
                className="cursor-pointer text-sm text-primary hover:underline"
              >
                Upload Profile Picture
              </label>
            </div>
          </div>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="edit-admin-name">Full Name</FieldLabel>
              <Input
                id="edit-admin-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-admin-email">Email</FieldLabel>
              <Input
                id="edit-admin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@reflink.sl"
                required
              />
            </Field>
          </FieldGroup>
          <div className="mt-6 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Spinner className="mr-2" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
