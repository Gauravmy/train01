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

    // Generate sample platform status data
    const platforms = [
      {
        platform: "1",
        status: "AVAILABLE",
        nextTrain: "12723 - Bangalore Express",
        available: true
      },
      {
        platform: "2",
        status: "OCCUPIED",
        nextTrain: "12625 - Kerala Express",
        available: false
      },
      {
        platform: "3",
        status: "AVAILABLE",
        nextTrain: "12301 - Mumbai Rajdhani",
        available: true
      },
      {
        platform: "4",
        status: "MAINTENANCE",
        nextTrain: "No trains scheduled",
        available: false
      },
      {
        platform: "5",
        status: "AVAILABLE",
        nextTrain: "11077 - Tamil Nadu Express",
        available: true
      },
      {
        platform: "6",
        status: "OCCUPIED",
        nextTrain: "12259 - Duronto Express",
        available: false
      },
      {
        platform: "7",
        status: "AVAILABLE",
        nextTrain: "12951 - Mumbai Delhi Express",
        available: true
      },
      {
        platform: "8",
        status: "AVAILABLE",
        nextTrain: "12433 - Rajasthan Sampark Kranti",
        available: true
      }
    ]

    return NextResponse.json({ platforms })

  } catch (error) {
    console.error("Error fetching platforms:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}