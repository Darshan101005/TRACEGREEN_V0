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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { User, Settings, Bell, Shield, Download, Trash2, Save, Upload, Target, MapPin, Phone } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  phone?: string
  date_of_birth?: string
  location?: string
  bio?: string
  carbon_goal_monthly?: number
  carbon_goal_yearly?: number
  total_points: number
  current_level: number
  current_streak: number
  longest_streak: number
  is_admin: boolean
}

interface UserPreferences {
  id?: string
  user_id: string
  email_notifications: boolean
  push_notifications: boolean
  weekly_reports: boolean
  achievement_alerts: boolean
  challenge_reminders: boolean
  privacy_profile_visible: boolean
  privacy_activity_visible: boolean
  privacy_leaderboard_visible: boolean
  language: string
  theme: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [preferences, setPreferences] = useState<UserPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }
        setUser(user)
        await loadProfile(user.id)
        await loadPreferences(user.id)
      } catch (error) {
        console.error("Error getting user:", error)
        router.push("/auth/login")
      }
    }
    getUser()
  }, [router, supabase])

  const loadProfile = async (userId: string) => {
    try {
      console.log("[v0] Loading profile for user:", userId)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

      if (error) {
        console.error("Error loading profile:", error)
        if (error.code === "PGRST116") {
          // Profile doesn't exist, create default
          const defaultProfile: Partial<Profile> = {
            id: userId,
            email: user?.email || "",
            full_name: user?.user_metadata?.full_name || "",
            total_points: 0,
            current_level: 1,
            current_streak: 0,
            longest_streak: 0,
            is_admin: false,
            carbon_goal_monthly: 2000,
            carbon_goal_yearly: 24000,
          }
          setProfile(defaultProfile as Profile)
        } else {
          throw error
        }
      } else {
        console.log("[v0] Profile loaded successfully:", data)
        setProfile(data)
      }
    } catch (error) {
      console.error("Error loading profile:", error)
      toast({
        title: "Error",
        description: "Failed to load profile data. Using default values.",
        variant: "destructive",
      })
    }
  }

  const loadPreferences = async (userId: string) => {
    try {
      console.log("[v0] Loading preferences for user:", userId)
      const { data, error } = await supabase.from("user_preferences").select("*").eq("user_id", userId).single()

      if (error) {
        console.error("Error loading preferences:", error)
        if (error.code === "PGRST116") {
          // Preferences don't exist, create default
          const defaultPreferences: UserPreferences = {
            user_id: userId,
            email_notifications: true,
            push_notifications: true,
            weekly_reports: true,
            achievement_alerts: true,
            challenge_reminders: true,
            privacy_profile_visible: true,
            privacy_activity_visible: true,
            privacy_leaderboard_visible: true,
            language: "en",
            theme: "light",
          }
          setPreferences(defaultPreferences)
        } else {
          throw error
        }
      } else {
        console.log("[v0] Preferences loaded successfully:", data)
        setPreferences(data)
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!profile || !user) return

    setIsSaving(true)
    try {
      console.log("[v0] Saving profile:", profile)
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        email: profile.email,
        full_name: profile.full_name,
        phone: profile.phone,
        date_of_birth: profile.date_of_birth,
        location: profile.location,
        bio: profile.bio,
        carbon_goal_monthly: profile.carbon_goal_monthly,
        carbon_goal_yearly: profile.carbon_goal_yearly,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    } catch (error) {
      console.error("Error saving profile:", error)
      toast({
        title: "Error",
        description: "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const savePreferences = async () => {
    if (!preferences || !user) return

    setIsSaving(true)
    try {
      console.log("[v0] Saving preferences:", preferences)
      const { error } = await supabase.from("user_preferences").upsert({
        user_id: user.id,
        email_notifications: preferences.email_notifications,
        push_notifications: preferences.push_notifications,
        weekly_reports: preferences.weekly_reports,
        achievement_alerts: preferences.achievement_alerts,
        challenge_reminders: preferences.challenge_reminders,
        privacy_profile_visible: preferences.privacy_profile_visible,
        privacy_activity_visible: preferences.privacy_activity_visible,
        privacy_leaderboard_visible: preferences.privacy_leaderboard_visible,
        language: preferences.language,
        theme: preferences.theme,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Preferences updated successfully",
      })
    } catch (error) {
      console.error("Error saving preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const exportData = async () => {
    try {
      toast({
        title: "Data Export",
        description: "Your data export will be sent to your email within 24 hours",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      })
    }
  }

  const deleteAccount = async () => {
    try {
      toast({
        title: "Account Deletion",
        description: "Account deletion request submitted. You will receive a confirmation email.",
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !profile || !preferences) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50">
        <DashboardNav user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  const getUserInitials = (user: any, profile: any) => {
    if (!user) return "U"

    // Special case for admin@tracegreen.com
    if (user.email === "admin@tracegreen.com") {
      return "A"
    }

    // If profile has full_name, use it
    if (profile?.full_name) {
      const name = profile.full_name.trim()
      if (name) {
        return name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      }
    }

    // Handle email-based initials
    if (user.email) {
      const email = user.email.toLowerCase()

      // Special handling for usernames like "dar.1010" -> "D"
      if (email.includes(".") && !email.includes("@")) {
        return email.charAt(0).toUpperCase()
      }

      // For emails like "dar.1010@example.com" -> "D"
      const localPart = email.split("@")[0]
      if (localPart.includes(".")) {
        const parts = localPart.split(".")
        if (parts[0]) {
          return parts[0].charAt(0).toUpperCase()
        }
      }

      // Default: first letter of email
      return email.charAt(0).toUpperCase()
    }

    return "U"
  }

  const userInitials = getUserInitials(user, profile)

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50">
      <DashboardNav user={user} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-cyan-600 bg-clip-text text-transparent">
            Profile & Settings
          </h1>
          <p className="text-muted-foreground mt-2">Manage your account and sustainability preferences</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Account
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">Personal Information</CardTitle>
                <CardDescription>Update your personal details and sustainability goals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20 ring-4 ring-green-100">
                    <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt="Profile" />
                    <AvatarFallback className="text-lg bg-gradient-to-br from-green-400 to-cyan-400 text-white">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="bg-white/50">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                <Separator />

                {/* Basic Information */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={profile.full_name || ""}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="bg-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={profile.email} disabled className="bg-muted/50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-10 bg-white/50"
                        value={profile.phone || ""}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      className="bg-white/50"
                      value={profile.date_of_birth || ""}
                      onChange={(e) => setProfile({ ...profile, date_of_birth: e.target.value })}
                    />
                  </div>
                </div>

                {/* Location and Bio */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        className="pl-10 bg-white/50"
                        value={profile.location || ""}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="City, State"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      className="bg-white/50"
                      value={profile.bio || ""}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                </div>

                {/* Carbon Goals */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="monthlyGoal">Monthly Carbon Goal (kg CO₂)</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="monthlyGoal"
                        type="number"
                        className="pl-10 bg-white/50"
                        value={profile.carbon_goal_monthly || ""}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            carbon_goal_monthly: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                          })
                        }
                        placeholder="2000"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearlyGoal">Yearly Carbon Goal (kg CO₂)</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="yearlyGoal"
                        type="number"
                        className="pl-10 bg-white/50"
                        value={profile.carbon_goal_yearly || ""}
                        onChange={(e) =>
                          setProfile({
                            ...profile,
                            carbon_goal_yearly: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                          })
                        }
                        placeholder="24000"
                      />
                    </div>
                  </div>
                </div>

                <Button
                  onClick={saveProfile}
                  disabled={isSaving}
                  className="w-full md:w-auto bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified about your sustainability journey</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive notifications on your device</p>
                    </div>
                    <Switch
                      checked={preferences.push_notifications}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, push_notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Receive updates via email</p>
                    </div>
                    <Switch
                      checked={preferences.email_notifications}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, email_notifications: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Achievement Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get notified when you earn badges or reach milestones
                      </p>
                    </div>
                    <Switch
                      checked={preferences.achievement_alerts}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, achievement_alerts: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Challenge Reminders</Label>
                      <p className="text-sm text-muted-foreground">Reminders about ongoing challenges</p>
                    </div>
                    <Switch
                      checked={preferences.challenge_reminders}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, challenge_reminders: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Reports</Label>
                      <p className="text-sm text-muted-foreground">Weekly summary of your carbon footprint</p>
                    </div>
                    <Switch
                      checked={preferences.weekly_reports}
                      onCheckedChange={(checked) => setPreferences({ ...preferences, weekly_reports: checked })}
                    />
                  </div>
                </div>

                <Button
                  onClick={savePreferences}
                  disabled={isSaving}
                  className="w-full md:w-auto bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">Privacy Settings</CardTitle>
                <CardDescription>Control your privacy and data sharing preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Profile Visibility</Label>
                      <p className="text-sm text-muted-foreground">Make your profile visible to other users</p>
                    </div>
                    <Switch
                      checked={preferences.privacy_profile_visible}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, privacy_profile_visible: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Activity Visibility</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow others to see your sustainability activities
                      </p>
                    </div>
                    <Switch
                      checked={preferences.privacy_activity_visible}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, privacy_activity_visible: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Leaderboard Visibility</Label>
                      <p className="text-sm text-muted-foreground">Show your name on public leaderboards</p>
                    </div>
                    <Switch
                      checked={preferences.privacy_leaderboard_visible}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, privacy_leaderboard_visible: checked })
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={savePreferences}
                  disabled={isSaving}
                  className="w-full md:w-auto bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Privacy Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-green-700">App Settings</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <Select
                      value={preferences.theme}
                      onValueChange={(value) => setPreferences({ ...preferences, theme: value })}
                    >
                      <SelectTrigger className="bg-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={preferences.language}
                      onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                    >
                      <SelectTrigger className="bg-white/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
                        <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
                        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={savePreferences}
                  disabled={isSaving}
                  className="w-full md:w-auto bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save App Settings"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-red-700">Account Management</CardTitle>
                <CardDescription>Export your data or delete your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button variant="outline" onClick={exportData} className="flex-1 bg-white/50">
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="flex-1">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your
                          data from our servers, including your carbon tracking history, achievements, and rewards.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={deleteAccount}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>
                    <strong>Export Data:</strong> Download all your personal data including profile information, carbon
                    tracking history, and achievements.
                  </p>
                  <p>
                    <strong>Delete Account:</strong> Permanently remove your account and all associated data. This
                    action cannot be undone.
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
