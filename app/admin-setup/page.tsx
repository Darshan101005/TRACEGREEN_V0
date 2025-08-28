"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Shield, User } from "lucide-react"

export default function AdminSetupPage() {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkUserStatus()
  }, [])

  const checkUserStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      setUser(user)

      // Check if user is already admin
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single()

      setIsAdmin(profile?.is_admin || user.email === "admin@tracegreen.com")
      setIsLoading(false)

    } catch (error) {
      console.error("Error checking user status:", error)
      setIsLoading(false)
    }
  }

  const makeUserAdmin = async () => {
    try {
      if (!user) return

      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: true })
        .eq("id", user.id)

      if (error) throw error

      toast({
        title: "Success!",
        description: "You are now an admin. You can access the admin panel at /admin",
      })

      setIsAdmin(true)

    } catch (error) {
      console.error("Error setting admin status:", error)
      toast({
        title: "Error",
        description: "Failed to set admin status",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-center">Admin Setup</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p>Please log in first to set up admin access.</p>
            <Button className="mt-4" onClick={() => window.location.href = "/auth/login"}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-blue-600" />
          <CardTitle>Admin Panel Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <User className="w-5 h-5" />
              <span className="font-medium">{user.email}</span>
            </div>
            {isAdmin ? (
              <div className="text-green-600 font-medium">✓ Admin Access Granted</div>
            ) : (
              <div className="text-gray-500">No admin access</div>
            )}
          </div>

          {isAdmin ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-green-800 font-medium mb-2">🎉 You have admin access!</p>
                <p className="text-sm text-green-600">Click the button below to access the admin panel</p>
              </div>
              <Button 
                className="w-full" 
                onClick={() => window.location.href = "/admin"}
              >
                <Shield className="w-4 h-4 mr-2" />
                Go to Admin Panel
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  Click the button below to grant yourself admin access. This will allow you to:
                </p>
                <ul className="text-xs text-blue-600 mt-2 space-y-1">
                  <li>• Manage all users</li>
                  <li>• Create and push challenges</li>
                  <li>• Manage rewards marketplace</li>
                  <li>• Moderate communities</li>
                  <li>• Create content and send notifications</li>
                </ul>
              </div>
              <Button 
                className="w-full" 
                onClick={makeUserAdmin}
              >
                <Shield className="w-4 h-4 mr-2" />
                Grant Admin Access
              </Button>
            </div>
          )}

          <div className="text-center">
            <Button 
              variant="outline" 
              onClick={() => window.location.href = "/dashboard"}
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
