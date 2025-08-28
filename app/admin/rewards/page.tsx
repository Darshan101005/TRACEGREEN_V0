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
  Package, 
  Gift, 
  Edit,
  Trash2,
  Eye,
  Trophy,
  Users,
  CheckCircle,
  XCircle,
  Star,
  Calendar,
  ShoppingCart,
  Play,
  Pause
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Reward {
  id: string
  title: string
  description: string
  category: string
  points_cost: number
  stock_quantity?: number
  redeemed_count?: number
  image_url?: string
  partner_name?: string
  terms_conditions?: string
  expiry_date?: string
  is_active: boolean
  created_at: string
}

interface RewardFormData {
  title: string
  description: string
  category: string
  points_cost: number
  stock_quantity: number | null
  image_url: string
  partner_name: string
  terms_conditions: string
  expiry_date: string
  is_active: boolean
}

const defaultFormData: RewardFormData = {
  title: "",
  description: "",
  category: "discount",
  points_cost: 100,
  stock_quantity: 10,
  image_url: "",
  partner_name: "",
  terms_conditions: "",
  expiry_date: "",
  is_active: true
}

export default function AdminRewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [formData, setFormData] = useState<RewardFormData>(defaultFormData)
  const [stats, setStats] = useState({
    totalRewards: 0,
    activeRewards: 0,
    totalRedemptions: 0,
    totalValue: 0
  })

  const supabase = createClient()

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
    try {
      setIsLoading(true)
      const { data: rewardsData, error } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const rewards = rewardsData || []
      const totalRewards = rewards.length
      const activeRewards = rewards.filter(r => r.is_active).length
      const totalRedemptions = rewards.reduce((sum, r) => sum + (r.redeemed_count || 0), 0)
      const totalValue = rewards.reduce((sum, r) => sum + (r.points_cost * (r.redeemed_count || 0)), 0)

      setStats({ totalRewards, activeRewards, totalRedemptions, totalValue })
      setRewards(rewards)

    } catch (error) {
      console.error("Error loading rewards:", error)
      toast({
        title: "Error",
        description: "Failed to load rewards",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveReward = async () => {
    try {
      if (!formData.title || !formData.description) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      const submitData = {
        ...formData,
        stock_quantity: formData.stock_quantity || null,
        expiry_date: formData.expiry_date || null
      }

      if (editingReward) {
        const { error } = await supabase
          .from("rewards")
          .update(submitData)
          .eq("id", editingReward.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Reward updated and pushed to marketplace",
        })
      } else {
        const { error } = await supabase
          .from("rewards")
          .insert([submitData])

        if (error) throw error

        toast({
          title: "Success",
          description: "New reward added to marketplace",
        })
      }

      setIsDialogOpen(false)
      setEditingReward(null)
      setFormData(defaultFormData)
      loadRewards()
    } catch (error) {
      console.error("Error saving reward:", error)
      toast({
        title: "Error",
        description: "Failed to save reward",
        variant: "destructive",
      })
    }
  }

  const handleDeleteReward = async (rewardId: string) => {
    try {
      const { error } = await supabase
        .from("rewards")
        .delete()
        .eq("id", rewardId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Reward deleted from marketplace",
      })

      loadRewards()
    } catch (error) {
      console.error("Error deleting reward:", error)
      toast({
        title: "Error",
        description: "Failed to delete reward",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (rewardId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("rewards")
        .update({ is_active: !isActive })
        .eq("id", rewardId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Reward ${!isActive ? 'added to marketplace' : 'removed from marketplace'}`,
      })

      loadRewards()
    } catch (error) {
      console.error("Error updating reward:", error)
      toast({
        title: "Error",
        description: "Failed to update reward",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (reward: Reward) => {
    setEditingReward(reward)
    setFormData({
      title: reward.title,
      description: reward.description,
      category: reward.category,
      points_cost: reward.points_cost,
      stock_quantity: reward.stock_quantity || null,
      image_url: reward.image_url || "",
      partner_name: reward.partner_name || "",
      terms_conditions: reward.terms_conditions || "",
      expiry_date: reward.expiry_date ? reward.expiry_date.split('T')[0] : "",
      is_active: reward.is_active
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingReward(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
  }

  const getCategoryBadge = (category: string) => {
    const colors = {
      discount: "bg-blue-100 text-blue-700",
      voucher: "bg-green-100 text-green-700",
      product: "bg-purple-100 text-purple-700",
      experience: "bg-orange-100 text-orange-700",
      charity: "bg-red-100 text-red-700"
    }
    return (
      <Badge className={colors[category as keyof typeof colors] || colors.discount}>
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (reward: Reward) => {
    const now = new Date()
    const expiryDate = reward.expiry_date ? new Date(reward.expiry_date) : null

    if (!reward.is_active) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Hidden
      </Badge>
    }

    if (reward.stock_quantity === 0) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Out of Stock
      </Badge>
    }

    if (expiryDate && now > expiryDate) {
      return <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1">
        <Calendar className="w-3 h-3" />
        Expired
      </Badge>
    }

    return <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
      <CheckCircle className="w-3 h-3" />
      Live in Marketplace
    </Badge>
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
          <h1 className="text-2xl font-bold">Rewards Management</h1>
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
          <h1 className="text-2xl font-bold text-foreground">Rewards Management</h1>
          <p className="text-muted-foreground">Add new rewards to marketplace, manage existing offers, delete unwanted rewards</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Reward to Marketplace
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <Gift className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRewards}</div>
            <p className="text-xs text-muted-foreground">All created rewards</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rewards</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRewards}</div>
            <p className="text-xs text-muted-foreground">Live in marketplace</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Redemptions</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRedemptions}</div>
            <p className="text-xs text-muted-foreground">User redemptions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Points Value</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total points redeemed</p>
          </CardContent>
        </Card>
      </div>

      {/* Rewards Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Rewards</CardTitle>
          <CardDescription>Manage rewards in the marketplace - add new ones, edit existing, or remove outdated offers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reward</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Points Cost</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Redeemed</TableHead>
                  <TableHead>Partner</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.map((reward) => (
                  <TableRow key={reward.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {reward.image_url ? (
                          <img 
                            src={reward.image_url} 
                            alt={reward.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{reward.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {reward.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getCategoryBadge(reward.category)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(reward)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span>{reward.points_cost} pts</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {reward.stock_quantity !== null && reward.stock_quantity !== undefined 
                          ? reward.stock_quantity 
                          : '∞'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{reward.redeemed_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {reward.partner_name || 'Internal'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View Details */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{reward.title}</DialogTitle>
                              <DialogDescription>Reward details and settings</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="text-sm text-muted-foreground mt-1">{reward.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Category</label>
                                  <p className="text-sm text-muted-foreground">{reward.category}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Points Cost</label>
                                  <p className="text-sm text-muted-foreground">{reward.points_cost} points</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Partner</label>
                                  <p className="text-sm text-muted-foreground">{reward.partner_name || 'Internal'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Stock</label>
                                  <p className="text-sm text-muted-foreground">
                                    {reward.stock_quantity !== null && reward.stock_quantity !== undefined
                                      ? reward.stock_quantity 
                                      : 'Unlimited'}
                                  </p>
                                </div>
                              </div>
                              {reward.terms_conditions && (
                                <div>
                                  <label className="text-sm font-medium">Terms & Conditions</label>
                                  <p className="text-sm text-muted-foreground mt-1">{reward.terms_conditions}</p>
                                </div>
                              )}
                              {reward.expiry_date && (
                                <div>
                                  <label className="text-sm font-medium">Expiry Date</label>
                                  <p className="text-sm text-muted-foreground">{formatDate(reward.expiry_date)}</p>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Edit Reward */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(reward)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Toggle Active/Add to Marketplace */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(reward.id, reward.is_active)}
                          className={reward.is_active ? "text-orange-600" : "text-green-600"}
                        >
                          {reward.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>

                        {/* Delete Reward */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Reward</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{reward.title}"? This will permanently remove it from the marketplace and cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteReward(reward.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Reward
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

      {/* Create/Edit Reward Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? "Edit Reward" : "Add New Reward"}
            </DialogTitle>
            <DialogDescription>
              {editingReward ? "Update reward and push changes to marketplace" : "Create a new reward and add it to the marketplace"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Reward title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Points Cost *</label>
                <Input
                  type="number"
                  value={formData.points_cost}
                  onChange={(e) => setFormData({ ...formData, points_cost: parseInt(e.target.value) || 0 })}
                  placeholder="100"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the reward and what users will get..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="discount">Discount</SelectItem>
                    <SelectItem value="voucher">Voucher</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="experience">Experience</SelectItem>
                    <SelectItem value="charity">Charity Donation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Stock Quantity</label>
                <Input
                  type="number"
                  value={formData.stock_quantity || ""}
                  onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="10 (leave empty for unlimited)"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Partner Name</label>
                <Input
                  value={formData.partner_name}
                  onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                  placeholder="Partner company name"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Terms & Conditions</label>
              <Textarea
                value={formData.terms_conditions}
                onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                placeholder="Terms and conditions for this reward..."
                rows={2}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Expiry Date (Optional)</label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm font-medium">Add to Marketplace</label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveReward}>
              {editingReward ? "Update & Push to Marketplace" : "Add to Marketplace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
