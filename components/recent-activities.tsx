"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Zap, UtensilsCrossed, Trash2 } from "lucide-react"

const recentActivities = [
  {
    id: 1,
    category: "transportation",
    activity: "Car trip to office",
    amount: "25 km",
    carbon: 5.2,
    time: "2 hours ago",
    icon: Car,
  },
  {
    id: 2,
    category: "energy",
    activity: "Home electricity usage",
    amount: "12 kWh",
    carbon: 3.8,
    time: "5 hours ago",
    icon: Zap,
  },
  {
    id: 3,
    category: "food",
    activity: "Lunch (chicken curry)",
    amount: "1 meal",
    carbon: 2.1,
    time: "1 day ago",
    icon: UtensilsCrossed,
  },
  {
    id: 4,
    category: "waste",
    activity: "Household waste",
    amount: "2 kg",
    carbon: 0.8,
    time: "2 days ago",
    icon: Trash2,
  },
]

const categoryColors = {
  transportation: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
  energy: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  food: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  waste: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
}

export function RecentActivities() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivities.map((activity) => {
            const Icon = activity.icon
            return (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColors[activity.category as keyof typeof categoryColors]}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{activity.activity}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.amount} • {activity.time}
                  </p>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {activity.carbon} kg CO₂
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
