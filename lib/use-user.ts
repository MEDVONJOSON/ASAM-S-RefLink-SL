"use client"

import useSWR from "swr"
import type { SafeUser } from "./types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useUser() {
  const { data, error, isLoading, mutate } = useSWR<{ user: SafeUser | null }>("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
  })
  return {
    user: data?.user ?? null,
    isLoading,
    error,
    refresh: mutate,
  }
}
