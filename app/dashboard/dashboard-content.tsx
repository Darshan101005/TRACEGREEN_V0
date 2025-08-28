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
  longestStreak: number
  todayCompleted: boolean
  weeklyActiveDays: number
  todaysCarbon: number
  weeklyCarbon: number
  monthlyCarbon: number
  monthlyGoal: number
  activitiesCount: number
  badgesCount: number
  achievementsCount: number
}

export default function DashboardContent() {
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
  }, [router, supabase.auth])

  const loadUserStats = async (userId: string) => {
    try {
      console.log("[v0] Loading user stats for:", userId)
      
      // Get today's date range
      const today = new Date()
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
      
      // Get today's activities
      const { data: todayActivities } = await supabase
        .from('carbon_activities')
        .select('carbon_footprint')
        .eq('user_id', userId)
        .gte('created_at', todayStart.toISOString())
        .lte('created_at', todayEnd.toISOString())
      
      const todaysCarbon = todayActivities?.reduce((sum: number, activity: any) => sum + parseFloat(activity.carbon_footprint), 0) || 0
      
      // Get weekly activities (last 7 days)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      
      const { data: weekActivities } = await supabase
        .from('carbon_activities')
        .select('carbon_footprint')
        .eq('user_id', userId)
        .gte('created_at', weekAgo.toISOString())
      
      const weeklyCarbon = weekActivities?.reduce((sum: number, activity: any) => sum + parseFloat(activity.carbon_footprint), 0) || 0
      
      // Get monthly activities
      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      
      const { data: monthActivities } = await supabase
        .from('carbon_activities')
        .select('carbon_footprint')
        .eq('user_id', userId)
        .gte('created_at', monthAgo.toISOString())
      
      const monthlyCarbon = monthActivities?.reduce((sum: number, activity: any) => sum + parseFloat(activity.carbon_footprint), 0) || 0
      
      // Get total activities count
      const { count: activitiesCount } = await supabase
        .from('carbon_activities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      // Get badges count
      const { count: badgesCount } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      // Get achievements count
      const { count: achievementsCount } = await supabase
        .from('user_achievements')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
      
      // Get user profile for additional stats
      const { data: profile } = await supabase
        .from('profiles')
        .select('total_points, current_level, current_streak, longest_streak, carbon_goal_monthly')
        .eq('id', userId)
        .single()
      
      setUserStats({
        totalPoints: profile?.total_points || 0,
        level: profile?.current_level || 1,
        streak: profile?.current_streak || 0,
        longestStreak: profile?.longest_streak || 0,
        todayCompleted: todaysCarbon > 0, // Check if user logged activity today
        weeklyActiveDays: Math.min(Math.floor(weeklyCarbon / 10), 7), // Estimate based on carbon data
        todaysCarbon,
        weeklyCarbon,
        monthlyCarbon,
        monthlyGoal: profile?.carbon_goal_monthly || 500,
        activitiesCount: activitiesCount || 0,
        badgesCount: badgesCount || 0,
        achievementsCount: achievementsCount || 0
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
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="space-y-6">
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-6 sm:h-8 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !userStats) {
    return null
  }

  const goalProgress = (userStats.monthlyCarbon / userStats.monthlyGoal) * 100

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav 
        user={user} 
        streakData={{
          currentStreak: userStats.streak,
          longestStreak: userStats.longestStreak,
          todayCompleted: userStats.todayCompleted,
          weeklyProgress: userStats.weeklyActiveDays,
          totalActiveDays: userStats.activitiesCount
        }}
      />
      
      <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
        {showSuccess && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              Activity logged successfully! Your carbon footprint has been updated.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Overview */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Carbon</CardTitle>
              <Leaf className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{userStats.todaysCarbon.toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">
                CO₂ equivalent today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{(userStats.weeklyCarbon / 7).toFixed(1)} kg</div>
              <p className="text-xs text-muted-foreground">
                Daily average this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Points</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{userStats.totalPoints.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">Level {userStats.level}</Badge>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{userStats.streak}</div>
              <p className="text-xs text-muted-foreground">
                {userStats.streak === 1 ? "day" : "days"} in a row
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Goal Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Carbon Goal</CardTitle>
            <CardDescription>
              Track your progress towards your monthly carbon reduction target
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className="text-right">{userStats.monthlyCarbon.toFixed(1)} kg / {userStats.monthlyGoal} kg</span>
              </div>
              <Progress 
                value={Math.min(goalProgress, 100)} 
                className="w-full"
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {goalProgress < 100 
                  ? `${(userStats.monthlyGoal - userStats.monthlyCarbon).toFixed(1)} kg remaining`
                  : "Goal exceeded"
                }
              </span>
              <span>{goalProgress.toFixed(0)}% of goal</span>
            </div>
          </CardContent>
        </Card>

        {/* Activity Summary */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Activities Logged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">{userStats.activitiesCount}</div>
              <p className="text-xs text-muted-foreground">Total activities tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">{userStats.badgesCount}</div>
              <p className="text-xs text-muted-foreground">Achievement badges</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">{userStats.achievementsCount}</div>
              <p className="text-xs text-muted-foreground">Goals completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Activities */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="order-1 lg:order-1">
            <CarbonOverviewChart userId={user.id} />
          </div>
          <div className="order-2 lg:order-2 space-y-6">
            <QuickActions />
            <RecentActivities userId={user.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
