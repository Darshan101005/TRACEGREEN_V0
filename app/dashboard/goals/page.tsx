"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Target, Plus, Calendar, TrendingDown, CheckCircle, Clock, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface CarbonGoal {
  id: string
  user_id: string
  goal_type: string
  target_amount: number
  current_amount: number
  start_date: string
  end_date: string
  status: string
  created_at: string
  updated_at: string
}

const goalTypes = [
  { value: "daily", label: "Daily", description: "Set a daily carbon footprint limit" },
  { value: "weekly", label: "Weekly", description: "Set a weekly carbon footprint target" },
  { value: "monthly", label: "Monthly", description: "Set a monthly carbon footprint goal" },
  { value: "yearly", label: "Yearly", description: "Set an annual carbon reduction target" },
]

const statusColors = {
  active: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  completed: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  failed: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
  paused: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
}

const statusIcons = {
  active: Clock,
  completed: CheckCircle,
  failed: AlertCircle,
  paused: Clock,
}

export default function GoalsPage() {
  const [user, setUser] = useState<any>(null)
  const [goals, setGoals] = useState<CarbonGoal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  // Form state
  const [goalType, setGoalType] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

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
      await loadGoals(user.id)
    }
    getUser()
  }, [router, supabase])

  const loadGoals = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("carbon_goals")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error("Error loading goals:", error)
      toast({
        title: "Error",
        description: "Failed to load goals",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createGoal = async () => {
    if (!user || !goalType || !targetAmount || !startDate || !endDate) return

    setIsCreating(true)
    try {
      const { error } = await supabase.from("carbon_goals").insert({
        user_id: user.id,
        goal_type: goalType,
        target_amount: Number.parseFloat(targetAmount),
        current_amount: 0,
        start_date: startDate,
        end_date: endDate,
        status: "active",
      })

      if (error) throw error

      toast({
        title: "Goal Created!",
        description: "Your carbon footprint goal has been set successfully.",
      })

      // Reset form
      setGoalType("")
      setTargetAmount("")
      setStartDate("")
      setEndDate("")
      setShowCreateDialog(false)

      // Reload goals
      await loadGoals(user.id)
    } catch (error) {
      console.error("Error creating goal:", error)
      toast({
        title: "Error",
        description: "Failed to create goal. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const calculateProgress = (goal: CarbonGoal) => {
    if (goal.target_amount === 0) return 0
    return Math.min((goal.current_amount / goal.target_amount) * 100, 100)
  }

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate)
    const now = new Date()
    const diffTime = end.getTime() - now.getTime()
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

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Carbon Goals</h1>
              <p className="text-muted-foreground mt-2">Set and track your carbon footprint reduction goals</p>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Goal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Goal</DialogTitle>
                  <DialogDescription>Set a new carbon footprint goal to track your progress</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Goal Type</Label>
                    <Select value={goalType} onValueChange={setGoalType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select goal type" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-sm text-muted-foreground">{type.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetAmount">Target Amount (kg CO₂)</Label>
                    <Input
                      id="targetAmount"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 50"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createGoal} disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Goal"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-6">
          {goals.length > 0 ? (
            goals.map((goal) => {
              const progress = calculateProgress(goal)
              const daysRemaining = getDaysRemaining(goal.end_date)
              const StatusIcon = statusIcons[goal.status as keyof typeof statusIcons]

              return (
                <Card key={goal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Target className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="capitalize">{goal.goal_type} Goal</CardTitle>
                          <CardDescription>
                            Target: {goal.target_amount} kg CO₂ by {new Date(goal.end_date).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={statusColors[goal.status as keyof typeof statusColors]}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {goal.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Progress</span>
                          <span>
                            {goal.current_amount} / {goal.target_amount} kg CO₂
                          </span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{Math.round(progress)}% complete</span>
                          <span>
                            {goal.target_amount - goal.current_amount > 0
                              ? `${(goal.target_amount - goal.current_amount).toFixed(1)} kg remaining`
                              : "Goal exceeded"}
                          </span>
                        </div>
                      </div>

                      {/* Goal Details */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Days Left</div>
                            <div className="text-muted-foreground">{daysRemaining} days</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <TrendingDown className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Daily Avg</div>
                            <div className="text-muted-foreground">
                              {goal.current_amount > 0
                                ? (goal.current_amount / Math.max(1, getDaysFromStart(goal.start_date))).toFixed(1)
                                : "0.0"}{" "}
                              kg
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Target Daily</div>
                            <div className="text-muted-foreground">
                              {daysRemaining > 0
                                ? ((goal.target_amount - goal.current_amount) / daysRemaining).toFixed(1)
                                : "0.0"}{" "}
                              kg
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Status</div>
                            <div className="text-muted-foreground capitalize">{goal.status}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No goals set yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first carbon footprint goal to start tracking your progress towards a more sustainable
                  lifestyle.
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

// Helper function to calculate days from start date
function getDaysFromStart(startDate: string): number {
  const start = new Date(startDate)
  const now = new Date()
  const diffTime = now.getTime() - start.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(1, diffDays)
}
