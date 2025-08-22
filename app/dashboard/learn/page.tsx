"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { DashboardNav } from "@/components/dashboard-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BookOpen,
  Play,
  FileText,
  ImageIcon,
  HelpCircle,
  Search,
  Clock,
  Eye,
  Heart,
  Bookmark,
  TrendingUp,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface EducationalContent {
  id: string
  title: string
  content: string
  content_type: string
  category: string
  difficulty_level: string
  estimated_read_time: number | null
  image_url: string | null
  video_url: string | null
  tags: string[]
  author: string | null
  source_url: string | null
  is_featured: boolean
  is_published: boolean
  view_count: number
  like_count: number
  created_at: string
  user_interaction?: {
    interaction_type: string
    created_at: string
  }[]
}

const contentTypeIcons = {
  article: FileText,
  tip: BookOpen,
  video: Play,
  infographic: ImageIcon,
  quiz: HelpCircle,
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
}

const categoryColors = {
  transportation: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400",
  energy: "bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400",
  food: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400",
  waste: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400",
  general: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  climate_science: "bg-teal-100 text-teal-600 dark:bg-teal-900 dark:text-teal-400",
}

export default function LearnPage() {
  const [user, setUser] = useState<any>(null)
  const [content, setContent] = useState<EducationalContent[]>([])
  const [filteredContent, setFilteredContent] = useState<EducationalContent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [activeTab, setActiveTab] = useState("browse")

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }
      setUser(user)
      await loadContent(user.id)
    }
    getUser()
  }, [router, supabase])

  const loadContent = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("educational_content")
        .select(
          `
          *,
          user_content_interactions!left (
            interaction_type,
            created_at
          )
        `,
        )
        .eq("user_content_interactions.user_id", userId)
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })

      if (error) throw error

      // Transform data to include user interactions
      const transformedContent = data?.map((item) => ({
        ...item,
        user_interaction: item.user_content_interactions || [],
      }))

      setContent(transformedContent || [])
      setFilteredContent(transformedContent || [])
    } catch (error) {
      console.error("Error loading content:", error)
      toast({
        title: "Error",
        description: "Failed to load educational content",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleInteraction = async (contentId: string, interactionType: string) => {
    if (!user) return

    try {
      const { error } = await supabase.from("user_content_interactions").upsert(
        {
          user_id: user.id,
          content_id: contentId,
          interaction_type: interactionType,
        },
        {
          onConflict: "user_id,content_id,interaction_type",
        },
      )

      if (error) throw error

      // Update local state
      setContent((prev) =>
        prev.map((item) => {
          if (item.id === contentId) {
            const existingInteraction = item.user_interaction?.find((i) => i.interaction_type === interactionType)
            if (!existingInteraction) {
              return {
                ...item,
                user_interaction: [
                  ...(item.user_interaction || []),
                  { interaction_type: interactionType, created_at: new Date().toISOString() },
                ],
                like_count: interactionType === "like" ? item.like_count + 1 : item.like_count,
                view_count: interactionType === "view" ? item.view_count + 1 : item.view_count,
              }
            }
          }
          return item
        }),
      )

      if (interactionType === "like") {
        toast({
          title: "Liked!",
          description: "Content added to your liked items",
        })
      } else if (interactionType === "bookmark") {
        toast({
          title: "Bookmarked!",
          description: "Content saved to your bookmarks",
        })
      }
    } catch (error) {
      console.error("Error handling interaction:", error)
    }
  }

  // Filter content based on search and filters
  useEffect(() => {
    let filtered = content

    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory)
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((item) => item.content_type === selectedType)
    }

    setFilteredContent(filtered)
  }, [content, searchQuery, selectedCategory, selectedType])

  const categories = ["all", ...Array.from(new Set(content.map((c) => c.category)))]
  const contentTypes = ["all", ...Array.from(new Set(content.map((c) => c.content_type)))]

  const featuredContent = content.filter((c) => c.is_featured).slice(0, 3)
  const likedContent = content.filter((c) => c.user_interaction?.some((i) => i.interaction_type === "like"))
  const bookmarkedContent = content.filter((c) => c.user_interaction?.some((i) => i.interaction_type === "bookmark"))

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <DashboardNav user={user} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav user={user} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Learn</h1>
          <p className="text-muted-foreground mt-2">
            Discover sustainability tips, articles, and resources to reduce your carbon footprint
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="liked">Liked</TabsTrigger>
          </TabsList>

          {/* Browse Tab */}
          <TabsContent value="browse" className="space-y-6">
            {/* Featured Content */}
            {featuredContent.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Featured Content
                  </CardTitle>
                  <CardDescription>Hand-picked articles and resources for you</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    {featuredContent.map((item) => {
                      const IconComponent = contentTypeIcons[item.content_type as keyof typeof contentTypeIcons]
                      const isLiked = item.user_interaction?.some((i) => i.interaction_type === "like")
                      const isBookmarked = item.user_interaction?.some((i) => i.interaction_type === "bookmark")

                      return (
                        <Card key={item.id} className="relative">
                          <Badge className="absolute -top-2 -right-2 bg-primary">Featured</Badge>
                          <CardHeader>
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="secondary"
                                    className={categoryColors[item.category as keyof typeof categoryColors]}
                                  >
                                    {item.category}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={difficultyColors[item.difficulty_level as keyof typeof difficultyColors]}
                                  >
                                    {item.difficulty_level}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{item.content}</p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                              <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {item.estimated_read_time || 5} min
                                </span>
                                <span className="flex items-center gap-1">
                                  <Eye className="w-3 h-3" />
                                  {item.view_count}
                                </span>
                              </div>
                              <span>{item.author}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleInteraction(item.id, "view")}
                                className="flex-1"
                              >
                                Read More
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleInteraction(item.id, "like")}
                                className={isLiked ? "text-red-500" : ""}
                              >
                                <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleInteraction(item.id, "bookmark")}
                                className={isBookmarked ? "text-blue-500" : ""}
                              >
                                <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Search and Filters */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search articles, tips, and resources..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Category:</span>
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="capitalize"
                        >
                          {category === "all" ? "All" : category.replace("_", " ")}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Type:</span>
                      {contentTypes.map((type) => (
                        <Button
                          key={type}
                          variant={selectedType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedType(type)}
                          className="capitalize"
                        >
                          {type === "all" ? "All" : type}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredContent.map((item) => {
                const IconComponent = contentTypeIcons[item.content_type as keyof typeof contentTypeIcons]
                const isLiked = item.user_interaction?.some((i) => i.interaction_type === "like")
                const isBookmarked = item.user_interaction?.some((i) => i.interaction_type === "bookmark")

                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={categoryColors[item.category as keyof typeof categoryColors]}
                            >
                              {item.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={difficultyColors[item.difficulty_level as keyof typeof difficultyColors]}
                            >
                              {item.difficulty_level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.estimated_read_time || 5} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.view_count}
                          </span>
                        </div>
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInteraction(item.id, "view")}
                          className="flex-1"
                        >
                          Read More
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInteraction(item.id, "like")}
                          className={isLiked ? "text-red-500" : ""}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInteraction(item.id, "bookmark")}
                          className={isBookmarked ? "text-blue-500" : ""}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {filteredContent.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No content found</h3>
                  <p className="text-muted-foreground">
                    Try adjusting your search terms or filters to find more content.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bookmarks Tab */}
          <TabsContent value="bookmarks" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bookmarkedContent.map((item) => {
                const IconComponent = contentTypeIcons[item.content_type as keyof typeof contentTypeIcons]
                const isLiked = item.user_interaction?.some((i) => i.interaction_type === "like")

                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={categoryColors[item.category as keyof typeof categoryColors]}
                            >
                              {item.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={difficultyColors[item.difficulty_level as keyof typeof difficultyColors]}
                            >
                              {item.difficulty_level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.estimated_read_time || 5} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.view_count}
                          </span>
                        </div>
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInteraction(item.id, "view")}
                          className="flex-1"
                        >
                          Read More
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInteraction(item.id, "like")}
                          className={isLiked ? "text-red-500" : ""}
                        >
                          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInteraction(item.id, "bookmark")}
                          className="text-blue-500"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {bookmarkedContent.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bookmark className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No bookmarks yet</h3>
                  <p className="text-muted-foreground">
                    Bookmark articles and resources to save them for later reading.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Liked Tab */}
          <TabsContent value="liked" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {likedContent.map((item) => {
                const IconComponent = contentTypeIcons[item.content_type as keyof typeof contentTypeIcons]
                const isBookmarked = item.user_interaction?.some((i) => i.interaction_type === "bookmark")

                return (
                  <Card key={item.id}>
                    <CardHeader>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="secondary"
                              className={categoryColors[item.category as keyof typeof categoryColors]}
                            >
                              {item.category}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={difficultyColors[item.difficulty_level as keyof typeof difficultyColors]}
                            >
                              {item.difficulty_level}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{item.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {item.estimated_read_time || 5} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {item.view_count}
                          </span>
                        </div>
                        <span>{item.author}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInteraction(item.id, "view")}
                          className="flex-1"
                        >
                          Read More
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInteraction(item.id, "like")}
                          className="text-red-500"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleInteraction(item.id, "bookmark")}
                          className={isBookmarked ? "text-blue-500" : ""}
                        >
                          <Bookmark className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {likedContent.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No liked content yet</h3>
                  <p className="text-muted-foreground">Like articles and resources to easily find them again later.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
