"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Target, 
  Gift, 
  Award, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  Plus,
  Eye,
  UserPlus,
  Settings
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface AdminStats {
  totalUsers: number
  activeUsers: number
  bannedUsers: number
  adminUsers: number
  totalChallenges: number
  activeChallenges: number
  totalRewards: number
  activeRewards: number
  totalBadges: number
  platformHealth: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  timestamp: string
  user_email?: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    adminUsers: 0,
    totalChallenges: 0,
    activeChallenges: 0,
    totalRewards: 0,
    activeRewards: 0,
    totalBadges: 0,
    platformHealth: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // Load user statistics
      const { data: allUsers } = await supabase
        .from("profiles")
        .select("*")

      const totalUsers = allUsers?.length || 0
      const activeUsers = allUsers?.filter(user => 
        new Date(user.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0
      const bannedUsers = allUsers?.filter(user => user.is_banned).length || 0
      const adminUsers = allUsers?.filter(user => user.is_admin).length || 0

      // Load challenge statistics
      const { data: allChallenges } = await supabase
        .from("challenges")
        .select("*")

      const totalChallenges = allChallenges?.length || 0
      const activeChallenges = allChallenges?.filter(c => c.is_active).length || 0

      // Load reward statistics
      const { data: allRewards } = await supabase
        .from("rewards")
        .select("*")

      const totalRewards = allRewards?.length || 0
      const activeRewards = allRewards?.filter(r => r.is_active).length || 0

      // Load badge statistics
      const { data: allBadges } = await supabase
        .from("badges")
        .select("*")

      const totalBadges = allBadges?.length || 0

      // Calculate platform health (simple metric based on active content)
      const platformHealth = Math.min(100, 
        ((activeUsers / Math.max(totalUsers, 1)) * 40) +
        ((activeChallenges / Math.max(totalChallenges, 1)) * 30) +
        ((activeRewards / Math.max(totalRewards, 1)) * 30)
      )

      setStats({
        totalUsers,
        activeUsers,
        bannedUsers,
        adminUsers,
        totalChallenges,
        activeChallenges,
        totalRewards,
        activeRewards,
        totalBadges,
        platformHealth: Math.round(platformHealth)
      })

      // Load recent activities (mock data for now)
      setRecentActivities([
        {
          id: "1",
          type: "user_registration",
          description: "New user registered",
          timestamp: new Date().toISOString(),
          user_email: "user@example.com"
        },
        {
          id: "2", 
          type: "challenge_completed",
          description: "Challenge completed by user",
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
          user_email: "active@example.com"
        },
        {
          id: "3",
          type: "reward_redeemed", 
          description: "Reward redeemed",
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          user_email: "winner@example.com"
        }
      ])

    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user_registration":
        return <UserPlus className="w-4 h-4 text-green-600" />
      case "challenge_completed":
        return <Target className="w-4 h-4 text-blue-600" />
      case "reward_redeemed":
        return <Gift className="w-4 h-4 text-purple-600" />
      default:
        return <Activity className="w-4 h-4 text-gray-600" />
    }
  }

  const getHealthBadge = (health: number) => {
    if (health >= 80) {
      return <Badge className="bg-green-100 text-green-700">Excellent</Badge>
    } else if (health >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-700">Good</Badge>
    } else if (health >= 40) {
      return <Badge className="bg-orange-100 text-orange-700">Fair</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-700">Needs Attention</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Complete control panel for TraceGreen platform</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View as User
          </Button>
          <Button 
            onClick={() => router.push("/admin/challenges")}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Quick Actions
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Users Stats */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.activeUsers}</span> active this week
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/users')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-600">{stats.bannedUsers}</span> banned users
            </p>
          </CardContent>
        </Card>

        {/* Challenges Stats */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/challenges')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChallenges}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeChallenges}</span> currently active
            </p>
          </CardContent>
        </Card>

        {/* Rewards Stats */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/admin/rewards')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRewards}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{stats.activeRewards}</span> available now
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Health and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Platform Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Platform Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <div className="text-2xl font-bold">{stats.platformHealth}%</div>
              {getHealthBadge(stats.platformHealth)}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${stats.platformHealth}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on user activity and content engagement
            </p>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/challenges">
                <Plus className="w-4 h-4 mr-2" />
                Create New Challenge
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/rewards">
                <Gift className="w-4 h-4 mr-2" />
                Add New Reward
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/users">
                <Users className="w-4 h-4 mr-2" />
                Manage Users
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link href="/admin/content">
                <Activity className="w-4 h-4 mr-2" />
                Update Content
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.bannedUsers > 0 && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  {stats.bannedUsers} banned users require review
                </div>
              )}
              {stats.activeChallenges < 3 && (
                <div className="flex items-center gap-2 text-sm text-yellow-600">
                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                  Low number of active challenges
                </div>
              )}
              {stats.activeRewards < 5 && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <div className="w-2 h-2 bg-orange-600 rounded-full"></div>
                  Consider adding more rewards
                </div>
              )}
              {stats.platformHealth < 60 && (
                <div className="flex items-center gap-2 text-sm text-red-600">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  Platform engagement needs attention
                </div>
              )}
              {stats.bannedUsers === 0 && stats.activeChallenges >= 3 && stats.activeRewards >= 5 && stats.platformHealth >= 60 && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  All systems running smoothly
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Platform Activity</CardTitle>
          <CardDescription>Latest user actions and system events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  {activity.user_email && (
                    <p className="text-xs text-muted-foreground">{activity.user_email}</p>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              View All Activity
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
