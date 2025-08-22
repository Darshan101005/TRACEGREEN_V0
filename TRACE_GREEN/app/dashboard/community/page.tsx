"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Users, Trophy, Calendar, Clock, Target, Medal, Crown, Award, CheckCircle, Play, User } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Challenge {
  id: string
  title: string
  description: string
  challenge_type: string
  category: string
  target_metric: string
  target_value: number
  points_reward: number
  start_date: string
  end_date: string
  max_participants: number | null
  current_participants: number
  status: string
  created_by: string | null
  image_url: string | null
  rules: any
  user_participation?: {
    progress: number
    completed: boolean
    joined_at: string
  }
}

interface LeaderboardEntry {
  id: string
  user_id: string
  score: number
  rank: number
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

interface Leaderboard {
  id: string
  name: string
  description: string
  leaderboard_type: string
  metric: string
  time_period: string | null
  entries: LeaderboardEntry[]
}

const challengeTypeColors = {
  individual: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  community: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  team: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
}

const statusColors = {
  upcoming: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  active: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  completed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
}

const rankIcons = {
  1: Crown,
  2: Medal,
  3: Award,
}

export default function CommunityPage() {
  const [user, setUser] = useState<any>(null)
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null)
  const [isJoining, setIsJoining] = useState(false)
  const [activeTab, setActiveTab] = useState("challenges")

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
      await loadCommunityData(user.id)
    }
    getUser()
  }, [router, supabase])

  const loadCommunityData = async (userId: string) => {
    try {
      let challengesData = []
      let leaderboardsData = []

      try {
        // Load challenges with user participation
        const { data: challengesResult, error: challengesError } = await supabase
          .from("challenges")
          .select(
            `
            *,
            challenge_participants!left (
              progress,
              completed,
              joined_at
            )
          `,
          )
          .eq("challenge_participants.user_id", userId)
          .order("start_date", { ascending: false })

        if (challengesError) {
          console.log("Challenges table not found, using fallback data")
          // Fallback mock data for challenges
          challengesData = [
            {
              id: "mock-1",
              title: "30-Day Carbon Reduction Challenge",
              description: "Reduce your daily carbon footprint by 20% through sustainable transportation choices.",
              challenge_type: "individual",
              category: "transportation",
              target_metric: "kg CO2 saved",
              target_value: 50,
              points_reward: 500,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              max_participants: 100,
              current_participants: 23,
              status: "active",
              created_by: null,
              image_url: null,
              rules: { description: "Track your daily transportation choices and aim to reduce emissions." },
              challenge_participants: [],
            },
            {
              id: "mock-2",
              title: "Zero Waste Week",
              description: "Challenge yourself to produce zero waste for an entire week.",
              challenge_type: "community",
              category: "waste",
              target_metric: "days completed",
              target_value: 7,
              points_reward: 300,
              start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
              max_participants: null,
              current_participants: 45,
              status: "upcoming",
              created_by: null,
              image_url: null,
              rules: { description: "Avoid single-use items and track your waste reduction efforts." },
              challenge_participants: [],
            },
          ]
        } else {
          challengesData = challengesResult || []
        }
      } catch (error) {
        console.log("Error loading challenges, using fallback data:", error)
        challengesData = []
      }

      try {
        // Load leaderboards with entries
        const { data: leaderboardsResult, error: leaderboardsError } = await supabase
          .from("leaderboards")
          .select(
            `
            *,
            leaderboard_entries (
              id,
              user_id,
              score,
              rank,
              profiles:user_id (
                full_name,
                avatar_url
              )
            )
          `,
          )
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (leaderboardsError) {
          console.log("Leaderboards table not found, using fallback data")
          // Fallback mock data for leaderboards
          leaderboardsData = [
            {
              id: "mock-leaderboard-1",
              name: "Carbon Savers",
              description: "Top carbon footprint reducers this month",
              leaderboard_type: "monthly",
              metric: "kg CO2 saved",
              time_period: "monthly",
              leaderboard_entries: [
                {
                  id: "entry-1",
                  user_id: "user-1",
                  score: 125,
                  rank: 1,
                  profiles: { full_name: "Alex Green", avatar_url: null },
                },
                {
                  id: "entry-2",
                  user_id: "user-2",
                  score: 98,
                  rank: 2,
                  profiles: { full_name: "Sarah Eco", avatar_url: null },
                },
                {
                  id: "entry-3",
                  user_id: "user-3",
                  score: 87,
                  rank: 3,
                  profiles: { full_name: "Mike Sustain", avatar_url: null },
                },
              ],
            },
          ]
        } else {
          leaderboardsData = leaderboardsResult || []
        }
      } catch (error) {
        console.log("Error loading leaderboards, using fallback data:", error)
        leaderboardsData = []
      }

      // Transform challenges data
      const transformedChallenges = challengesData?.map((challenge) => ({
        ...challenge,
        user_participation: challenge.challenge_participants?.[0] || null,
      }))

      setChallenges(transformedChallenges || [])

      // Transform leaderboards data
      const transformedLeaderboards = leaderboardsData?.map((leaderboard) => ({
        ...leaderboard,
        entries: (leaderboard.leaderboard_entries || []).sort((a: any, b: any) => a.rank - b.rank).slice(0, 10), // Top 10
      }))

      setLeaderboards(transformedLeaderboards || [])
    } catch (error) {
      console.error("Error loading community data:", error)
      toast({
        title: "Using Demo Data",
        description: "Database not fully configured yet. Showing sample community data.",
        variant: "default",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const joinChallenge = async (challenge: Challenge) => {
    if (!user) return

    setIsJoining(true)
    try {
      if (challenge.id.startsWith("mock-")) {
        toast({
          title: "Demo Mode",
          description: "This is demo data. Set up your database to enable full functionality.",
          variant: "default",
        })
        setSelectedChallenge(null)
        return
      }

      const { error } = await supabase.from("challenge_participants").insert({
        challenge_id: challenge.id,
        user_id: user.id,
        progress: 0,
        completed: false,
      })

      if (error) throw error

      // Update challenge participant count
      const { error: updateError } = await supabase
        .from("challenges")
        .update({
          current_participants: challenge.current_participants + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", challenge.id)

      if (updateError) throw updateError

      toast({
        title: "Challenge Joined!",
        description: `You've successfully joined "${challenge.title}". Good luck!`,
      })

      // Reload data
      await loadCommunityData(user.id)
      setSelectedChallenge(null)
    } catch (error) {
      console.error("Error joining challenge:", error)
      toast({
        title: "Failed to Join",
        description: "There was an error joining the challenge. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getDaysUntilStart = (startDate: string) => {
    const start = new Date(startDate)
    const now = new Date()
    const diffTime = start.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  const activeChallenges = challenges.filter((c) => c.status === "active")
  const upcomingChallenges = challenges.filter((c) => c.status === "upcoming")
  const myChallenges = challenges.filter((c) => c.user_participation)

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Community</h1>
          <p className="text-muted-foreground mt-2">
            Join challenges, compete with others, and build a sustainable community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="leaderboards">Leaderboards</TabsTrigger>
            <TabsTrigger value="my-activity">My Activity</TabsTrigger>
          </TabsList>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            {/* Active Challenges */}
            <Card>
              <CardHeader>
                <CardTitle>Active Challenges</CardTitle>
                <CardDescription>Join ongoing challenges and compete with the community</CardDescription>
              </CardHeader>
              <CardContent>
                {activeChallenges.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {activeChallenges.map((challenge) => {
                      const daysRemaining = getDaysRemaining(challenge.end_date)
                      const isParticipating = !!challenge.user_participation
                      const progress = challenge.user_participation?.progress || 0
                      const progressPercentage = (progress / challenge.target_value) * 100

                      return (
                        <Card key={challenge.id} className="relative">
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className={
                                      challengeTypeColors[challenge.challenge_type as keyof typeof challengeTypeColors]
                                    }
                                  >
                                    {challenge.challenge_type}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {challenge.category}
                                  </Badge>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={statusColors[challenge.status as keyof typeof statusColors]}
                              >
                                {challenge.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-muted-foreground" />
                                  <span>Target: {challenge.target_value}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Trophy className="w-4 h-4 text-muted-foreground" />
                                  <span>{challenge.points_reward} pts</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span>
                                    {challenge.current_participants}
                                    {challenge.max_participants && ` / ${challenge.max_participants}`} participants
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4 text-muted-foreground" />
                                  <span>{daysRemaining} days left</span>
                                </div>
                              </div>

                              {isParticipating && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Your Progress</span>
                                    <span>
                                      {progress} / {challenge.target_value}
                                    </span>
                                  </div>
                                  <Progress value={progressPercentage} className="h-2" />
                                </div>
                              )}

                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    className="w-full"
                                    variant={isParticipating ? "outline" : "default"}
                                    onClick={() => setSelectedChallenge(challenge)}
                                  >
                                    {isParticipating ? (
                                      <>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Participating
                                      </>
                                    ) : (
                                      <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Join Challenge
                                      </>
                                    )}
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>{selectedChallenge?.title}</DialogTitle>
                                    <DialogDescription>{selectedChallenge?.description}</DialogDescription>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <strong>Type:</strong> {selectedChallenge?.challenge_type}
                                      </div>
                                      <div>
                                        <strong>Category:</strong> {selectedChallenge?.category}
                                      </div>
                                      <div>
                                        <strong>Target:</strong> {selectedChallenge?.target_value}{" "}
                                        {selectedChallenge?.target_metric}
                                      </div>
                                      <div>
                                        <strong>Reward:</strong> {selectedChallenge?.points_reward} points
                                      </div>
                                      <div>
                                        <strong>Duration:</strong>{" "}
                                        {selectedChallenge &&
                                          `${new Date(selectedChallenge.start_date).toLocaleDateString()} - ${new Date(selectedChallenge.end_date).toLocaleDateString()}`}
                                      </div>
                                      <div>
                                        <strong>Participants:</strong> {selectedChallenge?.current_participants}
                                        {selectedChallenge?.max_participants &&
                                          ` / ${selectedChallenge.max_participants}`}
                                      </div>
                                    </div>
                                    {selectedChallenge?.rules && (
                                      <div>
                                        <strong>Rules:</strong>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {JSON.stringify(selectedChallenge.rules)}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline" onClick={() => setSelectedChallenge(null)}>
                                      Close
                                    </Button>
                                    {selectedChallenge && !selectedChallenge.user_participation && (
                                      <Button onClick={() => joinChallenge(selectedChallenge)} disabled={isJoining}>
                                        {isJoining ? "Joining..." : "Join Challenge"}
                                      </Button>
                                    )}
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No active challenges</h3>
                    <p className="text-muted-foreground">Check back later for new challenges to join!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Challenges */}
            {upcomingChallenges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Challenges</CardTitle>
                  <CardDescription>Get ready for these upcoming sustainability challenges</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {upcomingChallenges.map((challenge) => {
                      const daysUntilStart = getDaysUntilStart(challenge.start_date)

                      return (
                        <Card key={challenge.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div>
                                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className={
                                      challengeTypeColors[challenge.challenge_type as keyof typeof challengeTypeColors]
                                    }
                                  >
                                    {challenge.challenge_type}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {challenge.category}
                                  </Badge>
                                </div>
                              </div>
                              <Badge
                                variant="secondary"
                                className={statusColors[challenge.status as keyof typeof statusColors]}
                              >
                                {challenge.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">{challenge.description}</p>

                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-muted-foreground" />
                                  <span>Starts in {daysUntilStart} days</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Trophy className="w-4 h-4 text-muted-foreground" />
                                  <span>{challenge.points_reward} pts</span>
                                </div>
                              </div>

                              <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4 text-muted-foreground" />
                                  <span>Target: {challenge.target_value}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4 text-muted-foreground" />
                                  <span>
                                    {challenge.current_participants}
                                    {challenge.max_participants && ` / ${challenge.max_participants}`} signed up
                                  </span>
                                </div>
                              </div>

                              <Button className="w-full bg-transparent" variant="outline" disabled>
                                <Calendar className="w-4 h-4 mr-2" />
                                Starts {new Date(challenge.start_date).toLocaleDateString()}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Leaderboards Tab */}
          <TabsContent value="leaderboards" className="space-y-6">
            {leaderboards.length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {leaderboards.map((leaderboard) => (
                  <Card key={leaderboard.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-primary" />
                        {leaderboard.name}
                      </CardTitle>
                      <CardDescription>{leaderboard.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {leaderboard.entries.length > 0 ? (
                        <div className="space-y-3">
                          {leaderboard.entries.map((entry, index) => {
                            const RankIcon = rankIcons[entry.rank as keyof typeof rankIcons] || User
                            const isTopThree = entry.rank <= 3

                            return (
                              <div
                                key={entry.id}
                                className={`flex items-center gap-3 p-3 rounded-lg ${
                                  isTopThree ? "bg-primary/5 border border-primary/20" : "bg-muted/50"
                                }`}
                              >
                                <div className="flex items-center justify-center w-8 h-8">
                                  {isTopThree ? (
                                    <RankIcon
                                      className={`w-5 h-5 ${
                                        entry.rank === 1
                                          ? "text-yellow-500"
                                          : entry.rank === 2
                                            ? "text-gray-400"
                                            : "text-amber-600"
                                      }`}
                                    />
                                  ) : (
                                    <span className="text-sm font-medium text-muted-foreground">#{entry.rank}</span>
                                  )}
                                </div>
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={entry.profiles.avatar_url || "/placeholder.svg"} />
                                  <AvatarFallback>
                                    {entry.profiles.full_name?.charAt(0).toUpperCase() || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {entry.profiles.full_name || "Anonymous User"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold">{entry.score}</p>
                                  <p className="text-xs text-muted-foreground">{leaderboard.metric}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <Trophy className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No entries yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No leaderboards available</h3>
                  <p className="text-muted-foreground">Leaderboards will appear as community activity increases.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* My Activity Tab */}
          <TabsContent value="my-activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Challenges</CardTitle>
                <CardDescription>Track your progress in joined challenges</CardDescription>
              </CardHeader>
              <CardContent>
                {myChallenges.length > 0 ? (
                  <div className="space-y-4">
                    {myChallenges.map((challenge) => {
                      const progress = challenge.user_participation?.progress || 0
                      const progressPercentage = (progress / challenge.target_value) * 100
                      const isCompleted = challenge.user_participation?.completed || false

                      return (
                        <div key={challenge.id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            {isCompleted ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <Target className="w-5 h-5 text-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium">{challenge.title}</h3>
                              <Badge variant="secondary" className={isCompleted ? "bg-green-100 text-green-600" : ""}>
                                {isCompleted ? "Completed" : "In Progress"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{challenge.description}</p>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>
                                  Progress: {progress} / {challenge.target_value}
                                </span>
                                <span>{Math.round(progressPercentage)}%</span>
                              </div>
                              <Progress value={progressPercentage} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                              <span>
                                Joined: {new Date(challenge.user_participation?.joined_at || "").toLocaleDateString()}
                              </span>
                              <span>Reward: {challenge.points_reward} pts</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No challenges joined yet</h3>
                    <p className="text-muted-foreground">Join your first challenge to start tracking your progress!</p>
                    <Button className="mt-4" onClick={() => setActiveTab("challenges")}>
                      Browse Challenges
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
