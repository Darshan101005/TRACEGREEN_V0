"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Home, BarChart3, Target, Trophy, Users, Gift, BookOpen, Settings, LogOut, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardNavProps {
  user: {
    email?: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  } | null // Allow user to be null
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Track Activity", href: "/dashboard/track", icon: BarChart3 },
  { name: "Goals", href: "/dashboard/goals", icon: Target },
  { name: "Achievements", href: "/dashboard/achievements", icon: Trophy },
  { name: "Community", href: "/dashboard/community", icon: Users },
  { name: "Rewards", href: "/dashboard/rewards", icon: Gift },
  { name: "Learn", href: "/dashboard/learn", icon: BookOpen },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getUserInitials = (user: any) => {
    if (!user) return "U"

    // Special case for admin@tracegreen.com
    if (user.email === "admin@tracegreen.com") {
      return "A"
    }

    // If user has full_name, use it
    if (user.user_metadata?.full_name) {
      const name = user.user_metadata.full_name.trim()
      if (name) {
        return name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) // Limit to 2 characters
      }
    }

    // Handle email-based initials
    if (user.email) {
      const email = user.email.toLowerCase()

      // Special handling for usernames like "dar.1010" -> "D"
      if (email.includes(".") && !email.includes("@")) {
        return email.charAt(0).toUpperCase()
      }

      // For emails like "dar.1010@example.com" -> "D"
      const localPart = email.split("@")[0]
      if (localPart.includes(".")) {
        const parts = localPart.split(".")
        if (parts[0]) {
          return parts[0].charAt(0).toUpperCase()
        }
      }

      // Default: first letter of email
      return email.charAt(0).toUpperCase()
    }

    return "U"
  }

  const userInitials = getUserInitials(user)

  if (!user) {
    return (
      <nav className="bg-white dark:bg-gray-900 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/dashboard" className="flex items-center gap-3">
                  <Image
                    src="/images/trace-green-logo.png"
                    alt="Trace Green"
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                  <span className="text-xl font-bold text-primary">Trace Green</span>
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <Image
                  src="/images/trace-green-logo.png"
                  alt="Trace Green"
                  width={32}
                  height={32}
                  className="rounded-lg shadow-sm group-hover:shadow-glow transition-shadow"
                />
                <span className="text-xl font-bold text-gradient-primary bg-clip-text">Trace Green</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:ml-10 sm:flex sm:items-center">
              <ul className="flex gap-2">
                {navigation.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          "group/nav relative flex items-center gap-2 px-3 py-2 text-sm font-medium leading-none transition-colors",
                          "text-foreground/70 hover:text-foreground",
                          isActive && "text-foreground"
                        )}
                      >
                        <Icon className="w-4 h-4 transition-colors group-hover/nav:text-foreground" />
                        <span>{item.name}</span>
                        {/* Active underline */}
                        <span
                          className={cn(
                            "pointer-events-none absolute left-2 right-2 -bottom-[6px] h-[3px] rounded-full bg-gradient-to-r from-primary to-accent opacity-0 transition-opacity",
                            isActive && "opacity-100"
                          )}
                          aria-hidden="true"
                        />
                        {/* Hover subtle background (not affecting layout) */}
                        <span className="pointer-events-none absolute inset-0 rounded-md bg-muted/60 opacity-0 group-hover/nav:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>

          {/* User Menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt="Profile" />
                    <AvatarFallback className="bg-gradient-to-br from-green-400 to-cyan-400 text-white font-semibold">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || 
                       (user?.email ? user.email.split('@')[0] : "User")}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Profile & Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 text-base font-medium",
                    isActive
                      ? "bg-primary/10 border-r-4 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800",
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
          <div className="pt-4 pb-3 border-t border-border">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt="Profile" />
                  <AvatarFallback className="bg-gradient-to-br from-green-400 to-cyan-400 text-white font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-foreground">
                  {user?.user_metadata?.full_name || 
                   (user?.email ? user.email.split('@')[0] : "User")}
                </div>
                <div className="text-sm font-medium text-muted-foreground">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-4 py-2 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-gray-50 dark:hover:bg-gray-800"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Settings className="w-5 h-5" />
                Profile & Settings
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-2 text-base font-medium text-destructive hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left"
              >
                <LogOut className="w-5 h-5" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
