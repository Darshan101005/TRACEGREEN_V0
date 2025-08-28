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
  Calendar, 
  Trophy, 
  Edit,
  Trash2,
  Eye,
  Target,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Play,
  Pause
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Challenge {
  id: string
  title: string
  description: string
  challenge_type?: string
  difficulty?: string
  target_value?: number
  target_unit?: string
  points_reward: number
  start_date: string
  end_date: string
  is_active: boolean
  created_at: string
  participant_count?: number
  completion_count?: number
}

interface ChallengeFormData {
  title: string
  description: string
  challenge_type: string
  difficulty: string
  target_value: number
  target_unit: string
  points_reward: number
  start_date: string
  end_date: string
  is_active: boolean
}

const defaultFormData: ChallengeFormData = {
  title: "",
  description: "",
  challenge_type: "carbon_reduction",
  difficulty: "beginner",
  target_value: 50,
  target_unit: "kg CO2",
  points_reward: 100,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  is_active: true
}

export default function AdminChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null)
  const [formData, setFormData] = useState<ChallengeFormData>(defaultFormData)
  const [stats, setStats] = useState({
    totalChallenges: 0,
    activeChallenges: 0,
    completedChallenges: 0,
    totalParticipants: 0
  })

  const supabase = createClient()

  useEffect(() => {
    loadChallenges()
  }, [])

  const loadChallenges = async () => {
    try {
      setIsLoading(true)
      const { data: challengesData, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const challenges = challengesData || []
      const totalChallenges = challenges.length
      const activeChallenges = challenges.filter(c => c.is_active).length
      const completedChallenges = challenges.filter(c => 
        new Date(c.end_date) < new Date() && c.is_active
      ).length
      const totalParticipants = challenges.reduce((sum, c) => sum + (c.participant_count || 0), 0)

      setStats({ totalChallenges, activeChallenges, completedChallenges, totalParticipants })
      setChallenges(challenges)

    } catch (error) {
      console.error("Error loading challenges:", error)
      toast({
        title: "Error",
        description: "Failed to load challenges",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveChallenge = async () => {
    try {
      if (!formData.title || !formData.description) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      if (editingChallenge) {
        const { error } = await supabase
          .from("challenges")
          .update(formData)
          .eq("id", editingChallenge.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Challenge updated successfully and pushed to users",
        })
      } else {
        const { error } = await supabase
          .from("challenges")
          .insert([formData])

        if (error) throw error

        toast({
          title: "Success",
          description: "New challenge created and pushed to public",
        })
      }

      setIsDialogOpen(false)
      setEditingChallenge(null)
      setFormData(defaultFormData)
      loadChallenges()
    } catch (error) {
      console.error("Error saving challenge:", error)
      toast({
        title: "Error",
        description: "Failed to save challenge",
        variant: "destructive",
      })
    }
  }

  const handleDeleteChallenge = async (challengeId: string) => {
    try {
      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", challengeId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Challenge deleted successfully",
      })

      loadChallenges()
    } catch (error) {
      console.error("Error deleting challenge:", error)
      toast({
        title: "Error",
        description: "Failed to delete challenge",
        variant: "destructive",
      })
    }
  }

  const handleToggleActive = async (challengeId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from("challenges")
        .update({ is_active: !isActive })
        .eq("id", challengeId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Challenge ${!isActive ? 'activated and pushed to users' : 'deactivated'}`,
      })

      loadChallenges()
    } catch (error) {
      console.error("Error updating challenge:", error)
      toast({
        title: "Error",
        description: "Failed to update challenge",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (challenge: Challenge) => {
    setEditingChallenge(challenge)
    setFormData({
      title: challenge.title,
      description: challenge.description,
      challenge_type: challenge.challenge_type,
      difficulty: challenge.difficulty,
      target_value: challenge.target_value || 50,
      target_unit: challenge.target_unit || "kg CO2",
      points_reward: challenge.points_reward,
      start_date: challenge.start_date.split('T')[0],
      end_date: challenge.end_date.split('T')[0],
      is_active: challenge.is_active
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingChallenge(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
  }

  const getDifficultyBadge = (difficulty: string) => {
    if (!difficulty) {
      return (
        <Badge className="bg-gray-100 text-gray-700">
          Unknown
        </Badge>
      )
    }
    
    const colors = {
      beginner: "bg-green-100 text-green-700",
      intermediate: "bg-yellow-100 text-yellow-700",
      advanced: "bg-red-100 text-red-700"
    }
    return (
      <Badge className={colors[difficulty as keyof typeof colors] || colors.beginner}>
        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (challenge: Challenge) => {
    const now = new Date()
    const startDate = new Date(challenge.start_date)
    const endDate = new Date(challenge.end_date)

    if (!challenge.is_active) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Inactive
      </Badge>
    }

    if (now < startDate) {
      return <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Upcoming
      </Badge>
    }

    if (now > endDate) {
      return <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Ended
      </Badge>
    }

    return <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
      <Trophy className="w-3 h-3" />
      Live & Public
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
          <h1 className="text-2xl font-bold">Challenge Management</h1>
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
          <h1 className="text-2xl font-bold text-foreground">Challenge Management</h1>
          <p className="text-muted-foreground">Create and push new challenges to public, manage existing ones</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Push New Challenge to Public
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Challenges</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChallenges}</div>
            <p className="text-xs text-muted-foreground">All created challenges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Challenges</CardTitle>
            <Trophy className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeChallenges}</div>
            <p className="text-xs text-muted-foreground">Currently public & active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalParticipants}</div>
            <p className="text-xs text-muted-foreground">Across all challenges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedChallenges}</div>
            <p className="text-xs text-muted-foreground">Finished challenges</p>
          </CardContent>
        </Card>
      </div>

      {/* Challenges Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Challenges</CardTitle>
          <CardDescription>Manage challenges visible to users - activate/deactivate, edit details, or delete</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Challenge</TableHead>
                  <TableHead>Type & Difficulty</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Participants</TableHead>
                  <TableHead>Reward</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challenges.map((challenge) => (
                  <TableRow key={challenge.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{challenge.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {challenge.description}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Target: {challenge.target_value || 0} {challenge.target_unit || 'units'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant="outline" className="text-xs">
                          {challenge.challenge_type ? challenge.challenge_type.replace('_', ' ') : 'N/A'}
                        </Badge>
                        {getDifficultyBadge(challenge.difficulty)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(challenge)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatDate(challenge.start_date)}</div>
                        <div className="text-muted-foreground">to {formatDate(challenge.end_date)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{challenge.participant_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-600" />
                        <span>{challenge.points_reward} pts</span>
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
                              <DialogTitle>{challenge.title}</DialogTitle>
                              <DialogDescription>Challenge details and settings</DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Description</label>
                                <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Type</label>
                                  <p className="text-sm text-muted-foreground">{challenge.challenge_type ? challenge.challenge_type.replace('_', ' ') : 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Difficulty</label>
                                  <p className="text-sm text-muted-foreground">{challenge.difficulty || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Target</label>
                                  <p className="text-sm text-muted-foreground">
                                    {challenge.target_value || 0} {challenge.target_unit || 'units'}
                                  </p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Points Reward</label>
                                  <p className="text-sm text-muted-foreground">{challenge.points_reward} points</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Participants</label>
                                  <p className="text-sm text-muted-foreground">{challenge.participant_count || 0} users</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Status</label>
                                  <div className="mt-1">{getStatusBadge(challenge)}</div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Edit Challenge */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(challenge)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Toggle Active/Push to Public */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(challenge.id, challenge.is_active)}
                          className={challenge.is_active ? "text-orange-600" : "text-green-600"}
                        >
                          {challenge.is_active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>

                        {/* Delete Challenge */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{challenge.title}"? This action cannot be undone and will remove the challenge from all users.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteChallenge(challenge.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Challenge
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

      {/* Create/Edit Challenge Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingChallenge ? "Edit Challenge" : "Create New Challenge"}
            </DialogTitle>
            <DialogDescription>
              {editingChallenge ? "Update challenge and push changes to users" : "Create a new challenge and push it to public immediately"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Challenge title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Points Reward *</label>
                <Input
                  type="number"
                  value={formData.points_reward}
                  onChange={(e) => setFormData({ ...formData, points_reward: parseInt(e.target.value) || 0 })}
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
                placeholder="Describe the challenge and what users need to do..."
                rows={3}
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Challenge Type</label>
                <Select value={formData.challenge_type} onValueChange={(value) => setFormData({ ...formData, challenge_type: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carbon_reduction">Carbon Reduction</SelectItem>
                    <SelectItem value="energy_saving">Energy Saving</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="recycling">Recycling</SelectItem>
                    <SelectItem value="water_conservation">Water Conservation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Target Value</label>
                <Input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: parseInt(e.target.value) || 0 })}
                  placeholder="50"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Unit</label>
                <Select value={formData.target_unit} onValueChange={(value) => setFormData({ ...formData, target_unit: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg CO2">kg CO2</SelectItem>
                    <SelectItem value="kWh">kWh</SelectItem>
                    <SelectItem value="miles">miles</SelectItem>
                    <SelectItem value="liters">liters</SelectItem>
                    <SelectItem value="days">days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
                <label htmlFor="is_active" className="text-sm font-medium">Push to Public</label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChallenge}>
              {editingChallenge ? "Update & Push to Users" : "Create & Push to Public"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
