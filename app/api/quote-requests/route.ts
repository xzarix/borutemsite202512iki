import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"

// GET /api/quote-requests - List dealer's quote requests
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

    const quoteRequests = await prisma.quoteRequest.findMany({
      where: { dealerId: dealer.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
                price: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(quoteRequests)
  } catch (error) {
    console.error("Quote requests fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch quote requests" },
      { status: 500 }
    )
  }
}

// POST /api/quote-requests - Create new quote request from cart
export async function POST(request: NextRequest) {
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
    const { shippingAddress, notes, items } = body

    if (!shippingAddress || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Shipping address and items are required" },
        { status: 400 }
      )
    }

    // Generate quote number
    const quoteNumber = "QR-" + String(Date.now())

    // Calculate total
    const total = items.reduce((sum: number, item: any) => {
      return sum + (item.price * item.quantity)
    }, 0)

    // Create quote request
    const quoteRequest = await prisma.quoteRequest.create({
      data: {
        quoteNumber,
        dealerId: dealer.id,
        shippingAddress,
        notes,
        totalAmount: total,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            requestedPrice: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    return NextResponse.json(quoteRequest, { status: 201 })
  } catch (error) {
    console.error("Quote request creation error:", error)
    return NextResponse.json(
      { error: "Failed to create quote request" },
      { status: 500 }
    )
  }
}
