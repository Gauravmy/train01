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

    const trains = await db.train.findMany({
      include: {
        creator: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({ trains })

  } catch (error) {
    console.error("Error fetching trains:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { trainId, type, schedule, section, platform, priority } = await request.json()

    if (!trainId || !type || !schedule || !section || !priority) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if train with same ID already exists
    const existingTrain = await db.train.findUnique({
      where: { trainId }
    })

    if (existingTrain) {
      return NextResponse.json({ error: "Train with this ID already exists" }, { status: 409 })
    }

    const train = await db.train.create({
      data: {
        trainId,
        type,
        schedule: new Date(schedule),
        section,
        platform,
        priority,
        creatorId: decoded.userId
      }
    })

    // Log the action
    await db.log.create({
      data: {
        action: "CREATE_TRAIN",
        userId: decoded.userId,
        trainId: train.id,
        details: `Created new train ${trainId} (${type})`
      }
    })

    return NextResponse.json({ train })

  } catch (error) {
    console.error("Error creating train:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}