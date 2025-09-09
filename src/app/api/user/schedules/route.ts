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

    // Generate sample train schedules for demo
    const schedules = [
      {
        id: "1",
        trainId: "12301",
        type: "EXPRESS",
        departure: "New Delhi",
        arrival: "Mumbai Central",
        platform: "3",
        status: "ON_TIME",
        delay: 0,
        price: 1250,
        rating: 4
      },
      {
        id: "2",
        trainId: "12259",
        type: "PASSENGER",
        departure: "New Delhi",
        arrival: "Howrah",
        platform: "7",
        status: "DELAYED",
        delay: 15,
        price: 850,
        rating: 3
      },
      {
        id: "3",
        trainId: "12723",
        type: "EXPRESS",
        departure: "Hazrat Nizamuddin",
        arrival: "Bangalore City",
        platform: "1",
        status: "BOARDING",
        delay: 0,
        price: 1650,
        rating: 5
      },
      {
        id: "4",
        trainId: "11077",
        type: "PASSENGER",
        departure: "New Delhi",
        arrival: "Chennai Central",
        platform: "5",
        status: "ON_TIME",
        delay: 0,
        price: 950,
        rating: 4
      },
      {
        id: "5",
        trainId: "12625",
        type: "EXPRESS",
        departure: "New Delhi",
        arrival: "Thiruvananthapuram",
        platform: "2",
        status: "CANCELLED",
        delay: 0,
        price: 2150,
        rating: 2
      }
    ]

    return NextResponse.json({ schedules })

  } catch (error) {
    console.error("Error fetching schedules:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}