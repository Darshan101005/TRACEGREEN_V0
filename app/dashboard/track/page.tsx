"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Car, Zap, UtensilsCrossed, Trash2, Calculator, Save } from "lucide-react"
import { useRouter } from "next/navigation"

const categories = {
  transportation: {
    name: "Transportation",
    icon: Car,
    color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
    activities: [
      { name: "Car (Petrol)", unit: "km", factor: 0.21 },
      { name: "Car (Diesel)", unit: "km", factor: 0.26 },
      { name: "Motorcycle", unit: "km", factor: 0.11 },
      { name: "Bus", unit: "km", factor: 0.08 },
      { name: "Train", unit: "km", factor: 0.04 },
      { name: "Flight (Domestic)", unit: "km", factor: 0.25 },
      { name: "Flight (International)", unit: "km", factor: 0.3 },
      { name: "Auto Rickshaw", unit: "km", factor: 0.15 },
    ],
  },
  energy: {
    name: "Energy",
    icon: Zap,
    color: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
    activities: [
      { name: "Electricity", unit: "kWh", factor: 0.82 },
      { name: "Natural Gas", unit: "cubic meters", factor: 2.0 },
      { name: "LPG", unit: "kg", factor: 3.0 },
      { name: "Coal", unit: "kg", factor: 2.4 },
      { name: "Diesel Generator", unit: "liters", factor: 2.7 },
    ],
  },
  food: {
    name: "Food",
    icon: UtensilsCrossed,
    color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
    activities: [
      { name: "Beef", unit: "kg", factor: 27.0 },
      { name: "Chicken", unit: "kg", factor: 6.9 },
      { name: "Fish", unit: "kg", factor: 6.1 },
      { name: "Pork", unit: "kg", factor: 12.1 },
      { name: "Dairy Products", unit: "liters", factor: 3.2 },
      { name: "Rice", unit: "kg", factor: 2.7 },
      { name: "Vegetables", unit: "kg", factor: 2.0 },
      { name: "Fruits", unit: "kg", factor: 1.1 },
    ],
  },
  waste: {
    name: "Waste",
    icon: Trash2,
    color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
    activities: [
      { name: "General Waste", unit: "kg", factor: 0.5 },
      { name: "Plastic Waste", unit: "kg", factor: 6.0 },
      { name: "Paper Waste", unit: "kg", factor: 3.3 },
      { name: "Food Waste", unit: "kg", factor: 3.8 },
      { name: "Electronic Waste", unit: "kg", factor: 300.0 },
    ],
  },
}

export default function TrackActivityPage() {
  const [user, setUser] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState("transportation")
  const [selectedActivity, setSelectedActivity] = useState("")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [calculatedCarbon, setCalculatedCarbon] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const searchParams = useSearchParams()
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
    }
    getUser()

    // Set category from URL params
    const category = searchParams.get("category")
    if (category && categories[category as keyof typeof categories]) {
      setSelectedCategory(category)
    }
  }, [searchParams, router, supabase])

  const calculateCarbon = () => {
    if (!selectedActivity || !amount) {
      setCalculatedCarbon(0)
      return
    }

    const category = categories[selectedCategory as keyof typeof categories]
    const activity = category.activities.find((a) => a.name === selectedActivity)

    if (activity) {
      const carbon = Number.parseFloat(amount) * activity.factor
      setCalculatedCarbon(Math.round(carbon * 100) / 100)
    }
  }

  useEffect(() => {
    calculateCarbon()
  }, [selectedActivity, amount, selectedCategory])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedActivity || !amount || calculatedCarbon === 0) return

    setIsSubmitting(true)
    try {
      const category = categories[selectedCategory as keyof typeof categories]
      const activity = category.activities.find((a) => a.name === selectedActivity)

      const { error } = await supabase.from("carbon_activities").insert({
        user_id: user.id,
        category: selectedCategory,
        activity_type: selectedActivity,
        carbon_footprint: calculatedCarbon,
        date: new Date().toISOString().split("T")[0],
        description: notes || null,
        metadata: {
          amount: Number.parseFloat(amount),
          unit: activity?.unit || "",
        }
      })

      if (error) throw error

      // Reset form
      setSelectedActivity("")
      setAmount("")
      setNotes("")
      setCalculatedCarbon(0)

      // Redirect to dashboard with success message
      router.push("/dashboard?success=activity-logged")
    } catch (error) {
      console.error("Error logging activity:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return <div>Loading...</div>
  }

  const currentCategory = categories[selectedCategory as keyof typeof categories]
  const Icon = currentCategory.icon

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Track Your Activity</h1>
          <p className="text-muted-foreground mt-2">Log your daily activities to track your carbon footprint</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${currentCategory.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  Log {currentCategory.name} Activity
                </CardTitle>
                <CardDescription>
                  Select an activity and enter the amount to calculate your carbon footprint
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Category Selection */}
                  <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                    <TabsList className="grid w-full grid-cols-4">
                      {Object.entries(categories).map(([key, category]) => {
                        const TabIcon = category.icon
                        return (
                          <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                            <TabIcon className="w-4 h-4" />
                            <span className="hidden sm:inline">{category.name}</span>
                          </TabsTrigger>
                        )
                      })}
                    </TabsList>
                  </Tabs>

                  {/* Activity Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="activity">Activity Type</Label>
                    <Select value={selectedActivity} onValueChange={setSelectedActivity}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {currentCategory.activities.map((activity) => (
                          <SelectItem key={activity.name} value={activity.name}>
                            {activity.name} ({activity.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount{" "}
                      {selectedActivity &&
                        `(${currentCategory.activities.find((a) => a.name === selectedActivity)?.unit})`}
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="Enter amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional details..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" className="w-full" disabled={isSubmitting || calculatedCarbon === 0}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? "Logging Activity..." : "Log Activity"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Carbon Calculator */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Carbon Calculator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-primary">{calculatedCarbon}</div>
                    <div className="text-sm text-muted-foreground">kg CO₂ equivalent</div>
                  </div>

                  {calculatedCarbon > 0 && (
                    <div className="space-y-2">
                      <Badge variant="secondary" className="w-full justify-center">
                        {selectedActivity}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {amount} {currentCategory.activities.find((a) => a.name === selectedActivity)?.unit}
                      </div>
                    </div>
                  )}

                  {calculatedCarbon === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Select an activity and enter an amount to see the carbon footprint calculation
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">💡 Tip</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {selectedCategory === "transportation" &&
                    "Consider using public transport, cycling, or walking for shorter distances to reduce your carbon footprint."}
                  {selectedCategory === "energy" &&
                    "Switch to LED bulbs and unplug devices when not in use to save energy."}
                  {selectedCategory === "food" &&
                    "Try incorporating more plant-based meals into your diet to reduce food-related emissions."}
                  {selectedCategory === "waste" &&
                    "Reduce, reuse, and recycle to minimize waste generation and its environmental impact."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
