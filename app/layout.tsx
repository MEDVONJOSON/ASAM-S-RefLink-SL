import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/sonner"
import { PwaRegister } from "@/components/pwa-register"
import { ChatWidget } from "@/components/chat-widget"
import { CartProvider } from "@/lib/cart-context"
import "./globals.css"

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: {
    default: "ASAM'S REFLINK SL — Pay-per-result referral network for Sierra Leone",
    template: "%s · ASAM'S REFLINK SL",
  },
  description:
    "Sierra Leone's pay-per-result referral network. Businesses list for free, trained youth referrers earn on every confirmed sale, customers find verified services.",
  applicationName: "ASAM'S REFLINK SL",
  generator: "v0.app",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ASAM'S REFLINK SL",
  },
  icons: {
    icon: [
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  openGraph: {
    title: "ASAM'S REFLINK SL",
    description:
      "Pay-per-result referral network for Sierra Leone. No upfront fees. Real earnings for youth.",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#ff6a1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="bg-background">
      <head>
        <script src="https://accounts.google.com/gsi/client" async defer></script>
      </head>
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Toaster richColors position="top-center" />
        <PwaRegister />
        <ChatWidget />
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
