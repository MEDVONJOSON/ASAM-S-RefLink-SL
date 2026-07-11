"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Logo } from "./logo"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useUser } from "@/lib/use-user"
import { LogOut, Menu, LayoutDashboard, Store, UserPlus } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function SiteHeader() {
  const { user, refresh } = useUser()
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    await refresh()
    router.push("/")
  }

  const dashHref =
    user?.role === "business"
      ? "/dashboard/business"
      : user?.role === "referrer"
        ? "/dashboard/referrer"
        : user?.role === "client"
          ? "/dashboard/client"
          : user?.role === "admin"
            ? "/admin"
            : "/login"

  return (
    <header className="sticky top-0 z-50 w-full glass transition-all duration-300">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-2 md:flex">
          <Link
            href="/businesses"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary"
          >
            Marketplace
          </Link>
          <Link
            href="/how-it-works"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary"
          >
            How it works
          </Link>
          <Link
            href="/for-referrers"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-primary/10 hover:text-primary"
          >
            For Referrers
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{user.name.split(" ")[0]}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 glass-card border-none">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{user.name}</span>
                    <span className="text-xs capitalize text-muted-foreground">{user.role}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href={dashHref}>
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/businesses">
                    <Store className="mr-2 h-4 w-4" /> Browse businesses
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">
                  <UserPlus className="mr-1.5 h-4 w-4" /> Get started
                </Link>
              </Button>
            </>
          )}
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1">
                <Link href="/businesses" className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                  Marketplace
                </Link>
                <Link href="/how-it-works" className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                  How it works
                </Link>
                <Link href="/for-referrers" className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                  For Referrers
                </Link>
                {user ? (
                  <>
                    <Link href={dashHref} className="rounded-md px-3 py-2 text-sm hover:bg-secondary">
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="rounded-md px-3 py-2 text-left text-sm text-destructive hover:bg-secondary"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <div className="mt-4 flex flex-col gap-2">
                    <Button asChild variant="outline">
                      <Link href="/login">Log in</Link>
                    </Button>
                    <Button asChild>
                      <Link href="/signup">Get started</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
