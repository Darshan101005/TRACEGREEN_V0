"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Flame, Calendar, Trophy, Target } from "lucide-react"

interface CompactStreakProps {
  streakData: {
    currentStreak: number
    longestStreak: number
    todayCompleted: boolean
    weeklyProgress: number
    totalActiveDays: number
  }
}

export function CompactStreak({ streakData }: CompactStreakProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div 
          className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => setIsOpen(true)}
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-medium text-foreground">{streakData.currentStreak}</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Your Activity Streak
          </DialogTitle>
          <DialogDescription>
            Track your daily sustainability habits and build consistency
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Current Streak */}
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-1">
              {streakData.currentStreak}
            </div>
            <p className="text-sm text-muted-foreground">
              Day{streakData.currentStreak !== 1 ? 's' : ''} in a row
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                <div className="text-lg font-semibold">{streakData.longestStreak}</div>
                <p className="text-xs text-muted-foreground">Longest Streak</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Calendar className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <div className="text-lg font-semibold">{streakData.totalActiveDays}</div>
                <p className="text-xs text-muted-foreground">Total Days</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Weekly Progress</span>
              <span className="text-sm text-muted-foreground">{streakData.weeklyProgress}/7 days</span>
            </div>
            <Progress value={(streakData.weeklyProgress / 7) * 100} className="h-2" />
          </div>

          {/* Today's Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium">Today's Activity</span>
            <Badge 
              variant={streakData.todayCompleted ? "default" : "secondary"}
              className={streakData.todayCompleted ? "bg-green-100 text-green-700" : ""}
            >
              {streakData.todayCompleted ? "✓ Complete" : "Pending"}
            </Badge>
          </div>

          {/* Motivational Message */}
          <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border">
            <div className="text-sm text-gray-700">
              {streakData.currentStreak === 0 
                ? "🌱 Start your journey! Log your first activity today."
                : streakData.currentStreak < 7
                ? `🔥 Keep going! ${7 - streakData.currentStreak} more days to reach a week!`
                : streakData.currentStreak < 30
                ? `🎯 Amazing progress! ${30 - streakData.currentStreak} days until your first month!`
                : "✅ Great job! You're building an amazing habit!"
              }
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
