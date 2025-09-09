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

    const controller = await db.controller.findUnique({
      where: { userId: decoded.userId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!controller) {
      return NextResponse.json({ error: "Controller not found" }, { status: 404 })
    }

    return NextResponse.json({ controller })

  } catch (error) {
    console.error("Error fetching controller profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}