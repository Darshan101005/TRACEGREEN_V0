"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Package, Calendar } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Reward {
  id: string
  title: string
  description: string
  category: string
  points_cost: number
  stock_quantity?: number
  image_url?: string
  partner_name?: string
  terms_conditions?: string
  expiry_date?: string
  is_active: boolean
  created_at: string
}

export default function AdminRewards() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Reward | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    points_cost: 100,
    stock_quantity: "",
    image_url: "",
    partner_name: "",
    terms_conditions: "",
    expiry_date: "",
    is_active: true,
  })

  const supabase = createClient()

  useEffect(() => {
    loadRewards()
  }, [])

  const loadRewards = async () => {
    try {
      const { data, error } = await supabase.from("rewards").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setRewards(data || [])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const rewardData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        points_cost: formData.points_cost,
        stock_quantity: formData.stock_quantity ? Number.parseInt(formData.stock_quantity) : null,
        image_url: formData.image_url || null,
        partner_name: formData.partner_name || null,
        terms_conditions: formData.terms_conditions || null,
        expiry_date: formData.expiry_date || null,
        is_active: formData.is_active,
      }

      if (editingReward) {
        const { error } = await supabase.from("rewards").update(rewardData).eq("id", editingReward.id)

        if (error) throw error
        toast({ title: "Success", description: "Reward updated successfully" })
      } else {
        const { error } = await supabase.from("rewards").insert([rewardData])

        if (error) throw error
        toast({ title: "Success", description: "Reward created successfully" })
      }

      setIsDialogOpen(false)
      setEditingReward(null)
      resetForm()
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

  const handleEdit = (reward: Reward) => {
    setEditingReward(reward)
    setFormData({
      title: reward.title,
      description: reward.description,
      category: reward.category,
      points_cost: reward.points_cost,
      stock_quantity: reward.stock_quantity?.toString() || "",
      image_url: reward.image_url || "",
      partner_name: reward.partner_name || "",
      terms_conditions: reward.terms_conditions || "",
      expiry_date: reward.expiry_date || "",
      is_active: reward.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return

    try {
      const { error } = await supabase.from("rewards").delete().eq("id", id)
      if (error) throw error

      toast({ title: "Success", description: "Reward deleted successfully" })
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

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category: "",
      points_cost: 100,
      stock_quantity: "",
      image_url: "",
      partner_name: "",
      terms_conditions: "",
      expiry_date: "",
      is_active: true,
    })
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading rewards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Manage Rewards
          </h1>
          <p className="text-muted-foreground mt-2">Create and manage marketplace rewards</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingReward(null)
                resetForm()
              }}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Reward
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingReward ? "Edit Reward" : "Create New Reward"}</DialogTitle>
              <DialogDescription>
                {editingReward ? "Update the reward details" : "Create a new reward for the marketplace"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., lifestyle, technology, food"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="points">Points Cost</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points_cost}
                    onChange={(e) => setFormData({ ...formData, points_cost: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partner">Partner Name</Label>
                  <Input
                    id="partner"
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input
                    id="expiry"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="terms">Terms & Conditions</Label>
                <Textarea
                  id="terms"
                  value={formData.terms_conditions}
                  onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                  rows={2}
                  placeholder="Optional terms and conditions"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="active">Active (visible in marketplace)</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {editingReward ? "Update Reward" : "Create Reward"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>All Rewards</CardTitle>
          <CardDescription>Manage marketplace rewards and their availability</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Points Cost</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell className="font-medium">{reward.title}</TableCell>
                  <TableCell>{reward.category}</TableCell>
                  <TableCell>{reward.points_cost}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      {reward.stock_quantity || "∞"}
                    </div>
                  </TableCell>
                  <TableCell>{reward.partner_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={reward.is_active ? "default" : "secondary"}>
                      {reward.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {reward.expiry_date ? (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(reward.expiry_date).toLocaleDateString()}
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(reward)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(reward.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
