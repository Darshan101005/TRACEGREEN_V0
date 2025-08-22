"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Star, Gift, ShoppingBag, Heart, Smartphone, Check, Clock, X } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Reward {
  id: string
  name: string
  description: string
  category: string
  points_cost: number
  monetary_value: number
  currency: string
  stock_quantity: number | null
  unlimited_stock: boolean
  image_url: string | null
  partner_name: string | null
  partner_logo_url: string | null
  terms_conditions: string | null
  expiry_days: number
  is_active: boolean
  featured: boolean
}

interface RewardRedemption {
  id: string
  reward_id: string
  points_spent: number
  redemption_code: string | null
  status: string
  redeemed_at: string
  expires_at: string | null
  used_at: string | null
  reward: Reward
}

interface UserStats {
  points: number
  level: number
}

const categoryIcons = {
  discount: ShoppingBag,
  product: Gift,
  experience: Star,
  donation: Heart,
  digital: Smartphone,
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  confirmed: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  used: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  expired: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
  cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
}

const statusIcons = {
  pending: Clock,
  confirmed: Check,
  used: Check,
  expired: X,
  cancelled: X,
}

export default function RewardsPage() {
  const [user, setUser] = useState<any>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([])
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null)
  const [isRedeeming, setIsRedeeming] = useState(false)
  const [activeTab, setActiveTab] = useState("marketplace")
  const [selectedCategory, setSelectedCategory] = useState("all")

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
      await loadData(user.id)
    }
    getUser()
  }, [router, supabase])

  const loadData = async (userId: string) => {
    try {
      // Load available rewards
      const { data: rewardsData, error: rewardsError } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("featured", { ascending: false })
        .order("points_cost", { ascending: true })

      if (rewardsError) throw rewardsError
      setRewards(rewardsData || [])

      // Load user redemptions
      const { data: redemptionsData, error: redemptionsError } = await supabase
        .from("reward_redemptions")
        .select(
          `
          *,
          rewards:reward_id (*)
        `,
        )
        .eq("user_id", userId)
        .order("redeemed_at", { ascending: false })

      if (redemptionsError) throw redemptionsError

      // Transform redemptions data
      const transformedRedemptions = redemptionsData?.map((item) => ({
        ...item,
        reward: Array.isArray(item.rewards) ? item.rewards[0] : item.rewards,
      }))

      setRedemptions(transformedRedemptions || [])

      // Load user stats
      const { data: statsData, error: statsError } = await supabase
        .from("user_points")
        .select("points, level")
        .eq("user_id", userId)
        .single()

      if (statsError && statsError.code !== "PGRST116") throw statsError

      setUserStats(
        statsData || {
          points: 0,
          level: 1,
        },
      )
    } catch (error) {
      console.error("Error loading data:", error)
      toast({
        title: "Error",
        description: "Failed to load rewards data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const redeemReward = async (reward: Reward) => {
    if (!user || !userStats || userStats.points < reward.points_cost) return

    setIsRedeeming(true)
    try {
      // Generate redemption code
      const redemptionCode = `TG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

      // Calculate expiry date
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + reward.expiry_days)

      // Create redemption record
      const { error: redemptionError } = await supabase.from("reward_redemptions").insert({
        user_id: user.id,
        reward_id: reward.id,
        points_spent: reward.points_cost,
        redemption_code: redemptionCode,
        status: "confirmed",
        expires_at: expiryDate.toISOString(),
      })

      if (redemptionError) throw redemptionError

      // Update user points
      const { error: pointsError } = await supabase
        .from("user_points")
        .update({
          points: userStats.points - reward.points_cost,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (pointsError) throw pointsError

      // Update stock if not unlimited
      if (!reward.unlimited_stock && reward.stock_quantity !== null) {
        const { error: stockError } = await supabase
          .from("rewards")
          .update({
            stock_quantity: reward.stock_quantity - 1,
            updated_at: new Date().toISOString(),
          })
          .eq("id", reward.id)

        if (stockError) throw stockError
      }

      toast({
        title: "Reward Redeemed!",
        description: `You've successfully redeemed ${reward.name}. Check your redemptions for details.`,
      })

      // Refresh data
      await loadData(user.id)
      setSelectedReward(null)
    } catch (error) {
      console.error("Error redeeming reward:", error)
      toast({
        title: "Redemption Failed",
        description: "There was an error redeeming your reward. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsRedeeming(false)
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

  const filteredRewards = rewards.filter((reward) => {
    if (selectedCategory === "all") return true
    return reward.category === selectedCategory
  })

  const categories = ["all", ...Array.from(new Set(rewards.map((r) => r.category)))]

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Rewards Marketplace</h1>
          <p className="text-muted-foreground mt-2">Redeem your points for eco-friendly rewards and experiences</p>
        </div>

        {/* Points Balance */}
        <Card className="mb-8">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{userStats.points} Points</h2>
                <p className="text-muted-foreground">Available to spend</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              Level {userStats.level}
            </Badge>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            <TabsTrigger value="redemptions">My Redemptions</TabsTrigger>
          </TabsList>

          {/* Marketplace Tab */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize"
                >
                  {category === "all" ? "All Categories" : category.replace("_", " ")}
                </Button>
              ))}
            </div>

            {/* Rewards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredRewards.map((reward) => {
                const IconComponent = categoryIcons[reward.category as keyof typeof categoryIcons] || Gift
                const canAfford = userStats.points >= reward.points_cost
                const inStock = reward.unlimited_stock || (reward.stock_quantity && reward.stock_quantity > 0)

                return (
                  <Card key={reward.id} className={`relative ${reward.featured ? "ring-2 ring-primary" : ""}`}>
                    {reward.featured && <Badge className="absolute -top-2 -right-2 bg-primary">Featured</Badge>}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{reward.name}</CardTitle>
                            {reward.partner_name && (
                              <p className="text-sm text-muted-foreground">by {reward.partner_name}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="mb-4">{reward.description}</CardDescription>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-primary">{reward.points_cost} pts</span>
                          {reward.monetary_value > 0 && (
                            <span className="text-sm text-muted-foreground">Worth ₹{reward.monetary_value}</span>
                          )}
                        </div>

                        {!inStock && (
                          <Badge variant="destructive" className="w-full justify-center">
                            Out of Stock
                          </Badge>
                        )}

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              className="w-full"
                              disabled={!canAfford || !inStock}
                              onClick={() => setSelectedReward(reward)}
                            >
                              {!canAfford ? "Insufficient Points" : !inStock ? "Out of Stock" : "Redeem"}
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Redeem {selectedReward?.name}</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to redeem this reward for {selectedReward?.points_cost} points?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="p-4 rounded-lg border">
                                <h4 className="font-medium mb-2">{selectedReward?.name}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{selectedReward?.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-lg font-bold text-primary">
                                    {selectedReward?.points_cost} points
                                  </span>
                                  <span className="text-sm text-muted-foreground">
                                    Expires in {selectedReward?.expiry_days} days
                                  </span>
                                </div>
                              </div>
                              {selectedReward?.terms_conditions && (
                                <div className="text-xs text-muted-foreground">
                                  <strong>Terms & Conditions:</strong> {selectedReward.terms_conditions}
                                </div>
                              )}
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedReward(null)}>
                                Cancel
                              </Button>
                              <Button
                                onClick={() => selectedReward && redeemReward(selectedReward)}
                                disabled={isRedeeming}
                              >
                                {isRedeeming ? "Redeeming..." : "Confirm Redemption"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredRewards.length === 0 && (
              <div className="text-center py-12">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No rewards available</h3>
                <p className="text-muted-foreground">Check back later for new rewards in this category.</p>
              </div>
            )}
          </TabsContent>

          {/* Redemptions Tab */}
          <TabsContent value="redemptions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Redemptions</CardTitle>
                <CardDescription>Track your redeemed rewards and their status</CardDescription>
              </CardHeader>
              <CardContent>
                {redemptions.length > 0 ? (
                  <div className="space-y-4">
                    {redemptions.map((redemption) => {
                      const StatusIcon = statusIcons[redemption.status as keyof typeof statusIcons]
                      return (
                        <div key={redemption.id} className="flex items-center gap-4 p-4 rounded-lg border">
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <StatusIcon className="w-5 h-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-medium">{redemption.reward.name}</h3>
                              <Badge
                                variant="secondary"
                                className={statusColors[redemption.status as keyof typeof statusColors]}
                              >
                                {redemption.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{redemption.reward.description}</p>
                            <div className="flex items-center justify-between text-sm">
                              <span>Points spent: {redemption.points_spent}</span>
                              <span>Redeemed: {new Date(redemption.redeemed_at).toLocaleDateString()}</span>
                            </div>
                            {redemption.redemption_code && (
                              <div className="mt-2 p-2 bg-muted rounded text-sm">
                                <strong>Code:</strong> {redemption.redemption_code}
                              </div>
                            )}
                            {redemption.expires_at && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Expires: {new Date(redemption.expires_at).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No redemptions yet</h3>
                    <p className="text-muted-foreground">Start redeeming rewards to see them here.</p>
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
