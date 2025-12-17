import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"

// GET /api/quote-requests/[id] - Get quote request details
export async function GET(
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

    const quoteRequest = await prisma.quoteRequest.findFirst({
      where: {
        id: params.id,
        dealerId: dealer.id,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
        dealer: {
          select: {
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
          },
        },
      },
    })

    if (!quoteRequest) {
      return NextResponse.json(
        { error: "Quote request not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(quoteRequest)
  } catch (error) {
    console.error("Quote request fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch quote request" },
      { status: 500 }
    )
  }
}

// PATCH /api/quote-requests/[id] - Update quote request (accept/reject)
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

    const body = await request.json()
    const { status } = body

    const quoteRequest = await prisma.quoteRequest.findFirst({
      where: {
        id: params.id,
        dealerId: dealer.id,
      },
    })

    if (!quoteRequest) {
      return NextResponse.json(
        { error: "Quote request not found" },
        { status: 404 }
      )
    }

    const updated = await prisma.quoteRequest.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Quote request update error:", error)
    return NextResponse.json(
      { error: "Failed to update quote request" },
      { status: 500 }
    )
  }
}

// DELETE /api/quote-requests/[id] - Cancel quote request
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

    const quoteRequest = await prisma.quoteRequest.findFirst({
      where: {
        id: params.id,
        dealerId: dealer.id,
        status: "PENDING",
      },
    })

    if (!quoteRequest) {
      return NextResponse.json(
        { error: "Quote request not found or cannot be cancelled" },
        { status: 404 }
      )
    }

    await prisma.quoteRequest.update({
      where: { id: params.id },
      data: { status: "REJECTED" },
    })

    return NextResponse.json({ message: "Quote request cancelled" })
  } catch (error) {
    console.error("Quote request deletion error:", error)
    return NextResponse.json(
      { error: "Failed to cancel quote request" },
      { status: 500 }
    )
  }
}
