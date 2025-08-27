"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { CarbonOverviewChart } from "@/components/carbon-overview-chart"
import { QuickActions } from "@/components/quick-actions"
import { RecentActivities } from "@/components/recent-activities"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaf, Target, Trophy, Calendar, TrendingDown, CheckCircle } from "lucide-react"

interface UserStats {
  totalPoints: number
  level: number
  streak: number
  todaysCarbon: number
  weeklyCarbon: number
  monthlyCarbon: number
  monthlyGoal: number
  activitiesCount: number
  badgesCount: number
  achievementsCount: number
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const success = searchParams.get("success")
    if (success === "activity-logged") {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }
      
      setUser(user)
      await loadUserStats(user.id)
    }
    getUser()
  }, [router, supabase])

  const loadUserStats = async (userId: string) => {
    try {
      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      // Get today's carbon footprint
      const today = new Date().toISOString().split('T')[0]
      const { data: todayActivities } = await supabase
        .from("carbon_activities")
        .select("carbon_footprint")
        .eq("user_id", userId)
        .eq("date", today)

      const todaysCarbon = todayActivities?.reduce((sum, activity) => sum + parseFloat(activity.carbon_footprint), 0) || 0

      // Get this week's carbon footprint
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekStartStr = weekStart.toISOString().split('T')[0]
      
      const { data: weekActivities } = await supabase
        .from("carbon_activities")
        .select("carbon_footprint")
        .eq("user_id", userId)
        .gte("date", weekStartStr)

      const weeklyCarbon = weekActivities?.reduce((sum, activity) => sum + parseFloat(activity.carbon_footprint), 0) || 0

      // Get this month's carbon footprint
      const monthStart = new Date()
      monthStart.setDate(1)
      const monthStartStr = monthStart.toISOString().split('T')[0]
      
      const { data: monthActivities } = await supabase
        .from("carbon_activities")
        .select("carbon_footprint")
        .eq("user_id", userId)
        .gte("date", monthStartStr)

      const monthlyCarbon = monthActivities?.reduce((sum, activity) => sum + parseFloat(activity.carbon_footprint), 0) || 0

      // Get total activities count
      const { data: allActivities } = await supabase
        .from("carbon_activities")
        .select("id", { count: 'exact' })
        .eq("user_id", userId)

      // Get badges count
      const { data: badges } = await supabase
        .from("user_badges")
        .select("id", { count: 'exact' })
        .eq("user_id", userId)

      // Get achievements count
      const { data: achievements } = await supabase
        .from("achievements")
        .select("id", { count: 'exact' })
        .eq("user_id", userId)

      setUserStats({
        totalPoints: profile?.total_points || 0,
        level: profile?.current_level || 1,
        streak: profile?.current_streak || 0,
        todaysCarbon: Math.round(todaysCarbon * 100) / 100,
        weeklyCarbon: Math.round(weeklyCarbon * 100) / 100,
        monthlyCarbon: Math.round(monthlyCarbon * 100) / 100,
        monthlyGoal: profile?.carbon_goal_monthly || 2000,
        activitiesCount: allActivities?.length || 0,
        badgesCount: badges?.length || 0,
        achievementsCount: achievements?.length || 0,
      })
    } catch (error) {
      console.error("Error loading user stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Alert>
            <AlertDescription>
              Unable to load dashboard data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  const monthlyProgress = (userStats.monthlyCarbon / userStats.monthlyGoal) * 100
  const nextLevelPoints = userStats.level * 500 // Simple calculation

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-600 dark:text-green-400">
              Activity logged successfully! Your carbon footprint has been updated.
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Welcome back! Here's your sustainability overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Impact</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.todaysCarbon} kg</div>
              <p className="text-xs text-muted-foreground">CO₂ emissions today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Level</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Level {userStats.level}</div>
              <div className="mt-2">
                <Progress value={(userStats.totalPoints % 500) / 5} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {nextLevelPoints - userStats.totalPoints} points to next level
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.streak}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.streak === 1 ? "day" : "days"} in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(monthlyProgress)}%</div>
              <div className="mt-2">
                <Progress value={Math.min(monthlyProgress, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {userStats.monthlyCarbon} / {userStats.monthlyGoal} kg CO₂
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.activitiesCount}</p>
                  <p className="text-sm text-muted-foreground">Activities Tracked</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.badgesCount}</p>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userStats.achievementsCount}</p>
                  <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <CarbonOverviewChart userId={user.id} />
          </div>
          <div className="lg:col-span-4 space-y-6">
            <QuickActions />
            <RecentActivities userId={user.id} />
          </div>
        </div>
      </main>
    </div>
  )
}
