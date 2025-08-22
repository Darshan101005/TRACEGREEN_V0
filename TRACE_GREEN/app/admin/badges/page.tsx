"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface BadgeData {
  id: string
  name: string
  description: string
  icon: string
  category: string
  criteria: any
  points_reward: number
  rarity: string
  is_active: boolean
  created_at: string
}

export default function AdminBadges() {
  const [badges, setBadges] = useState<BadgeData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBadge, setEditingBadge] = useState<BadgeData | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    category: "",
    criteria: "",
    points_reward: 50,
    rarity: "common",
    is_active: true,
  })

  const supabase = createClient()

  useEffect(() => {
    loadBadges()
  }, [])

  const loadBadges = async () => {
    try {
      const { data, error } = await supabase.from("badges").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setBadges(data || [])
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      let criteria
      try {
        criteria = JSON.parse(formData.criteria)
      } catch {
        criteria = { description: formData.criteria }
      }

      const badgeData = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        category: formData.category,
        criteria,
        points_reward: formData.points_reward,
        rarity: formData.rarity,
        is_active: formData.is_active,
      }

      if (editingBadge) {
        const { error } = await supabase.from("badges").update(badgeData).eq("id", editingBadge.id)

        if (error) throw error
        toast({ title: "Success", description: "Badge updated successfully" })
      } else {
        const { error } = await supabase.from("badges").insert([badgeData])

        if (error) throw error
        toast({ title: "Success", description: "Badge created successfully" })
      }

      setIsDialogOpen(false)
      setEditingBadge(null)
      resetForm()
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

  const handleEdit = (badge: BadgeData) => {
    setEditingBadge(badge)
    setFormData({
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      category: badge.category,
      criteria: JSON.stringify(badge.criteria, null, 2),
      points_reward: badge.points_reward,
      rarity: badge.rarity,
      is_active: badge.is_active,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this badge?")) return

    try {
      const { error } = await supabase.from("badges").delete().eq("id", id)
      if (error) throw error

      toast({ title: "Success", description: "Badge deleted successfully" })
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

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      category: "",
      criteria: "",
      points_reward: 50,
      rarity: "common",
      is_active: true,
    })
  }

  const getRarityBadge = (rarity: string) => {
    const colors: Record<string, string> = {
      common: "bg-gray-100 text-gray-700",
      rare: "bg-blue-100 text-blue-700",
      epic: "bg-purple-100 text-purple-700",
      legendary: "bg-yellow-100 text-yellow-700",
    }
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[rarity] || colors.common}`}>{rarity}</span>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading badges...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Manage Badges
          </h1>
          <p className="text-muted-foreground mt-2">Create and manage achievement badges</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingBadge(null)
                resetForm()
              }}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Badge
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingBadge ? "Edit Badge" : "Create New Badge"}</DialogTitle>
              <DialogDescription>
                {editingBadge ? "Update the badge details" : "Create a new achievement badge"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (Emoji)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🏆"
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
                  rows={2}
                  required
                />
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., getting_started, consistency"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="points">Points Reward</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points_reward}
                    onChange={(e) => setFormData({ ...formData, points_reward: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rarity">Rarity</Label>
                  <Select
                    value={formData.rarity}
                    onValueChange={(value) => setFormData({ ...formData, rarity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Common</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Epic</SelectItem>
                      <SelectItem value="legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="criteria">Criteria (JSON)</Label>
                <Textarea
                  id="criteria"
                  value={formData.criteria}
                  onChange={(e) => setFormData({ ...formData, criteria: e.target.value })}
                  rows={3}
                  placeholder='{"activities_logged": 1} or {"consecutive_days": 7}'
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Define the criteria as JSON. Examples: {`{"activities_logged": 5}`}, {`{"streak_days": 30}`}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <Label htmlFor="active">Active (available for earning)</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
                >
                  {editingBadge ? "Update Badge" : "Create Badge"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle>All Badges</CardTitle>
          <CardDescription>Manage achievement badges and their criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Badge</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Rarity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {badges.map((badge) => (
                <TableRow key={badge.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{badge.icon}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{badge.name}</TableCell>
                  <TableCell>{badge.category}</TableCell>
                  <TableCell>{badge.points_reward}</TableCell>
                  <TableCell>{getRarityBadge(badge.rarity)}</TableCell>
                  <TableCell>
                    <Badge variant={badge.is_active ? "default" : "secondary"}>
                      {badge.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(badge)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(badge.id)}>
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
