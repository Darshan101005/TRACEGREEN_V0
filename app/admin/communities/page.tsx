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
  Users, 
  Edit,
  Trash2,
  Eye,
  Settings,
  MessageSquare,
  UserPlus,
  UserMinus,
  Globe,
  Lock,
  Calendar,
  Activity,
  TrendingUp
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Community {
  id: string
  name: string
  description: string
  category: string
  is_public: boolean
  created_at: string
  updated_at: string
  member_count?: number
  post_count?: number
  activity_score?: number
  creator_id?: string
  creator_name?: string
}

interface CommunityFormData {
  name: string
  description: string
  category: string
  is_public: boolean
}

const defaultFormData: CommunityFormData = {
  name: "",
  description: "",
  category: "general",
  is_public: true
}

export default function AdminCommunities() {
  const [communities, setCommunities] = useState<Community[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null)
  const [formData, setFormData] = useState<CommunityFormData>(defaultFormData)
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null)
  const [communityMembers, setCommunityMembers] = useState<any[]>([])
  const [communityPosts, setCommunityPosts] = useState<any[]>([])
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    totalCommunities: 0,
    publicCommunities: 0,
    totalMembers: 0,
    activeCommunities: 0
  })

  const supabase = createClient()

  useEffect(() => {
    loadCommunities()
  }, [])

  const loadCommunities = async () => {
    try {
      setIsLoading(true)
      const { data: communitiesData, error } = await supabase
        .from("communities")
        .select(`
          *,
          profiles!communities_creator_id_fkey(display_name)
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      // Get member counts and activity data
      const communitiesWithStats = await Promise.all(
        (communitiesData || []).map(async (community) => {
          const [memberCountResult, postCountResult] = await Promise.all([
            supabase
              .from("community_members")
              .select("id", { count: "exact" })
              .eq("community_id", community.id),
            supabase
              .from("community_posts")
              .select("id", { count: "exact" })
              .eq("community_id", community.id)
          ])

          return {
            ...community,
            member_count: memberCountResult.count || 0,
            post_count: postCountResult.count || 0,
            creator_name: community.profiles?.display_name || "Unknown",
            activity_score: Math.floor(Math.random() * 100) // Mock activity score
          }
        })
      )

      const communities = communitiesWithStats
      const totalCommunities = communities.length
      const publicCommunities = communities.filter(c => c.is_public).length
      const totalMembers = communities.reduce((sum, c) => sum + (c.member_count || 0), 0)
      const activeCommunities = communities.filter(c => (c.post_count || 0) > 0).length

      setStats({ totalCommunities, publicCommunities, totalMembers, activeCommunities })
      setCommunities(communities)

    } catch (error) {
      console.error("Error loading communities:", error)
      toast({
        title: "Error",
        description: "Failed to load communities",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCommunity = async () => {
    try {
      if (!formData.name || !formData.description) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      if (editingCommunity) {
        const { error } = await supabase
          .from("communities")
          .update(formData)
          .eq("id", editingCommunity.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Community updated successfully",
        })
      } else {
        const { error } = await supabase
          .from("communities")
          .insert([{
            ...formData,
            creator_id: (await supabase.auth.getUser()).data.user?.id
          }])

        if (error) throw error

        toast({
          title: "Success",
          description: "New community created",
        })
      }

      setIsDialogOpen(false)
      setEditingCommunity(null)
      setFormData(defaultFormData)
      loadCommunities()
    } catch (error) {
      console.error("Error saving community:", error)
      toast({
        title: "Error",
        description: "Failed to save community",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCommunity = async (communityId: string) => {
    try {
      const { error } = await supabase
        .from("communities")
        .delete()
        .eq("id", communityId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Community deleted successfully",
      })

      loadCommunities()
    } catch (error) {
      console.error("Error deleting community:", error)
      toast({
        title: "Error",
        description: "Failed to delete community",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublic = async (communityId: string, isPublic: boolean) => {
    try {
      const { error } = await supabase
        .from("communities")
        .update({ is_public: !isPublic })
        .eq("id", communityId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Community ${!isPublic ? 'made public' : 'made private'}`,
      })

      loadCommunities()
    } catch (error) {
      console.error("Error updating community:", error)
      toast({
        title: "Error",
        description: "Failed to update community",
        variant: "destructive",
      })
    }
  }

  const loadCommunityDetails = async (community: Community) => {
    try {
      setSelectedCommunity(community)

      const [membersResult, postsResult] = await Promise.all([
        supabase
          .from("community_members")
          .select(`
            *,
            profiles!community_members_user_id_fkey(display_name, email, avatar_url)
          `)
          .eq("community_id", community.id)
          .order("joined_at", { ascending: false }),
        supabase
          .from("community_posts")
          .select(`
            *,
            profiles!community_posts_author_id_fkey(display_name)
          `)
          .eq("community_id", community.id)
          .order("created_at", { ascending: false })
          .limit(10)
      ])

      setCommunityMembers(membersResult.data || [])
      setCommunityPosts(postsResult.data || [])
      setIsMembersDialogOpen(true)

    } catch (error) {
      console.error("Error loading community details:", error)
      toast({
        title: "Error",
        description: "Failed to load community details",
        variant: "destructive",
      })
    }
  }

  const handleRemoveMember = async (communityId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", memberId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Member removed from community",
      })

      // Reload community details
      if (selectedCommunity) {
        loadCommunityDetails(selectedCommunity)
      }
      loadCommunities()

    } catch (error) {
      console.error("Error removing member:", error)
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (community: Community) => {
    setEditingCommunity(community)
    setFormData({
      name: community.name,
      description: community.description,
      category: community.category,
      is_public: community.is_public
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingCommunity(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
  }

  const getPrivacyBadge = (isPublic: boolean) => {
    if (isPublic) {
      return <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
        <Globe className="w-3 h-3" />
        Public
      </Badge>
    }
    return <Badge variant="secondary" className="flex items-center gap-1">
      <Lock className="w-3 h-3" />
      Private
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
          <h1 className="text-2xl font-bold">Community Management</h1>
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
          <h1 className="text-2xl font-bold text-foreground">Community Management</h1>
          <p className="text-muted-foreground">Manage communities, moderate content, and track engagement</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Community
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Communities</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCommunities}</div>
            <p className="text-xs text-muted-foreground">All communities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Public</CardTitle>
            <Globe className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publicCommunities}</div>
            <p className="text-xs text-muted-foreground">Open communities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <UserPlus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all communities</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCommunities}</div>
            <p className="text-xs text-muted-foreground">With recent posts</p>
          </CardContent>
        </Card>
      </div>

      {/* Communities Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Communities</CardTitle>
          <CardDescription>Manage community settings, members, and content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Community</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Privacy</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Posts</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {communities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{community.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {community.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {community.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getPrivacyBadge(community.is_public)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{community.member_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-muted-foreground" />
                        <span>{community.post_count || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span>{community.activity_score || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {community.creator_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(community.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View Members */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadCommunityDetails(community)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>

                        {/* Edit Community */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(community)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Toggle Privacy */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublic(community.id, community.is_public)}
                          className={community.is_public ? "text-orange-600" : "text-green-600"}
                        >
                          {community.is_public ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                        </Button>

                        {/* Delete Community */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Community</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{community.name}"? This will remove all posts and members. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteCommunity(community.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Community
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

      {/* Create/Edit Community Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCommunity ? "Edit Community" : "Create New Community"}
            </DialogTitle>
            <DialogDescription>
              {editingCommunity ? "Update community settings" : "Create a new community for users to join"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium">Community Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Community name"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. sustainability, tips, local"
                  className="mt-1"
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_public"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                />
                <label htmlFor="is_public" className="text-sm font-medium">Public community</label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description *</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the community purpose and guidelines..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCommunity}>
              {editingCommunity ? "Update Community" : "Create Community"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Community Details Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCommunity?.name}</DialogTitle>
            <DialogDescription>
              Community members and recent activity
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Members Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Members ({communityMembers.length})</h3>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {communityMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {member.profiles?.display_name?.[0] || "U"}
                            </div>
                            <div>
                              <div className="font-medium">
                                {member.profiles?.display_name || "Unknown User"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {member.profiles?.email || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {formatDate(member.joined_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600">
                                <UserMinus className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remove Member</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to remove {member.profiles?.display_name} from this community?
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleRemoveMember(selectedCommunity?.id || "", member.user_id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Remove Member
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Recent Posts Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recent Posts ({communityPosts.length})</h3>
              <div className="space-y-4">
                {communityPosts.map((post) => (
                  <Card key={post.id}>
                    <CardContent className="pt-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{post.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {post.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <span>By {post.profiles?.display_name || "Unknown"}</span>
                            <span>•</span>
                            <span>{formatDate(post.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
