"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Star, Target, Users, BookOpen, Zap, Award, Lock } from "lucide-react"

interface UserBadge {
  id: string
  badge_id: string
  earned_at: string
  badge: {
    name: string
    description: string
    category: string
    rarity: string
    points_reward: number
  }
}

interface Achievement {
  id: string
  name: string
  description: string
  target_value: number
  achievement_type: string
  points_reward: number
  user_achievement?: {
    progress: number
    completed: boolean
    completed_at?: string
  }
}

interface UserStats {
  level: number
  points: number
  total_earned_points: number
  streak_days: number
  next_level_points: number
}

const rarityColors = {
  common: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  rare: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  epic: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
  legendary: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
}

const categoryIcons = {
  carbon_reduction: Zap,
  streak: Target,
  community: Users,
  education: BookOpen,
  milestone: Trophy,
}

export default function AchievementsPage() {
  const [user, setUser] = useState<any>(null)
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("badges")

  const router = useRouter()
  const supabase = createClient()

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
      await loadUserData(user.id)
    }
    getUser()
  }, [router, supabase])

  const loadUserData = async (userId: string) => {
    try {
      // Load user badges
      const { data: badgesData, error: badgesError } = await supabase
        .from("user_badges")
        .select(
          `
          id,
          badge_id,
          earned_at,
          badges:badge_id (
            name,
            description,
            category,
            rarity,
            points_reward
          )
        `,
        )
        .eq("user_id", userId)

      if (badgesError) throw badgesError

      // Transform the data structure
      const transformedBadges = badgesData?.map((item) => ({
        id: item.id,
        badge_id: item.badge_id,
        earned_at: item.earned_at,
        badge: Array.isArray(item.badges) ? item.badges[0] : item.badges,
      }))

      setUserBadges(transformedBadges || [])

      // Load achievements with user progress
      const { data: achievementsData, error: achievementsError } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (achievementsError) throw achievementsError

      // Transform achievements data - the achievements table already has progress info
      const transformedAchievements = achievementsData?.map((achievement) => ({
        id: achievement.id,
        name: achievement.title,
        description: achievement.description,
        target_value: achievement.points_earned, // Using points_earned as target for now
        achievement_type: achievement.category,
        points_reward: achievement.points_earned,
        user_achievement: {
          progress: achievement.points_earned,
          completed: true, // All entries in achievements table are completed
          completed_at: achievement.achievement_date,
        }
      }))

      setAchievements(transformedAchievements || [])

      // Load user stats from profiles table
      const { data: statsData, error: statsError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (statsError && statsError.code !== "PGRST116") throw statsError

      if (statsData) {
        setUserStats({
          level: statsData.current_level,
          points: statsData.total_points,
          total_earned_points: statsData.total_points,
          streak_days: statsData.current_streak,
          next_level_points: statsData.current_level * 500, // Simple level calculation
        })
      } else {
        // Default stats if no record exists
        setUserStats({
          level: 1,
          points: 0,
          total_earned_points: 0,
          streak_days: 0,
          next_level_points: 500,
        })
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !userStats) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  const completedAchievements = achievements.filter((a) => a.user_achievement?.completed)
  const inProgressAchievements = achievements.filter((a) => !a.user_achievement?.completed)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Achievements & Rewards</h1>
          <p className="text-muted-foreground mt-2">Track your progress and earn rewards for sustainable actions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Level</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.level}</div>
              <Progress value={(userStats.points / userStats.next_level_points) * 100} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {userStats.next_level_points - userStats.points} pts to next level
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Points</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.points}</div>
              <p className="text-xs text-muted-foreground">Available to spend</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userBadges.length}</div>
              <p className="text-xs text-muted-foreground">Total badges collected</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats.streak_days}</div>
              <p className="text-xs text-muted-foreground">Days in a row</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Badges Tab */}
          <TabsContent value="badges" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Badges</CardTitle>
                <CardDescription>Badges you've earned for your sustainable actions</CardDescription>
              </CardHeader>
              <CardContent>
                {userBadges.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {userBadges.map((userBadge) => {
                      const IconComponent =
                        categoryIcons[userBadge.badge.category as keyof typeof categoryIcons] || Trophy
                      return (
                        <div key={userBadge.id} className="flex items-center gap-4 p-4 rounded-lg border bg-card">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-sm">{userBadge.badge.name}</h3>
                              <Badge
                                variant="secondary"
                                className={`text-xs ${rarityColors[userBadge.badge.rarity as keyof typeof rarityColors]}`}
                              >
                                {userBadge.badge.rarity}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground mb-2">{userBadge.badge.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-primary font-medium">
                                +{userBadge.badge.points_reward} pts
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {new Date(userBadge.earned_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No badges yet</h3>
                    <p className="text-muted-foreground">
                      Start tracking your carbon footprint to earn your first badge!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            {/* Completed Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Completed Achievements</CardTitle>
                <CardDescription>Milestones you've reached in your sustainability journey</CardDescription>
              </CardHeader>
              <CardContent>
                {completedAchievements.length > 0 ? (
                  <div className="space-y-4">
                    {completedAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="flex items-center gap-4 p-4 rounded-lg border bg-green-50 dark:bg-green-900/20"
                      >
                        <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium">{achievement.name}</h3>
                            <Badge
                              variant="secondary"
                              className="bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
                            >
                              Completed
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-primary font-medium">+{achievement.points_reward} pts</span>
                            <span className="text-sm text-muted-foreground">
                              {achievement.user_achievement?.completed_at &&
                                new Date(achievement.user_achievement.completed_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No completed achievements yet</h3>
                    <p className="text-muted-foreground">Keep tracking your activities to complete achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* In Progress Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
                <CardDescription>Achievements you're working towards</CardDescription>
              </CardHeader>
              <CardContent>
                {inProgressAchievements.length > 0 ? (
                  <div className="space-y-4">
                    {inProgressAchievements.map((achievement) => {
                      const progress = achievement.user_achievement?.progress || 0
                      const progressPercentage = (progress / achievement.target_value) * 100
                      return (
                        <div key={achievement.id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium">{achievement.name}</h3>
                              <span className="text-sm text-primary font-medium">+{achievement.points_reward} pts</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>
                                  {progress} / {achievement.target_value}
                                </span>
                                <span>{Math.round(progressPercentage)}%</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">All achievements completed!</h3>
                    <p className="text-muted-foreground">Check back later for new achievements.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Goals</CardTitle>
                <CardDescription>Set and track your sustainability goals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Goals Coming Soon</h3>
                  <p className="text-muted-foreground">
                    Personal goal setting and tracking features will be available in the next update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
