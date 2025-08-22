"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Target, Gift, Trophy, BookOpen, Activity } from "lucide-react"

interface AdminStats {
  totalUsers: number
  activeChallenges: number
  totalRewards: number
  totalBadges: number
  totalContent: number
  recentActivities: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeChallenges: 0,
    totalRewards: 0,
    totalBadges: 0,
    totalContent: 0,
    recentActivities: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load various statistics
        const [usersResult, challengesResult, rewardsResult, badgesResult, contentResult, activitiesResult] =
          await Promise.all([
            supabase.from("profiles").select("id", { count: "exact", head: true }),
            supabase.from("challenges").select("id", { count: "exact", head: true }).eq("status", "active"),
            supabase.from("rewards").select("id", { count: "exact", head: true }).eq("is_active", true),
            supabase.from("badges").select("id", { count: "exact", head: true }).eq("is_active", true),
            supabase.from("educational_content").select("id", { count: "exact", head: true }).eq("is_published", true),
            supabase
              .from("carbon_activities")
              .select("id", { count: "exact", head: true })
              .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          ])

        setStats({
          totalUsers: usersResult.count || 0,
          activeChallenges: challengesResult.count || 0,
          totalRewards: rewardsResult.count || 0,
          totalBadges: badgesResult.count || 0,
          totalContent: contentResult.count || 0,
          recentActivities: activitiesResult.count || 0,
        })
      } catch (error) {
        console.error("Error loading admin stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStats()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Active Challenges",
      value: stats.activeChallenges,
      icon: Target,
      description: "Currently running",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Available Rewards",
      value: stats.totalRewards,
      icon: Gift,
      description: "In marketplace",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Active Badges",
      value: stats.totalBadges,
      icon: Trophy,
      description: "Achievement badges",
      color: "from-yellow-500 to-orange-500",
    },
    {
      title: "Published Content",
      value: stats.totalContent,
      icon: BookOpen,
      description: "Educational articles",
      color: "from-indigo-500 to-purple-500",
    },
    {
      title: "Recent Activities",
      value: stats.recentActivities,
      icon: Activity,
      description: "Last 7 days",
      color: "from-red-500 to-pink-500",
    },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Manage your Trace Green platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="bg-white/70 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-green-700">Recent Activity</CardTitle>
            <CardDescription>Latest user activities and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-sm">New user registered</p>
                <span className="text-xs text-muted-foreground ml-auto">2 min ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm">Challenge completed</p>
                <span className="text-xs text-muted-foreground ml-auto">5 min ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <p className="text-sm">Reward redeemed</p>
                <span className="text-xs text-muted-foreground ml-auto">10 min ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-blue-700">System Health</CardTitle>
            <CardDescription>Platform performance and status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Healthy</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Fast</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Storage</span>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">75% Used</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-purple-700">Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm">Create new challenge</button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm">
                Add reward to marketplace
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm">
                Publish educational content
              </button>
              <button className="w-full text-left p-2 hover:bg-gray-50 rounded-lg text-sm">
                Create achievement badge
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
