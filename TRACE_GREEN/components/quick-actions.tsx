"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Car, Zap, UtensilsCrossed, Trash2, Plus } from "lucide-react"
import Link from "next/link"

const quickActions = [
  {
    name: "Transportation",
    icon: Car,
    href: "/dashboard/track?category=transportation",
    gradient: "bg-gradient-to-br from-red-400 to-red-600",
    hoverGradient: "hover:from-red-500 hover:to-red-700",
  },
  {
    name: "Energy",
    icon: Zap,
    href: "/dashboard/track?category=energy",
    gradient: "bg-gradient-to-br from-primary to-amber-600",
    hoverGradient: "hover:from-primary hover:to-amber-700",
  },
  {
    name: "Food",
    icon: UtensilsCrossed,
    href: "/dashboard/track?category=food",
    gradient: "bg-gradient-to-br from-green-400 to-green-600",
    hoverGradient: "hover:from-green-500 hover:to-green-700",
  },
  {
    name: "Waste",
    icon: Trash2,
    href: "/dashboard/track?category=waste",
    gradient: "bg-gradient-to-br from-secondary to-cyan-600",
    hoverGradient: "hover:from-secondary hover:to-cyan-700",
  },
]

export function QuickActions() {
  return (
    <Card className="shadow-card border-0 bg-gradient-to-br from-card to-muted/20 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-xl">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link key={action.name} href={action.href}>
                <div
                  className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-105 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div
                    className={`absolute inset-0 ${action.gradient} ${action.hoverGradient} transition-all duration-300`}
                  />
                  <div className="relative p-6 text-center text-white">
                    <div className="mb-3 flex justify-center">
                      <Icon className="w-8 h-8 drop-shadow-lg" />
                    </div>
                    <span className="text-sm font-semibold drop-shadow-sm">{action.name}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
        <div className="mt-6">
          <Link href="/dashboard/track">
            <Button className="w-full h-12 text-lg font-semibold button-hover bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 border-0 shadow-glow">
              <Plus className="w-5 h-5 mr-2" />
              Log New Activity
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
