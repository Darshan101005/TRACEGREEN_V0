"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookOpen,
  Target,
  BarChart3,
  Trophy,
  Users,
  Gift,
  Flame,
  Leaf,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play,
  Star,
  Calendar,
} from "lucide-react"

export default function LearnPage() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
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
      setIsLoading(false)
    }
    getUser()
  }, [router, supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">How to Use TraceGreen</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your complete guide to tracking your carbon footprint and building sustainable habits
          </p>
        </div>

        {/* Getting Started */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Play className="w-6 h-6 text-green-600" />
              Getting Started
            </CardTitle>
            <CardDescription>
              Welcome to TraceGreen! Here's everything you need to know to start your sustainability journey.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Step 1: Complete Your Profile
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set up your profile with your sustainability goals and preferences.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Step 2: Track Your First Activity
                </h3>
                <p className="text-sm text-muted-foreground">
                  Start logging your daily activities to understand your baseline.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Step 3: Set Your Goals
                </h3>
                <p className="text-sm text-muted-foreground">
                  Define monthly carbon reduction targets to stay motivated.
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Step 4: Build Your Streak
                </h3>
                <p className="text-sm text-muted-foreground">
                  Log activities daily to build your streak and unlock rewards.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Guide */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Dashboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">View Your Stats</p>
                    <p className="text-sm text-muted-foreground">See daily, weekly, and monthly carbon data</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Streak Counter</p>
                    <p className="text-sm text-muted-foreground">Build daily habits with the streak in nav bar</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard')}>
                Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>

          {/* Track Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-green-600" />
                Track Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Log Daily Activities</p>
                    <p className="text-sm text-muted-foreground">Record transportation, energy, food choices</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="font-medium">Carbon Calculation</p>
                    <p className="text-sm text-muted-foreground">Automatic CO₂ equivalent calculations</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/track')}>
                Start Tracking <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Streak System */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Flame className="w-6 h-6 text-orange-500" />
              Understanding Your Streak
            </CardTitle>
            <CardDescription>
              Build consistent habits with our streak system - visible in the navigation bar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 border rounded-lg">
                <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Daily Tracking</h3>
                <p className="text-sm text-muted-foreground">Log at least one activity per day to maintain your streak</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Calendar className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Weekly Goals</h3>
                <p className="text-sm text-muted-foreground">Aim for 7 days of activity each week</p>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-semibold mb-1">Milestones</h3>
                <p className="text-sm text-muted-foreground">Reach 7, 14, 30, and 100-day milestones</p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border border-orange-200">
              <p className="text-sm">
                <strong>💡 Pro Tip:</strong> Click on your streak counter in the navigation bar to see detailed progress!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-green-100 mb-6 max-w-2xl mx-auto">
              Begin tracking your carbon footprint today and build sustainable habits.
            </p>
            <Button 
              onClick={() => router.push('/dashboard/track')} 
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Track Your First Activity <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
