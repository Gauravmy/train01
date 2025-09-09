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

    // Generate personalized AI suggestions for users
    const suggestions = [
      {
        id: "1",
        type: "FASTER_ROUTE",
        description: "Based on your travel history, we recommend taking the 12723 Bangalore Express instead of your usual route. It's 30 minutes faster and has better punctuality.",
        benefit: "Save 30 minutes on your journey",
        confidence: 0.85
      },
      {
        id: "2",
        type: "BETTER_VALUE",
        description: "The 11077 Tamil Nadu Express offers similar comfort to your preferred train but costs ₹300 less. It has a 4-star rating and excellent on-time performance.",
        benefit: "Save ₹300 while maintaining comfort",
        confidence: 0.92
      },
      {
        id: "3",
        type: "OPTIMAL_TIMING",
        description: "Your preferred travel time is morning. We suggest booking the 8:00 AM departure instead of 6:00 AM for better rest and same-day arrival.",
        benefit: "Better travel experience with same-day arrival",
        confidence: 0.78
      },
      {
        id: "4",
        type: "LOYALTY_BONUS",
        description: "As a frequent traveler on the Delhi-Mumbai route, you're eligible for a 10% discount on your next booking with premium trains.",
        benefit: "Get 10% discount on premium trains",
        confidence: 0.95
      },
      {
        id: "5",
        type: "ALTERNATE_ROUTE",
        description: "Due to expected congestion on your regular route, consider traveling via the central route this week. It's less crowded and more reliable during peak season.",
        benefit: "Avoid congestion and improve reliability",
        confidence: 0.73
      }
    ]

    return NextResponse.json({ suggestions })

  } catch (error) {
    console.error("Error fetching user suggestions:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}