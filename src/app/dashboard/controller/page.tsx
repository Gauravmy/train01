"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Train, 
  Activity, 
  Clock, 
  Zap, 
  Target, 
  LogOut, 
  Play, 
  Pause, 
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  ArrowLeft,
  Settings,
  Eye,
  Route
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface Train {
  id: string
  trainId: string
  type: string
  schedule: string
  status: string
  section: string
  platform: string
  priority: string
  delay: number
  createdAt: string
}

interface AISuggestion {
  id: string
  trainId: string
  suggestion: string
  priority: string
  confidence: number
  timestamp: string
}

interface Section {
  name: string
  status: string
  trainCount: number
  capacity: number
  utilization: number
}

interface Controller {
  assignedSection: string
  isActive: boolean
}

export default function ControllerDashboard() {
  const [user, setUser] = useState<any>(null)
  const [controller, setController] = useState<Controller | null>(null)
  const [trains, setTrains] = useState<Train[]>([])
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null)
  const [simulationMode, setSimulationMode] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    
    if (!userData || !token) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "CONTROLLER") {
      router.push("/dashboard/user")
      return
    }

    setUser(parsedUser)
    fetchData()
    
    // Set up real-time updates
    const interval = setInterval(fetchData, 30000) // Update every 30 seconds
    
    return () => clearInterval(interval)
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      const [trainsRes, suggestionsRes, sectionsRes, controllerRes] = await Promise.all([
        fetch("/api/controller/trains", { headers }),
        fetch("/api/controller/suggestions", { headers }),
        fetch("/api/controller/sections", { headers }),
        fetch("/api/controller/profile", { headers })
      ])

      if (trainsRes.ok) {
        const trainsData = await trainsRes.json()
        setTrains(trainsData.trains)
      }

      if (suggestionsRes.ok) {
        const suggestionsData = await suggestionsRes.json()
        setSuggestions(suggestionsData.suggestions)
      }

      if (sectionsRes.ok) {
        const sectionsData = await sectionsRes.json()
        setSections(sectionsData.sections)
      }

      if (controllerRes.ok) {
        const controllerData = await controllerRes.json()
        setController(controllerData.controller)
      }

    } catch (err) {
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleTrainAction = async (trainId: string, action: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/controller/trains/${trainId}/action`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ action })
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to perform action")
      }
    } catch (err) {
      setError("Failed to perform action")
    }
  }

  const handleAcceptSuggestion = async (suggestionId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/controller/suggestions/${suggestionId}/accept`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to accept suggestion")
      }
    } catch (err) {
      setError("Failed to accept suggestion")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SCHEDULED":
        return <Badge variant="secondary">Scheduled</Badge>
      case "RUNNING":
        return <Badge className="bg-green-500">Running</Badge>
      case "DELAYED":
        return <Badge variant="destructive">Delayed</Badge>
      case "CANCELLED":
        return <Badge variant="outline">Cancelled</Badge>
      case "COMPLETED":
        return <Badge className="bg-blue-500">Completed</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "LOW":
        return <Badge variant="outline">Low</Badge>
      case "MEDIUM":
        return <Badge className="bg-yellow-500">Medium</Badge>
      case "HIGH":
        return <Badge className="bg-orange-500">High</Badge>
      case "URGENT":
        return <Badge variant="destructive">Urgent</Badge>
      default:
        return <Badge>{priority}</Badge>
    }
  }

  const getSectionStatus = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <Badge className="bg-green-500">Active</Badge>
      case "CONGESTED":
        return <Badge className="bg-yellow-500">Congested</Badge>
      case "BLOCKED":
        return <Badge variant="destructive">Blocked</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading controller dashboard...</p>
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Controller Dashboard</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Section: {controller?.assignedSection || "Unassigned"}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user?.role}</p>
              </div>
              <Button 
                variant={simulationMode ? "default" : "outline"} 
                size="sm"
                onClick={() => setSimulationMode(!simulationMode)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Simulation {simulationMode ? "ON" : "OFF"}
              </Button>
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
              <CardTitle className="text-sm font-medium">Active Trains</CardTitle>
              <Train className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trains.filter(t => t.status === "RUNNING").length}
              </div>
              <p className="text-xs text-muted-foreground">
                In your section
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delayed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trains.filter(t => t.delay > 0).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Trains delayed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Suggestions</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{suggestions.length}</div>
              <p className="text-xs text-muted-foreground">
                Pending review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Section Status</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sections.find(s => s.name === controller?.assignedSection)?.utilization || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Utilization rate
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="trains" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trains">Live Trains</TabsTrigger>
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="suggestions">AI Suggestions</TabsTrigger>
            <TabsTrigger value="simulation">Simulation</TabsTrigger>
          </TabsList>

          <TabsContent value="trains" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Live Train Movement</h2>
              <Badge variant={simulationMode ? "default" : "secondary"}>
                {simulationMode ? "Simulation Mode" : "Live Mode"}
              </Badge>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Active Trains in Your Section</CardTitle>
                <CardDescription>Monitor and control train movements in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Train ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Delay</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trains.filter(t => t.section === controller?.assignedSection).map((train) => (
                      <TableRow key={train.id}>
                        <TableCell className="font-medium">{train.trainId}</TableCell>
                        <TableCell>{train.type}</TableCell>
                        <TableCell>{getStatusBadge(train.status)}</TableCell>
                        <TableCell>{train.platform || "-"}</TableCell>
                        <TableCell>{getPriorityBadge(train.priority)}</TableCell>
                        <TableCell>
                          {train.delay > 0 ? (
                            <span className="text-red-600">+{train.delay}m</span>
                          ) : (
                            <span className="text-green-600">On time</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {train.status === "SCHEDULED" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTrainAction(train.id, "START")}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            {train.status === "RUNNING" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleTrainAction(train.id, "HALT")}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleTrainAction(train.id, "REROUTE")}
                            >
                              <Route className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sections" className="space-y-6">
            <h2 className="text-2xl font-bold">Section Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sections.map((section) => (
                <Card key={section.name} className={section.name === controller?.assignedSection ? "ring-2 ring-blue-500" : ""}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {section.name}
                      {section.name === controller?.assignedSection && (
                        <Badge variant="default">Your Section</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      {getSectionStatus(section.status)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Trains:</span>
                        <span className="font-bold">{section.trainCount}/{section.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Utilization:</span>
                        <span className="font-bold">{section.utilization}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            section.utilization > 80 ? "bg-red-500" : 
                            section.utilization > 60 ? "bg-yellow-500" : "bg-green-500"
                          }`}
                          style={{ width: `${section.utilization}%` }}
                        ></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <h2 className="text-2xl font-bold">AI-Powered Suggestions</h2>
            <div className="space-y-4">
              {suggestions.map((suggestion) => (
                <Card key={suggestion.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Train {suggestion.trainId}</span>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(suggestion.priority)}
                        <Badge variant="outline">
                          {Math.round(suggestion.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      {new Date(suggestion.timestamp).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="mb-4">{suggestion.suggestion}</p>
                    <div className="flex space-x-2">
                      <Button 
                        onClick={() => handleAcceptSuggestion(suggestion.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Accept
                      </Button>
                      <Button variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {suggestions.length === 0 && (
                <Card>
                  <CardContent className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">
                      No AI suggestions at the moment. System is running optimally.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Scenario Simulation</h2>
              <Button 
                variant={simulationMode ? "default" : "outline"}
                onClick={() => setSimulationMode(!simulationMode)}
              >
                {simulationMode ? "Exit Simulation" : "Start Simulation"}
              </Button>
            </div>

            {simulationMode ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>What-If Analysis</CardTitle>
                    <CardDescription>
                      Simulate different scenarios and their impact on traffic flow
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold">Scenario Parameters</h3>
                        <div>
                          <Label htmlFor="delayFactor">Delay Factor</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select delay factor" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low (1-5 min)</SelectItem>
                              <SelectItem value="medium">Medium (5-15 min)</SelectItem>
                              <SelectItem value="high">High (15-30 min)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="trainVolume">Train Volume</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select volume" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low Volume</SelectItem>
                              <SelectItem value="normal">Normal Volume</SelectItem>
                              <SelectItem value="high">High Volume</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button className="w-full">
                          <Target className="h-4 w-4 mr-2" />
                          Run Simulation
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <h3 className="font-semibold">Predicted Outcomes</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Throughput Impact:</span>
                            <span className="font-bold text-red-600">-15%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Average Delay:</span>
                            <span className="font-bold">+8.5 min</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Cascade Risk:</span>
                            <span className="font-bold text-yellow-600">Medium</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Optimization Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Reroute high-priority trains</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Consider alternative routes for urgent trains to minimize delays
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Adjust scheduling intervals</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Increase buffer time between train departures
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <div>
                          <p className="font-medium">Prioritize passenger trains</p>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            Give preference to passenger trains over freight during peak hours
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Simulation Mode Inactive</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Enable simulation mode to test different scenarios and analyze their impact on railway operations.
                  </p>
                  <Button onClick={() => setSimulationMode(true)}>
                    <Play className="h-4 w-4 mr-2" />
                    Start Simulation
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}