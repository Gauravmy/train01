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
    
    if (decoded.role !== "CONTROLLER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get controller's assigned section
    const controller = await db.controller.findUnique({
      where: { userId: decoded.userId }
    })

    if (!controller) {
      return NextResponse.json({ error: "Controller not found" }, { status: 404 })
    }

    // Get trains in controller's section
    const trains = await db.train.findMany({
      where: {
        section: controller.assignedSection,
        status: { in: ["SCHEDULED", "RUNNING"] }
      }
    })

    // Generate AI suggestions based on train data
    const suggestions = []
    
    for (const train of trains) {
      // Generate suggestions based on train status and priority
      if (train.delay > 15 && train.priority === "HIGH") {
        suggestions.push({
          id: `suggestion_${train.id}_1`,
          trainId: train.trainId,
          suggestion: `High-priority train ${train.trainId} is delayed by ${train.delay} minutes. Consider rerouting or priority adjustment.`,
          priority: "HIGH",
          confidence: 0.85,
          timestamp: new Date().toISOString()
        })
      }
      
      if (train.status === "SCHEDULED" && train.priority === "URGENT") {
        suggestions.push({
          id: `suggestion_${train.id}_2`,
          trainId: train.trainId,
          suggestion: `Urgent train ${train.trainId} is scheduled but not yet started. Recommend immediate departure.`,
          priority: "URGENT",
          confidence: 0.95,
          timestamp: new Date().toISOString()
        })
      }
      
      if (trains.length > 5 && train.type === "FREIGHT") {
        suggestions.push({
          id: `suggestion_${train.id}_3`,
          trainId: train.trainId,
          suggestion: `Section congestion detected. Consider delaying freight train ${train.trainId} to prioritize passenger trains.`,
          priority: "MEDIUM",
          confidence: 0.70,
          timestamp: new Date().toISOString()
        })
      }
    }

    // Add some general system optimization suggestions
    if (trains.filter(t => t.delay > 0).length > trains.length * 0.3) {
      suggestions.push({
        id: "system_suggestion_1",
        trainId: "SYSTEM",
        suggestion: "High delay rate detected in your section. Consider reviewing scheduling and optimizing train intervals.",
        priority: "HIGH",
        confidence: 0.90,
        timestamp: new Date().toISOString()
      })
    }

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error("Error fetching suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}