import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get total trains count
    const totalTrains = await db.train.count()
    
    // Get active trains (running or scheduled)
    const activeTrains = await db.train.count({
      where: {
        status: { in: ["SCHEDULED", "RUNNING"] }
      }
    })
    
    // Get delayed trains
    const delayedTrains = await db.train.count({
      where: {
        delay: { gt: 0 }
      }
    })
    
    // Get total users
    const totalUsers = await db.user.count()
    
    // Get average delay
    const delayStats = await db.train.aggregate({
      where: {
        delay: { gt: 0 }
      },
      _avg: {
        delay: true
      }
    })
    
    // Calculate throughput (simplified calculation)
    const completedTrains = await db.train.count({
      where: {
        status: "COMPLETED"
      }
    })
    
    const throughput = totalTrains > 0 ? Math.round((completedTrains / totalTrains) * 100) : 0

    const kpi = {
      totalTrains,
      activeTrains,
      delayedTrains,
      totalUsers,
      averageDelay: Math.round(delayStats._avg.delay || 0),
      throughput
    }

    return NextResponse.json({ kpi })

  } catch (error) {
    console.error("Error fetching KPI:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}