"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Car, Zap, UtensilsCrossed, Trash2, ShoppingBag } from "lucide-react"

interface Activity {
  id: string
  category: string
  activity_type: string
  carbon_footprint: number
  date: string
  created_at: string
}

interface RecentActivitiesProps {
  userId: string
}

const categoryIcons = {
  transportation: Car,
  energy: Zap,
  food: UtensilsCrossed,
  waste: Trash2,
  shopping: ShoppingBag,
}

const categoryColors = {
  transportation: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
  energy: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  food: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  waste: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  shopping: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
}

export function RecentActivities({ userId }: RecentActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (userId) {
      loadRecentActivities()
    }
  }, [userId])

  const loadRecentActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("carbon_activities")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5)

      if (error) throw error
      setActivities(data || [])
    } catch (error) {
      console.error("Error loading recent activities:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Less than an hour ago"
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "1 day ago"
    if (diffInDays < 7) return `${diffInDays} days ago`
    
    return date.toLocaleDateString()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg border animate-pulse">
                <div className="w-10 h-10 rounded-lg bg-muted"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-16 h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              📋
            </div>
            <h3 className="text-lg font-medium mb-2">No activities yet</h3>
            <p className="text-sm text-muted-foreground">
              Start tracking your carbon footprint by logging your first activity.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = categoryIcons[activity.category as keyof typeof categoryIcons] || Car
              return (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      categoryColors[activity.category as keyof typeof categoryColors] || "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.activity_type}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.category.charAt(0).toUpperCase() + activity.category.slice(1)} • {getTimeAgo(activity.created_at)}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.carbon_footprint} kg CO₂
                  </Badge>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
