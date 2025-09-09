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

    const logs = await db.log.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true }
        },
        train: {
          select: { id: true, trainId: true, type: true }
        }
      },
      orderBy: { timestamp: "desc" },
      take: 100 // Limit to last 100 logs
    })

    return NextResponse.json({ logs })

  } catch (error) {
    console.error("Error fetching logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}