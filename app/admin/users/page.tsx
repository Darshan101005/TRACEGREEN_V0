"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { 
  Search, 
  Users, 
  Crown, 
  Calendar, 
  Activity,
  Ban,
  Trash2,
  Eye,
  Shield,
  UserCheck,
  UserX,
  Mail,
  MapPin,
  Award,
  Flame,
  MoreHorizontal
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  location?: string
  phone?: string
  total_points: number
  current_level: number
  current_streak: number
  longest_streak: number
  is_admin: boolean
  is_banned?: boolean
  ban_reason?: string
  created_at: string
  updated_at: string
  last_active?: string
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserProfile[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [banReason, setBanReason] = useState("")
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    adminUsers: 0
  })

  const supabase = createClient()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, users])

  const loadUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const totalUsers = profiles?.length || 0
      const activeUsers = profiles?.filter(user => 
        new Date(user.updated_at || user.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length || 0
      const bannedUsers = profiles?.filter(user => user.is_banned).length || 0
      const adminUsers = profiles?.filter(user => user.is_admin).length || 0

      setStats({ totalUsers, activeUsers, bannedUsers, adminUsers })
      setUsers(profiles || [])
      setFilteredUsers(profiles || [])

    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    if (!searchTerm) {
      setFilteredUsers(users)
      return
    }

    const filtered = users.filter((user: UserProfile) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredUsers(filtered)
  }

  const handleBanUser = async (userId: string, reason: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: true, ban_reason: reason })
        .eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User banned successfully",
      })

      loadUsers()
      setBanReason("")
      setSelectedUser(null)
    } catch (error) {
      console.error("Error banning user:", error)
      toast({
        title: "Error",
        description: "Failed to ban user",
        variant: "destructive",
      })
    }
  }

  const handleUnbanUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_banned: false, ban_reason: null })
        .eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User unbanned successfully",
      })

      loadUsers()
    } catch (error) {
      console.error("Error unbanning user:", error)
      toast({
        title: "Error",
        description: "Failed to unban user",
        variant: "destructive",
      })
    }
  }

  const handleToggleAdmin = async (userId: string, makeAdmin: boolean) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ is_admin: makeAdmin })
        .eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: makeAdmin ? "User promoted to admin" : "Admin privileges removed",
      })

      loadUsers()
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "User deleted successfully",
      })

      loadUsers()
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const getUserStatusBadge = (user: UserProfile) => {
    if (user.is_banned) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Ban className="w-3 h-3" />
        Banned
      </Badge>
    }
    if (user.is_admin) {
      return <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1">
        <Crown className="w-3 h-3" />
        Admin
      </Badge>
    }
    return <Badge variant="secondary" className="flex items-center gap-1">
      <UserCheck className="w-3 h-3" />
      Active
    </Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatLastActive = (user: UserProfile) => {
    const lastActive = new Date(user.last_active || user.updated_at || user.created_at)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return "Active now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return formatDate(lastActive.toISOString())
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-96 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage users, ban/unban accounts, and control admin privileges</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Active last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Users</CardTitle>
            <Crown className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.adminUsers}</div>
            <p className="text-xs text-muted-foreground">Platform administrators</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Banned Users</CardTitle>
            <Ban className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.bannedUsers}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Users Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search users by name, email, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              {filteredUsers.length} of {users.length} users
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Level & Points</TableHead>
                  <TableHead>Streak</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.full_name || 'No name set'}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                          {user.location && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {user.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getUserStatusBadge(user)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-600" />
                        <span>Level {user.current_level || 1}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(user.total_points || 0).toLocaleString()} points
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>{user.current_streak || 0} days</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Best: {user.longest_streak || 0}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatLastActive(user)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View User Details */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>User Details</DialogTitle>
                              <DialogDescription>
                                Comprehensive view of {user.email}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="grid gap-4">
                                <div className="flex items-center gap-4">
                                  <Avatar className="h-16 w-16">
                                    <AvatarImage src={selectedUser.avatar_url} />
                                    <AvatarFallback className="text-lg">
                                      {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <h3 className="text-lg font-semibold">{selectedUser.full_name || 'No name set'}</h3>
                                    <p className="text-muted-foreground">{selectedUser.email}</p>
                                    {getUserStatusBadge(selectedUser)}
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm font-medium">Location</label>
                                    <p className="text-sm text-muted-foreground">{selectedUser.location || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <p className="text-sm text-muted-foreground">{selectedUser.phone || 'Not provided'}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Level</label>
                                    <p className="text-sm text-muted-foreground">Level {selectedUser.current_level || 1}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Total Points</label>
                                    <p className="text-sm text-muted-foreground">{(selectedUser.total_points || 0).toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Current Streak</label>
                                    <p className="text-sm text-muted-foreground">{selectedUser.current_streak || 0} days</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Longest Streak</label>
                                    <p className="text-sm text-muted-foreground">{selectedUser.longest_streak || 0} days</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Joined</label>
                                    <p className="text-sm text-muted-foreground">{formatDate(selectedUser.created_at)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm font-medium">Last Active</label>
                                    <p className="text-sm text-muted-foreground">{formatLastActive(selectedUser)}</p>
                                  </div>
                                </div>
                                
                                {selectedUser.is_banned && selectedUser.ban_reason && (
                                  <div>
                                    <label className="text-sm font-medium">Ban Reason</label>
                                    <p className="text-sm text-red-600">{selectedUser.ban_reason}</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>

                        {/* Ban/Unban User */}
                        {!user.is_banned ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <Ban className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Ban User</DialogTitle>
                                <DialogDescription>
                                  This will prevent {user.email} from accessing the platform.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <label className="text-sm font-medium">Reason for ban *</label>
                                  <Input
                                    value={banReason}
                                    onChange={(e) => setBanReason(e.target.value)}
                                    placeholder="Enter detailed reason for banning this user..."
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setBanReason("")}>
                                  Cancel
                                </Button>
                                <Button
                                  variant="destructive"
                                  onClick={() => {
                                    if (banReason.trim()) {
                                      handleBanUser(user.id, banReason)
                                    } else {
                                      toast({
                                        title: "Error",
                                        description: "Please provide a reason for banning",
                                        variant: "destructive",
                                      })
                                    }
                                  }}
                                >
                                  Ban User
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600"
                            onClick={() => handleUnbanUser(user.id)}
                          >
                            <UserCheck className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Promote/Demote Admin */}
                        {!user.is_admin ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-purple-600"
                            onClick={() => handleToggleAdmin(user.id, true)}
                          >
                            <Crown className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-600"
                            onClick={() => handleToggleAdmin(user.id, false)}
                          >
                            <UserX className="w-4 h-4" />
                          </Button>
                        )}

                        {/* Delete User */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you absolutely sure you want to delete {user.email}? 
                                This action cannot be undone and will permanently remove all user data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteUser(user.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete User
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
