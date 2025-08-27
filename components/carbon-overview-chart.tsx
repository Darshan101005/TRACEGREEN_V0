"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface WeeklyData {
  day: string
  carbon: number
}

interface CategoryData {
  name: string
  value: number
  color: string
}

interface CarbonOverviewChartProps {
  userId: string
}

const chartConfig = {
  carbon: {
    label: "Carbon (kg CO2)",
    color: "hsl(var(--primary))",
  },
}

const categoryColors = {
  transportation: "#ef4444",
  energy: "#f97316", 
  food: "#eab308",
  waste: "#22c55e",
  shopping: "#8b5cf6",
}

export function CarbonOverviewChart({ userId }: CarbonOverviewChartProps) {
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([])
  const [categoryData, setCategoryData] = useState<CategoryData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (userId) {
      loadChartData()
    }
  }, [userId])

  const loadChartData = async () => {
    try {
      // Load last 7 days data
      const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      const weeklyDataArray: WeeklyData[] = []
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        const dayName = daysOfWeek[date.getDay()]
        
        const { data } = await supabase
          .from("carbon_activities")
          .select("carbon_footprint")
          .eq("user_id", userId)
          .eq("date", dateStr)
        
        const totalCarbon = data?.reduce((sum, activity) => sum + parseFloat(activity.carbon_footprint), 0) || 0
        weeklyDataArray.push({ day: dayName, carbon: Math.round(totalCarbon * 100) / 100 })
      }
      
      setWeeklyData(weeklyDataArray)

      // Load category breakdown for current month
      const monthStart = new Date()
      monthStart.setDate(1)
      const monthStartStr = monthStart.toISOString().split('T')[0]
      
      const { data: monthlyData } = await supabase
        .from("carbon_activities")
        .select("category, carbon_footprint")
        .eq("user_id", userId)
        .gte("date", monthStartStr)
      
      if (monthlyData && monthlyData.length > 0) {
        const categoryTotals: { [key: string]: number } = {}
        let totalCarbon = 0
        
        monthlyData.forEach((activity) => {
          const category = activity.category
          const carbon = parseFloat(activity.carbon_footprint)
          categoryTotals[category] = (categoryTotals[category] || 0) + carbon
          totalCarbon += carbon
        })
        
        const categoryDataArray: CategoryData[] = Object.entries(categoryTotals).map(([category, carbon]) => ({
          name: category.charAt(0).toUpperCase() + category.slice(1),
          value: Math.round((carbon / totalCarbon) * 100),
          color: categoryColors[category as keyof typeof categoryColors] || "#64748b"
        }))
        
        setCategoryData(categoryDataArray)
      } else {
        // Show empty state message
        setCategoryData([])
      }
    } catch (error) {
      console.error("Error loading chart data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Carbon Footprint</CardTitle>
            <CardDescription>Your daily carbon emissions this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Emissions by Category</CardTitle>
            <CardDescription>Breakdown of your carbon footprint</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading data...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Carbon Footprint</CardTitle>
          <CardDescription>Your daily carbon emissions this week</CardDescription>
        </CardHeader>
        <CardContent>
          {weeklyData.every(day => day.carbon === 0) ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  📊
                </div>
                <h3 className="text-lg font-medium mb-2">No data this week</h3>
                <p className="text-sm text-muted-foreground">Start tracking activities to see your carbon footprint</p>
              </div>
            </div>
          ) : (
            <ChartContainer config={chartConfig}>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={weeklyData}>
                  <XAxis dataKey="day" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="carbon"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emissions by Category</CardTitle>
          <CardDescription>Breakdown of your carbon footprint</CardDescription>
        </CardHeader>
        <CardContent>
          {categoryData.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  🥧
                </div>
                <h3 className="text-lg font-medium mb-2">No category data</h3>
                <p className="text-sm text-muted-foreground">Log activities to see category breakdown</p>
              </div>
            </div>
          ) : (
            <>
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry: CategoryData, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {categoryData.map((item: CategoryData) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">
                      {item.name} ({item.value}%)
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
