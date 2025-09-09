"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Train, 
  Clock, 
  MapPin, 
  Calendar, 
  TrendingUp, 
  LogOut, 
  Search,
  Star,
  Zap,
  AlertTriangle,
  CheckCircle,
  ArrowLeft,
  Filter,
  Navigation
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface TrainSchedule {
  id: string
  trainId: string
  type: string
  departure: string
  arrival: string
  platform: string
  status: string
  delay: number
  price: number
  rating: number
}

interface PlatformStatus {
  platform: string
  status: string
  nextTrain: string
  available: boolean
}

interface AISuggestion {
  id: string
  type: string
  description: string
  benefit: string
  confidence: number
}

interface UserPreferences {
  favoriteRoutes: string[]
  preferredTime: string
  budget: number
}

export default function UserDashboard() {
  const [user, setUser] = useState<any>(null)
  const [schedules, setSchedules] = useState<TrainSchedule[]>([])
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([])
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [preferences, setPreferences] = useState<UserPreferences>({
    favoriteRoutes: [],
    preferredTime: "morning",
    budget: 1000
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    
    if (!userData || !token) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    setUser(parsedUser)
    fetchData()
    
    // Set up periodic updates for real-time information
    const interval = setInterval(fetchData, 60000) // Update every minute
    
    return () => clearInterval(interval)
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      const [schedulesRes, platformsRes, suggestionsRes] = await Promise.all([
        fetch("/api/user/schedules", { headers }),
        fetch("/api/user/platforms", { headers }),
        fetch("/api/user/suggestions", { headers })
      ])

      if (schedulesRes.ok) {
        const schedulesData = await schedulesRes.json()
        setSchedules(schedulesData.schedules)
      }

      if (platformsRes.ok) {
        const platformsData = await platformsRes.json()
        setPlatforms(platformsData.platforms)
      }

      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json()
        setSuggestions(suggestionsData.suggestions)
      }

    } catch (err) {
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ON_TIME":
        return <Badge className="bg-green-500">On Time</Badge>
      case "DELAYED":
        return <Badge variant="destructive">Delayed</Badge>
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>
      case "BOARDING":
        return <Badge className="bg-blue-500">Boarding</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPlatformStatus = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge className="bg-green-500">Available</Badge>
      case "OCCUPIED":
        return <Badge className="bg-yellow-500">Occupied</Badge>
      case "MAINTENANCE":
        return <Badge variant="destructive">Maintenance</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.trainId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         schedule.departure.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         schedule.arrival.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || schedule.type.toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesType
  })

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Train className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Link>
              <div className="ml-8 flex items-center">
                <Train className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Dashboard</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Welcome back, {user?.name}!</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Trains</CardTitle>
              <Train className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{schedules.length}</div>
              <p className="text-xs text-muted-foreground">
                Available schedules
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On Time</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {schedules.filter(s => s.status === "ON_TIME").length}
              </div>
              <p className="text-xs text-muted-foreground">
                Punctual trains
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platforms</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {platforms.filter(p => p.available).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Available now
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Tips</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suggestions.length}</div>
              <p className="text-xs text-muted-foreground">
                Personalized for you
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="schedules" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="schedules">Train Schedules</TabsTrigger>
            <TabsTrigger value="platforms">Platform Status</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          <TabsContent value="schedules" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Upcoming Train Schedules</h2>
              <Badge variant="secondary">Live Updates</Badge>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search trains, destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("all")}
                >
                  All
                </Button>
                <Button
                  variant={filterType === "passenger" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("passenger")}
                >
                  Passenger
                </Button>
                <Button
                  variant={filterType === "express" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterType("express")}
                >
                  Express
                </Button>
              </div>
            </div>

            <div className="grid gap-4">
              {filteredSchedules.map((schedule) => (
                <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="text-lg font-semibold">{schedule.trainId}</h3>
                          <Badge variant="outline">{schedule.type}</Badge>
                          {getStatusBadge(schedule.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">Departure</p>
                            <p className="font-medium">{schedule.departure}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">Arrival</p>
                            <p className="font-medium">{schedule.arrival}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-300">Platform</p>
                            <p className="font-medium">{schedule.platform}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-6 mt-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className={schedule.delay > 0 ? "text-red-600" : "text-green-600"}>
                              {schedule.delay > 0 ? `+${schedule.delay} min delay` : "On time"}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Price:</span>
                            <span className="font-medium ml-1">₹{schedule.price}</span>
                          </div>
                          <div>
                            {renderStars(schedule.rating)}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <Button>Book Now</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredSchedules.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No trains found</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Try adjusting your search or filter criteria
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            <h2 className="text-2xl font-bold">Platform Availability</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {platforms.map((platform) => (
                <Card key={platform.platform} className={platform.available ? "border-green-200" : "border-red-200"}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Platform {platform.platform}</span>
                      {getPlatformStatus(platform.status)}
                    </CardTitle>
                    <CardDescription>
                      {platform.available ? "Available for boarding" : "Currently occupied"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {platform.nextTrain && (
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">Next train:</p>
                          <p className="font-medium">{platform.nextTrain}</p>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${
                          platform.available ? "bg-green-500" : "bg-red-500"
                        }`}></div>
                        <span className="text-sm">
                          {platform.available ? "Ready for boarding" : "Please wait"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <h2 className="text-2xl font-bold">Personalized AI Suggestions</h2>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{suggestion.type.replace("_", " ")}</span>
                      <Badge variant="outline">
                        {Math.round(suggestion.confidence * 100)}% match
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-3">{suggestion.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600 font-medium">
                          {suggestion.benefit}
                        </span>
                      </div>
                      <Button size="sm">Apply Suggestion</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {suggestions.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Zap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No suggestions yet</h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Our AI is analyzing your travel patterns to provide personalized recommendations
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-6">
            <h2 className="text-2xl font-bold">Travel Preferences</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Settings</CardTitle>
                  <CardDescription>
                    Customize your travel experience
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Preferred Travel Time</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={preferences.preferredTime}
                      onChange={(e) => setPreferences({...preferences, preferredTime: e.target.value})}
                    >
                      <option value="morning">Morning (6AM - 12PM)</option>
                      <option value="afternoon">Afternoon (12PM - 6PM)</option>
                      <option value="evening">Evening (6PM - 12AM)</option>
                      <option value="night">Night (12AM - 6AM)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Budget Range</label>
                    <select 
                      className="w-full mt-1 p-2 border rounded-md"
                      value={preferences.budget}
                      onChange={(e) => setPreferences({...preferences, budget: Number(e.target.value)})}
                    >
                      <option value={500}>Under ₹500</option>
                      <option value={1000}>Under ₹1000</option>
                      <option value={2000}>Under ₹2000</option>
                      <option value={5000}>Under ₹5000</option>
                    </select>
                  </div>
                  <Button className="w-full">Save Preferences</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Travel Insights</CardTitle>
                  <CardDescription>
                    Based on your travel patterns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Most traveled route</p>
                        <p className="text-sm text-gray-600">Delhi → Mumbai</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="font-medium">Preferred time</p>
                        <p className="text-sm text-gray-600">Morning trains</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <div>
                        <p className="font-medium">Favorite train type</p>
                        <p className="text-sm text-gray-600">Express</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}