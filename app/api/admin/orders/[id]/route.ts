import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"
import { PERMISSIONS, hasPermission } from "@/lib/auth/rbac"
import { z } from "zod"
import { OrderStatus } from "@prisma/client"

// Validation schema for order update
const orderUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
  ]),
  notes: z.string().optional(),
})

/**
 * GET - Get single order by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await prisma.dealer.findUnique({
      where: { email: session.user.email },
    })

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.ORDERS_VIEW_ALL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        dealer: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            email: true,
            phone: true,
            address: true,
            city: true,
            priceTier: true,
            creditLimit: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("Admin order GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update order status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const admin = await prisma.dealer.findUnique({
      where: { email: session.user.email },
    })

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.ORDERS_UPDATE_ALL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = orderUpdateSchema.parse(body)

    // Check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        dealer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    // Validate status transitions
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["PREPARING", "CANCELLED"],
      PREPARING: ["SHIPPED", "CANCELLED"],
      SHIPPED: ["DELIVERED"],
      DELIVERED: [],
      CANCELLED: [],
    }

    const newStatus = validatedData.status as OrderStatus
    const currentStatus = existingOrder.status

    if (
      currentStatus !== newStatus &&
      !validTransitions[currentStatus].includes(newStatus)
    ) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
          validTransitions: validTransitions[currentStatus],
        },
        { status: 400 }
      )
    }

    // Update order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          ...(validatedData.notes && { notes: validatedData.notes }),
        },
        include: {
          dealer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      })

      // If order is cancelled, restore stock
      if (newStatus === "CANCELLED" && currentStatus !== "CANCELLED") {
        for (const item of existingOrder.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          })
        }

        // Reverse current account transaction
        const currentAccount = await tx.currentAccount.findUnique({
          where: { dealerId: existingOrder.dealerId },
        })

        if (currentAccount) {
          await tx.currentAccount.update({
            where: { dealerId: existingOrder.dealerId },
            data: {
              balance: {
                decrement: existingOrder.totalAmount,
              },
            },
          })

          await tx.currentAccountTransaction.create({
            data: {
              accountId: currentAccount.id,
              type: "REFUND",
              amount: existingOrder.totalAmount,
              balance: currentAccount.balance - existingOrder.totalAmount,
              description: `İptal: ${existingOrder.orderNumber}`,
              referenceType: "Order",
              referenceId: existingOrder.id,
            },
          })
        }
      }

      // Create notification for dealer
      const statusMessages: Record<OrderStatus, string> = {
        PENDING: "Siparişiniz beklemede",
        CONFIRMED: "Siparişiniz onaylandı ve işleme alındı",
        PREPARING: "Siparişiniz hazırlanıyor",
        SHIPPED: "Siparişiniz kargoya verildi",
        DELIVERED: "Siparişiniz teslim edildi",
        CANCELLED: "Siparişiniz iptal edildi",
      }

      await tx.notification.create({
        data: {
          dealerId: existingOrder.dealerId,
          type: "ORDER_STATUS",
          title: "Sipariş Durumu Güncellendi",
          message: `${existingOrder.orderNumber} - ${statusMessages[newStatus]}`,
          link: `/dashboard/orders/${existingOrder.id}`,
        },
      })

      return updatedOrder
    })

    return NextResponse.json({
      message: "Order updated successfully",
      order,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Admin order UPDATE error:", error)
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}
