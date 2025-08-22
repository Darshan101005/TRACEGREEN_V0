import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CarbonOverviewChart } from "@/components/carbon-overview-chart"
import { QuickActions } from "@/components/quick-actions"
import { RecentActivities } from "@/components/recent-activities"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingDown, TrendingUp, Target, Leaf } from "lucide-react"

export default async function DashboardPage() {
  let user = null
  let supabaseError = null

  try {
    console.log("[v0] Attempting to create Supabase client...")
    const supabase = await createClient()
    console.log("[v0] Supabase client created successfully")

    const { data, error } = await supabase.auth.getUser()
    console.log("[v0] Auth getUser result:", { hasData: !!data, hasUser: !!data?.user, error: error?.message })

    if (error) {
      console.error("[v0] Supabase auth error:", error)
      supabaseError = error
    } else if (!data?.user) {
      console.log("[v0] No user found, redirecting to login")
      redirect("/auth/login")
    } else {
      user = data.user
      console.log("[v0] User authenticated successfully:", user.email)
    }
  } catch (err) {
    console.error("[v0] Failed to initialize Supabase or get user:", err)
    supabaseError = err
  }

  if (supabaseError || !user) {
    console.log("[v0] Redirecting to login due to error or missing user")
    redirect("/auth/login")
  }

  // Mock data - in real app, this would come from the database
  const carbonStats = {
    today: 8.5,
    thisWeek: 71.0,
    thisMonth: 285.2,
    goal: 300.0,
    trend: -12.5, // percentage change from last period
  }

  const achievements = {
    level: 3,
    points: 1250,
    nextLevelPoints: 1500,
    streakDays: 7,
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <DashboardNav user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back, {user.user_metadata?.full_name || "there"}!
          </h1>
          <p className="text-muted-foreground mt-3 text-lg">Here's your sustainability overview for today</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8 animate-slide-up">
          <Card className="card-hover shadow-card border-0 bg-gradient-to-br from-card to-muted/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Footprint</CardTitle>
              <div className="p-2 rounded-full bg-primary/10">
                <Leaf className="h-4 w-4 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{carbonStats.today} kg</div>
              <p className="text-xs text-muted-foreground">CO₂ emissions</p>
            </CardContent>
          </Card>

          <Card className="card-hover shadow-card border-0 bg-gradient-to-br from-card to-muted/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <div className={`p-2 rounded-full ${carbonStats.trend < 0 ? "bg-green-100" : "bg-red-100"}`}>
                {carbonStats.trend < 0 ? (
                  <TrendingDown className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-red-600" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{carbonStats.thisWeek} kg</div>
              <p className="text-xs text-muted-foreground">
                <span className={`font-semibold ${carbonStats.trend < 0 ? "text-green-600" : "text-red-600"}`}>
                  {carbonStats.trend > 0 ? "+" : ""}
                  {carbonStats.trend}%
                </span>{" "}
                from last week
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover shadow-card border-0 bg-gradient-to-br from-card to-muted/20 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Goal</CardTitle>
              <div className="p-2 rounded-full bg-secondary/10">
                <Target className="h-4 w-4 text-secondary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {carbonStats.thisMonth}
                <span className="text-lg text-muted-foreground">/{carbonStats.goal} kg</span>
              </div>
              <Progress value={(carbonStats.thisMonth / carbonStats.goal) * 100} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="card-hover shadow-card border-0 bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur-sm pulse-glow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level & Points</CardTitle>
              <Badge variant="secondary" className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                Level {achievements.level}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {achievements.points} pts
              </div>
              <Progress value={(achievements.points / achievements.nextLevelPoints) * 100} className="mt-3 h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {achievements.nextLevelPoints - achievements.points} pts to next level
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="mb-8 animate-scale-in">
          <CarbonOverviewChart />
        </div>

        {/* Actions and Activities */}
        <div className="grid gap-6 lg:grid-cols-2 animate-fade-in">
          <QuickActions />
          <RecentActivities />
        </div>

        {/* Streak Card */}
        <Card className="mt-8 card-hover shadow-card border-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl">Current Streak 🔥</CardTitle>
            <CardDescription>Keep tracking daily to maintain your streak!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {achievements.streakDays}
              </div>
              <div>
                <p className="text-lg font-semibold">Days in a row</p>
                <p className="text-sm text-muted-foreground">Great job! You're building a sustainable habit.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
