import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"

/**
 * PATCH - Mark notification as read
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        dealerId: dealer.id,
      },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Notification update error:", error)
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const notification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        dealerId: dealer.id,
      },
    })

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      )
    }

    await prisma.notification.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Notification deleted" })
  } catch (error) {
    console.error("Notification deletion error:", error)
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    )
  }
}
