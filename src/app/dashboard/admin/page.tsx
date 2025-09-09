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
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Plus, 
  Edit, 
  Trash2, 
  Activity,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

interface User {
  id: string
  email: string
  name: string
  role: string
  createdAt: string
}

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

interface Log {
  id: string
  action: string
  timestamp: string
  user?: User
  train?: Train
  details: string
}

interface KPI {
  totalTrains: number
  activeTrains: number
  delayedTrains: number
  totalUsers: number
  averageDelay: number
  throughput: number
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [users, setUsers] = useState<User[]>([])
  const [trains, setTrains] = useState<Train[]>([])
  const [logs, setLogs] = useState<Log[]>([])
  const [kpi, setKpi] = useState<KPI>({
    totalTrains: 0,
    activeTrains: 0,
    delayedTrains: 0,
    totalUsers: 0,
    averageDelay: 0,
    throughput: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddTrain, setShowAddTrain] = useState(false)
  const [newTrain, setNewTrain] = useState({
    trainId: "",
    type: "PASSENGER",
    schedule: "",
    section: "",
    platform: "",
    priority: "MEDIUM"
  })
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem("user")
    const token = localStorage.getItem("token")
    
    if (!userData || !token) {
      router.push("/login")
      return
    }

    const parsedUser = JSON.parse(userData)
    if (parsedUser.role !== "ADMIN") {
      router.push("/dashboard/user")
      return
    }

    setUser(parsedUser)
    fetchData()
  }, [router])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token")
      const headers = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }

      const [usersRes, trainsRes, logsRes, kpiRes] = await Promise.all([
        fetch("/api/admin/users", { headers }),
        fetch("/api/admin/trains", { headers }),
        fetch("/api/admin/logs", { headers }),
        fetch("/api/admin/kpi", { headers })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData.users)
      }

      if (trainsRes.ok) {
        const trainsData = await trainsRes.json()
        setTrains(trainsData.trains)
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json()
        setLogs(logsData.logs)
      }

      if (kpiRes.ok) {
        const kpiData = await kpiRes.json()
        setKpi(kpiData.kpi)
      }

    } catch (err) {
      setError("Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleAddTrain = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/admin/trains", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newTrain)
      })

      if (response.ok) {
        setShowAddTrain(false)
        setNewTrain({
          trainId: "",
          type: "PASSENGER",
          schedule: "",
          section: "",
          platform: "",
          priority: "MEDIUM"
        })
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to add train")
      }
    } catch (err) {
      setError("Failed to add train")
    }
  }

  const handleDeleteTrain = async (trainId: string) => {
    if (!confirm("Are you sure you want to delete this train?")) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/admin/trains/${trainId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchData()
      } else {
        const data = await response.json()
        setError(data.error || "Failed to delete train")
      }
    } catch (err) {
      setError("Failed to delete train")
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                  <p className="text-sm text-gray-600 dark:text-gray-300">Railway Traffic Control System</p>
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

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Trains</CardTitle>
              <Train className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.totalTrains}</div>
              <p className="text-xs text-muted-foreground">
                {kpi.activeTrains} active
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Registered users
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Delay</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.averageDelay}m</div>
              <p className="text-xs text-muted-foreground">
                {kpi.delayedTrains} delayed trains
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.throughput}%</div>
              <p className="text-xs text-muted-foreground">
                System efficiency
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="trains" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trains">Trains</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="trains" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Train Management</h2>
              <Dialog open={showAddTrain} onOpenChange={setShowAddTrain}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Train
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Train</DialogTitle>
                    <DialogDescription>
                      Create a new train schedule in the system
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="trainId">Train ID</Label>
                      <Input
                        id="trainId"
                        value={newTrain.trainId}
                        onChange={(e) => setNewTrain({...newTrain, trainId: e.target.value})}
                        placeholder="e.g., 12301"
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Type</Label>
                      <Select value={newTrain.type} onValueChange={(value) => setNewTrain({...newTrain, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PASSENGER">Passenger</SelectItem>
                          <SelectItem value="EXPRESS">Express</SelectItem>
                          <SelectItem value="FREIGHT">Freight</SelectItem>
                          <SelectItem value="LOCAL">Local</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="schedule">Schedule</Label>
                      <Input
                        id="schedule"
                        type="datetime-local"
                        value={newTrain.schedule}
                        onChange={(e) => setNewTrain({...newTrain, schedule: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="section">Section</Label>
                      <Input
                        id="section"
                        value={newTrain.section}
                        onChange={(e) => setNewTrain({...newTrain, section: e.target.value})}
                        placeholder="e.g., Section A"
                      />
                    </div>
                    <div>
                      <Label htmlFor="platform">Platform</Label>
                      <Input
                        id="platform"
                        value={newTrain.platform}
                        onChange={(e) => setNewTrain({...newTrain, platform: e.target.value})}
                        placeholder="e.g., Platform 1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select value={newTrain.priority} onValueChange={(value) => setNewTrain({...newTrain, priority: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Low</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HIGH">High</SelectItem>
                          <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleAddTrain} className="w-full">
                      Add Train
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Trains</CardTitle>
                <CardDescription>Manage and monitor all trains in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Train ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Delay</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trains.map((train) => (
                      <TableRow key={train.id}>
                        <TableCell className="font-medium">{train.trainId}</TableCell>
                        <TableCell>{train.type}</TableCell>
                        <TableCell>{getStatusBadge(train.status)}</TableCell>
                        <TableCell>{train.section}</TableCell>
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
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleDeleteTrain(train.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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

          <TabsContent value="users" className="space-y-6">
            <h2 className="text-2xl font-bold">User Management</h2>
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>Manage system users and their roles</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name || "-"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "ADMIN" ? "destructive" : user.role === "CONTROLLER" ? "default" : "secondary"}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
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

          <TabsContent value="logs" className="space-y-6">
            <h2 className="text-2xl font-bold">System Logs</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Monitor system actions and events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-shrink-0">
                        {log.action === "LOGIN" && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {log.action === "REGISTER" && <Users className="h-5 w-5 text-blue-500" />}
                        {log.action === "ERROR" && <XCircle className="h-5 w-5 text-red-500" />}
                        {log.action === "WARNING" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {log.action}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {log.details}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {log.user && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {log.user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {log.user.role}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics & Reports</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>System Performance</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>System Efficiency</span>
                      <span className="font-bold">{kpi.throughput}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>On-Time Performance</span>
                      <span className="font-bold">{Math.round((1 - kpi.delayedTrains / kpi.totalTrains) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Trains</span>
                      <span className="font-bold">{kpi.activeTrains}/{kpi.totalTrains}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Train Status Distribution</CardTitle>
                  <CardDescription>Current status of all trains</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(
                      trains.reduce((acc, train) => {
                        acc[train.status] = (acc[train.status] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    ).map(([status, count]) => (
                      <div key={status} className="flex justify-between">
                        <span>{status}</span>
                        <span className="font-bold">{count}</span>
                      </div>
                    ))}
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