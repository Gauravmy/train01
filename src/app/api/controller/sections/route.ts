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

    // Get all sections with their current status
    const allSections = ["Section A", "Section B", "Section C", "Section D"]
    const sections = []

    for (const sectionName of allSections) {
      // Get trains in this section
      const trains = await db.train.findMany({
        where: {
          section: sectionName,
          status: { in: ["SCHEDULED", "RUNNING"] }
        }
      })

      const trainCount = trains.length
      const capacity = 10 // Max trains per section
      const utilization = Math.round((trainCount / capacity) * 100)
      
      // Determine section status based on utilization
      let status = "ACTIVE"
      if (utilization > 80) {
        status = "CONGESTED"
      } else if (utilization === 0) {
        status = "ACTIVE"
      }

      sections.push({
        name: sectionName,
        status,
        trainCount,
        capacity,
        utilization
      })
    }

    return NextResponse.json({ sections })

  } catch (error) {
    console.error("Error fetching sections:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}