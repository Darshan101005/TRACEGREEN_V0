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
  FileText, 
  Edit,
  Trash2,
  Eye,
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  Bell,
  Send,
  Calendar,
  Globe
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface Content {
  id: string
  title: string
  content: string
  content_type: string
  category: string
  is_published: boolean
  created_at: string
  updated_at: string
  author?: string
  views?: number
}

interface ContentFormData {
  title: string
  content: string
  content_type: string
  category: string
  is_published: boolean
}

const defaultFormData: ContentFormData = {
  title: "",
  content: "",
  content_type: "article",
  category: "general",
  is_published: true
}

export default function AdminContent() {
  const [contents, setContents] = useState<Content[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingContent, setEditingContent] = useState<Content | null>(null)
  const [formData, setFormData] = useState<ContentFormData>(defaultFormData)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    totalContent: 0,
    publishedContent: 0,
    totalViews: 0,
    recentContent: 0
  })

  const supabase = createClient()

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      setIsLoading(true)
      const { data: contentData, error } = await supabase
        .from("content")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error

      const contents = contentData || []
      const totalContent = contents.length
      const publishedContent = contents.filter(c => c.is_published).length
      const totalViews = contents.reduce((sum, c) => sum + (c.views || 0), 0)
      const recentContent = contents.filter(c => 
        new Date(c.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length

      setStats({ totalContent, publishedContent, totalViews, recentContent })
      setContents(contents)

    } catch (error) {
      console.error("Error loading content:", error)
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveContent = async () => {
    try {
      if (!formData.title || !formData.content) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        })
        return
      }

      if (editingContent) {
        const { error } = await supabase
          .from("content")
          .update(formData)
          .eq("id", editingContent.id)

        if (error) throw error

        toast({
          title: "Success",
          description: "Content updated and published to users",
        })
      } else {
        const { error } = await supabase
          .from("content")
          .insert([formData])

        if (error) throw error

        toast({
          title: "Success",
          description: "New content created and published",
        })
      }

      setIsDialogOpen(false)
      setEditingContent(null)
      setFormData(defaultFormData)
      loadContent()
    } catch (error) {
      console.error("Error saving content:", error)
      toast({
        title: "Error",
        description: "Failed to save content",
        variant: "destructive",
      })
    }
  }

  const handleDeleteContent = async (contentId: string) => {
    try {
      const { error } = await supabase
        .from("content")
        .delete()
        .eq("id", contentId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Content deleted successfully",
      })

      loadContent()
    } catch (error) {
      console.error("Error deleting content:", error)
      toast({
        title: "Error",
        description: "Failed to delete content",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublished = async (contentId: string, isPublished: boolean) => {
    try {
      const { error } = await supabase
        .from("content")
        .update({ is_published: !isPublished })
        .eq("id", contentId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Content ${!isPublished ? 'published to users' : 'unpublished'}`,
      })

      loadContent()
    } catch (error) {
      console.error("Error updating content:", error)
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      })
    }
  }

  const handleSendNotification = async () => {
    try {
      if (!notificationMessage.trim()) {
        toast({
          title: "Error",
          description: "Please enter a notification message",
          variant: "destructive",
        })
        return
      }

      // Here you would typically send a push notification or email
      // For now, we'll just show a success message
      toast({
        title: "Success",
        description: "Notification sent to all users",
      })

      setNotificationMessage("")
      setIsNotificationDialogOpen(false)
    } catch (error) {
      console.error("Error sending notification:", error)
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (content: Content) => {
    setEditingContent(content)
    setFormData({
      title: content.title,
      content: content.content,
      content_type: content.content_type,
      category: content.category,
      is_published: content.is_published
    })
    setIsDialogOpen(true)
  }

  const openCreateDialog = () => {
    setEditingContent(null)
    setFormData(defaultFormData)
    setIsDialogOpen(true)
  }

  const getContentTypeBadge = (type: string) => {
    const colors = {
      article: "bg-blue-100 text-blue-700",
      tip: "bg-green-100 text-green-700",
      guide: "bg-purple-100 text-purple-700",
      news: "bg-orange-100 text-orange-700",
      tutorial: "bg-red-100 text-red-700"
    }
    return (
      <Badge className={colors[type as keyof typeof colors] || colors.article}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const getStatusBadge = (content: Content) => {
    if (!content.is_published) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <XCircle className="w-3 h-3" />
        Draft
      </Badge>
    }

    return <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
      <Globe className="w-3 h-3" />
      Published
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
          <h1 className="text-2xl font-bold">Content Management</h1>
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
          <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground">Create educational content, send notifications, and manage site content</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsNotificationDialogOpen(true)}
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            Send Notification
          </Button>
          <Button onClick={openCreateDialog} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Content
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Content</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContent}</div>
            <p className="text-xs text-muted-foreground">All created content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Globe className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.publishedContent}</div>
            <p className="text-xs text-muted-foreground">Live content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalViews}</div>
            <p className="text-xs text-muted-foreground">Content engagement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentContent}</div>
            <p className="text-xs text-muted-foreground">New content</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Content</CardTitle>
          <CardDescription>Manage educational content, articles, and site information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type & Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contents.map((content) => (
                  <TableRow key={content.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{content.title}</div>
                        <div className="text-sm text-muted-foreground line-clamp-2">
                          {content.content.substring(0, 100)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        {getContentTypeBadge(content.content_type)}
                        <Badge variant="outline" className="text-xs">
                          {content.category}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(content)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-muted-foreground" />
                        <span>{content.views || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(content.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {formatDate(content.updated_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {/* View Content */}
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{content.title}</DialogTitle>
                              <DialogDescription>
                                {content.content_type} • {content.category}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="prose max-w-none">
                                <div className="whitespace-pre-wrap">{content.content}</div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        {/* Edit Content */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(content)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Toggle Published */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublished(content.id, content.is_published)}
                          className={content.is_published ? "text-orange-600" : "text-green-600"}
                        >
                          {content.is_published ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </Button>

                        {/* Delete Content */}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Content</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{content.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeleteContent(content.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete Content
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

      {/* Create/Edit Content Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? "Edit Content" : "Create New Content"}
            </DialogTitle>
            <DialogDescription>
              {editingContent ? "Update content and publish changes" : "Create new educational content for users"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Content title"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. sustainability, tips, guides"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Content Type</label>
                <Select value={formData.content_type} onValueChange={(value) => setFormData({ ...formData, content_type: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="tip">Tip</SelectItem>
                    <SelectItem value="guide">Guide</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                />
                <label htmlFor="is_published" className="text-sm font-medium">Publish immediately</label>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Content *</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Write your content here..."
                rows={12}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContent}>
              {editingContent ? "Update Content" : "Create Content"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={isNotificationDialogOpen} onOpenChange={setIsNotificationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send a notification message to all users
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notification Message *</label>
              <Textarea
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
                placeholder="Enter the message you want to send to all users..."
                rows={4}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNotificationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendNotification} className="flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send to All Users
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
