export type UserRole = "business" | "referrer" | "client" | "admin"

export interface User {
  id: string
  name: string
  phone: string
  email?: string
  role: UserRole
  passwordHash: string
  createdAt: Date | string
  // Referrer-only
  referrerCode?: string
  registeredReferrerCode?: string
  signature?: string
  trainingCompleted?: boolean
  orangeMoneyNumber?: string
  // Business-only
  businessId?: string
}

export type BusinessCategory =
  | "Hospitality"
  | "Food & Catering"
  | "Construction"
  | "Real Estate"
  | "Professional Services"
  | "Retail"
  | "Transportation"
  | "Beauty & Wellness"
  | "Other"

export interface Business {
  id: string
  ownerId: string
  name: string
  category: string
  description: string
  city: string
  address: string
  phone: string
  commissionPct: number // 5..15
  verified: boolean
  imageUrl?: string | null
  createdAt: Date | string
}

export interface ReferralLink {
  id: string
  code: string // short code used in /r/[code]
  referrerId: string
  businessId: string
  clicks: number
  createdAt: Date | string
}

export type ProductStatus = "pending" | "approved" | "rejected"

export interface Product {
  id: string
  businessId: string
  name: string
  description: string
  price: number // in SLE
  category: string
  imageUrl?: string | null
  status: ProductStatus | string
  rejectionNote?: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export type SaleStatus = "pending" | "confirmed" | "rejected"

export interface Sale {
  id: string
  businessId: string
  referrerId: string
  referralCode: string
  customerName: string
  customerPhone: string
  amount: number // in SLE (Leones)
  commissionPct: number
  commissionAmount: number
  referrerEarning: number // 80% of commission
  platformEarning: number // 20% of commission
  status: SaleStatus
  note?: string
  createdAt: Date | string
  confirmedAt?: Date | string
}

export interface SafeUser {
  id: string
  name: string
  phone: string
  email?: string
  role: UserRole
  referrerCode?: string
  registeredReferrerCode?: string
  signature?: string
  trainingCompleted?: boolean
  orangeMoneyNumber?: string
  businessId?: string
  createdAt: Date | string
}
