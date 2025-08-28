"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  Plus, 
  Award, 
  Edit,
  Trash2,
  Eye,
  Trophy,
  Star,
  Medal,
  Target,
  Zap,
  Crown,
  Shield,
  Users,
  Calendar,
  CheckCircle
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface BadgeData {
  id: string
  name: string
  description: string
  icon?: string
  color?: string
  category?: string
  criteria_type?: string
  criteria_value?: number
  rarity?: string
  is_active: boolean
  created_at: string
  updated_at: string
  earned_count?: number
}

interface BadgeFormData {
  name: string
  description: string
  icon: string
  color: string
  category: string
  criteria_type: string
  criteria_value: number
  rarity: string
  is_active: boolean
}

const defaultFormData: BadgeFormData = {
  name: "",
  description: "",
  icon: "award",
  color: "#3B82F6",
  category: "achievement",
  criteria_type: "carbon_saved",
  criteria_value: 100,
  rarity: "common",
  is_active: true
}

const iconOptions = [
  { value: "award", icon: Award, label: "Award" },
  { value: "trophy", icon: Trophy, label: "Trophy" },
  { value: "star", icon: Star, label: "Star" },
  { value: "medal", icon: Medal, label: "Medal" },
  { value: "target", icon: Target, label: "Target" },
  { value: "zap", icon: Zap, label: "Lightning" },
  { value: "crown", icon: Crown, label: "Crown" },
  { value: "shield", icon: Shield, label: "Shield" }
]

export default function AdminBadges() {
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState<BadgeData | null>(null)
  const [formData, setFormData] = useState<BadgeFormData>(defaultFormData)
  const [badgeEarners, setBadgeEarners] = useState<any[]>([])
  const [selectedBadge, setSelectedBadge] = useState<BadgeData | null>(null)
  const [isEarnersDialogOpen, setIsEarnersDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    totalBadges: 0,
    activeBadges: 0,
    totalEarned: 0,
    rareBadges: 0
  })

  const supabase = createClient()

  useEffect(() => {
    loadBadges()
  }, [])

  const loadBadges = async () => {
    try {
      setIsLoading(true)
      const { data: badgesData, error } = await supabase
        .from("badges")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get earned counts for each badge
      const badgesWithCounts = await Promise.all(
        (badgesData || []).map(async (badge) => {
          const { count } = await supabase
            .from("user_badges")
            .select("id", { count: "exact" })
            .eq("badge_id", badge.id)

          return {
            ...badge,
            earned_count: count || 0
          }
        })
      )

      const badges = badgesWithCounts
      const totalBadges = badges.length
      const activeBadges = badges.filter(b => b.is_active).length
      const totalEarned = badges.reduce((sum, b) => sum + (b.earned_count || 0), 0)
      const rareBadges = badges.filter(b => b.rarity === 'rare' || b.rarity === 'legendary').length

      setStats({ totalBadges, activeBadges, totalEarned, rareBadges })
      setBadges(badges)

    } catch (error) {
      console.error("Error loading badges:", error)
      toast({
        title: "Error",
        description: "Failed to load badges",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveBadge = async () => {
    try {
      if (!formData.name || !formData.description) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      if (editingBadge) {
        const { error } = await supabase
          .from("badges")
          .update(formData)
          .eq("id", editingBadge.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Badge updated successfully",
        })
      } else {
        const { error } = await supabase
          .from("badges")
          .insert([formData])

        if (error) throw error

        toast({
          title: "Success",
          description: "New badge created and available to users",
        })
      }

      setIsDialogOpen(false)
      setEditingBadge(null)
      setFormData(defaultFormData)
      loadBadges()
    } catch (error) {
      console.error("Error saving badge:", error)
      toast({
        title: "Error",
        description: "Failed to save badge",
        variant: "destructive",
      })
    }
  }

  const handleDeleteBadge = async (badgeId: string) => {
    try {
      const { error } = await supabase
        .from("badges")
        .delete()
        .eq("id", badgeId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Badge deleted successfully",
      })

      loadBadges()
    } catch (error) {
      console.error("Error deleting badge:", error)
      toast({
        title: "Error",
        description: "Failed to delete badge",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (badgeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("badges")
        .update({ is_active: !isActive })
        .eq("id", badgeId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Badge ${!isActive ? 'activated' : 'deactivated'}`,
      })

      loadBadges()
    } catch (error) {
      console.error("Error updating badge:", error)
      toast({
        title: "Error",
        description: "Failed to update badge",
        variant: "destructive",
      })
    }
  }

  const loadBadgeEarners = async (badge: BadgeData) => {
    try {
      setSelectedBadge(badge)

      const { data: earnersData, error } = await supabase
        .from("user_badges")
        .select(`
          *,
          profiles!user_badges_user_id_fkey(display_name, email, avatar_url)
        `)
        .eq("badge_id", badge.id)
        .order("earned_at", { ascending: false })

      if (error) throw error

      setBadgeEarners(earnersData || [])
      setIsEarnersDialogOpen(true)

    } catch (error) {
      console.error("Error loading badge earners:", error)
      toast({
        title: "Error",
        description: "Failed to load badge earners",
        variant: "destructive",
      })
    }
  }

  const handleAwardBadge = async (badgeId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from("user_badges")
        .insert([{
          user_id: userId,
          badge_id: badgeId,
          earned_at: new Date().toISOString()
        }])

      if (error) throw error

      toast({
        title: "Success",
        description: "Badge awarded to user",
      })

      // Reload badge earners if dialog is open
      if (selectedBadge) {
        loadBadgeEarners(selectedBadge)
      }
      loadBadges()

    } catch (error) {
      console.error("Error awarding badge:", error)
      toast({
        title: "Error",
        description: "Failed to award badge",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (badge: BadgeData) => {
    setEditingBadge(badge)
    setFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon || 'award',
      color: badge.color || '#3B82F6',
      category: badge.category || 'achievement',
      criteria_type: badge.criteria_type || 'carbon_saved',
      criteria_value: badge.criteria_value || 100,
      rarity: badge.rarity || 'common',
      is_active: badge.is_active
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingBadge(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
  }

  const getRarityBadge = (rarity: string) => {
    if (!rarity) {
      return (
        <Badge className="bg-gray-100 text-gray-700">
          Unknown
        </Badge>
      )
    }
    
    const colors = {
      common: "bg-gray-100 text-gray-700",
      uncommon: "bg-green-100 text-green-700",
      rare: "bg-blue-100 text-blue-700",
      epic: "bg-purple-100 text-purple-700",
      legendary: "bg-yellow-100 text-yellow-700"
    }
    return (
      <Badge className={colors[rarity as keyof typeof colors] || colors.common}>
        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (badge: BadgeData) => {
    if (badge.is_active) {
      return <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Active
      </Badge>
    }
    return <Badge variant="secondary">
      Inactive
    </Badge>
  }

  const getIconComponent = (iconName: string) => {
    const iconData = iconOptions.find(opt => opt.value === iconName)
    if (iconData) {
      const IconComponent = iconData.icon
      return <IconComponent className="w-4 h-4" />
    }
    return <Award className="w-4 h-4" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Badge Management</h1>
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
          <h1 className="text-2xl font-bold text-foreground">Badge Management</h1>
          <p className="text-muted-foreground">Create achievements, manage rewards, and track user progress</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Badge
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
            <Award className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBadges}</div>
            <p className="text-xs text-muted-foreground">All created badges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBadges}</div>
            <p className="text-xs text-muted-foreground">Available to earn</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEarned}</div>
            <p className="text-xs text-muted-foreground">By all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rare Badges</CardTitle>
            <Crown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.rareBadges}</div>
            <p className="text-xs text-muted-foreground">Rare & legendary</p>
          </CardContent>
        </Card>
      </div>

      {/* Badges Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Badges</CardTitle>
          <CardDescription>Manage achievement badges and user rewards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Badge</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Criteria</TableHead>
                  <TableHead>Rarity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Earned</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {badges.map((badge) => (
                  <TableRow key={badge.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{ 
                            backgroundColor: (badge.color || '#3B82F6') + '20', 
                            color: badge.color || '#3B82F6'
                          }}
                        >
                          {getIconComponent(badge.icon || 'award')}
                        </div>
                        <div>
                          <div className="font-medium">{badge.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {badge.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {badge.category || 'General'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{badge.criteria_type ? badge.criteria_type.replace('_', ' ') : 'N/A'}</div>
                        <div className="text-muted-foreground">{badge.criteria_value || 0}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRarityBadge(badge.rarity)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(badge)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{badge.earned_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(badge.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View Earners */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadBadgeEarners(badge)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Edit Badge */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(badge)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Toggle Active */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(badge.id, badge.is_active)}
                          className={badge.is_active ? "text-orange-600" : "text-green-600"}
                        >
                          {badge.is_active ? "Deactivate" : "Activate"}
                        </Button>

                        {/* Delete Badge */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Badge</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{badge.name}"? Users who earned this badge will lose it. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteBadge(badge.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Badge
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

      {/* Create/Edit Badge Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingBadge ? "Edit Badge" : "Create New Badge"}
            </DialogTitle>
            <DialogDescription>
              {editingBadge ? "Update badge settings and criteria" : "Create a new achievement badge for users"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Badge Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Badge name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. achievement, milestone"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what users need to do to earn this badge..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Icon</label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => {
                      const IconComponent = option.icon
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Color</label>
                <Input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="mt-1 h-10"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Rarity</label>
                <Select value={formData.rarity} onValueChange={(value) => setFormData({ ...formData, rarity: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="uncommon">Uncommon</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Criteria Type</label>
                <Select value={formData.criteria_type} onValueChange={(value) => setFormData({ ...formData, criteria_type: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carbon_saved">Carbon Saved (kg)</SelectItem>
                    <SelectItem value="challenges_completed">Challenges Completed</SelectItem>
                    <SelectItem value="days_active">Days Active</SelectItem>
                    <SelectItem value="community_posts">Community Posts</SelectItem>
                    <SelectItem value="friends_invited">Friends Invited</SelectItem>
                    <SelectItem value="goals_achieved">Goals Achieved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Target Value</label>
                <Input
                  type="number"
                  value={formData.criteria_value}
                  onChange={(e) => setFormData({ ...formData, criteria_value: parseInt(e.target.value) || 0 })}
                  placeholder="Target amount"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <label htmlFor="is_active" className="text-sm font-medium">Badge is active and available to earn</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBadge}>
              {editingBadge ? "Update Badge" : "Create Badge"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Badge Earners Dialog */}
      <Dialog open={isEarnersDialogOpen} onOpenChange={setIsEarnersDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedBadge && (
                <>
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: (selectedBadge.color || '#3B82F6') + '20', 
                      color: selectedBadge.color || '#3B82F6'
                    }}
                  >
                    {getIconComponent(selectedBadge.icon || 'award')}
                  </div>
                  {selectedBadge.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              Users who have earned this badge ({badgeEarners.length} total)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {badgeEarners.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Earned Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {badgeEarners.map((earner) => (
                      <TableRow key={earner.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {earner.profiles?.display_name?.[0] || "U"}
                            </div>
                            <div>
                              <div className="font-medium">
                                {earner.profiles?.display_name || "Unknown User"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {earner.profiles?.email || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(earner.earned_at)}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users have earned this badge yet
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
