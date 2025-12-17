import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"

/**
 * GET - List user's notifications
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const dealer = await prisma.dealer.findUnique({
      where: { email: session.user.email },
    })

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const unreadOnly = searchParams.get("unreadOnly") === "true"
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: any = { dealerId: dealer.id }
    if (unreadOnly) {
      where.isRead = false
    }

    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    const unreadCount = await prisma.notification.count({
      where: {
        dealerId: dealer.id,
        isRead: false,
      },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Notifications fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    )
  }
}

/**
 * POST - Create new notification (internal/admin use)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { dealerId, type, title, message, link } = body

    if (!dealerId || !type || !title || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const notification = await prisma.notification.create({
      data: {
        dealerId,
        type,
        title,
        message,
        link,
      },
    })

    return NextResponse.json(notification, { status: 201 })
  } catch (error) {
    console.error("Notification creation error:", error)
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    )
  }
}
