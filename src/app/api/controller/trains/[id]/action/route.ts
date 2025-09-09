import { NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { db } from "@/lib/db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    if (decoded.role !== "CONTROLLER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { action } = await request.json()

    if (!action) {
      return NextResponse.json({ error: "Action is required" }, { status: 400 })
    }

    // Get controller's assigned section
    const controller = await db.controller.findUnique({
      where: { userId: decoded.userId }
    })

    if (!controller) {
      return NextResponse.json({ error: "Controller not found" }, { status: 404 })
    }

    // Get the train
    const train = await db.train.findUnique({
      where: { id: params.id }
    })

    if (!train) {
      return NextResponse.json({ error: "Train not found" }, { status: 404 })
    }

    // Check if train belongs to controller's section
    if (train.section !== controller.assignedSection) {
      return NextResponse.json({ error: "Train not in your section" }, { status: 403 })
    }

    // Update train based on action
    let updateData: any = {}
    let actionDescription = ""

    switch (action) {
      case "START":
        if (train.status !== "SCHEDULED") {
          return NextResponse.json({ error: "Train cannot be started" }, { status: 400 })
        }
        updateData = { status: "RUNNING" }
        actionDescription = `Started train ${train.trainId}`
        break
      
      case "HALT":
        if (train.status !== "RUNNING") {
          return NextResponse.json({ error: "Train is not running" }, { status: 400 })
        }
        updateData = { status: "SCHEDULED", delay: (train.delay || 0) + 5 }
        actionDescription = `Halted train ${train.trainId}`
        break
      
      case "REROUTE":
        // For demo purposes, just add a delay and change section
        const newSection = controller.assignedSection === "Section A" ? "Section B" : "Section A"
        updateData = { 
          section: newSection, 
          delay: (train.delay || 0) + 10,
          status: "SCHEDULED"
        }
        actionDescription = `Rerouted train ${train.trainId} to ${newSection}`
        break
      
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    // Update train
    const updatedTrain = await db.train.update({
      where: { id: params.id },
      data: updateData
    })

    // Log the action
    await db.log.create({
      data: {
        action: action.toUpperCase(),
        userId: decoded.userId,
        trainId: train.id,
        controllerId: controller.id,
        details: actionDescription
      }
    })

    return NextResponse.json({ 
      message: "Action completed successfully",
      train: updatedTrain 
    })

  } catch (error) {
    console.error("Error performing train action:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}