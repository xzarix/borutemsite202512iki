import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"
import { z } from "zod"

const checkoutSchema = z.object({
  shippingAddress: z.string().min(1, "Shipping address is required"),
  notes: z.string().optional(),
})

/**
 * POST - Convert cart to order (checkout)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = checkoutSchema.parse(body)

    // Get dealer info
    const dealer = await prisma.dealer.findUnique({
      where: { id: session.user.id },
    })

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Check if dealer is approved
    if (!dealer.isApproved) {
      return NextResponse.json(
        { error: "Your account is not yet approved for ordering" },
        { status: 403 }
      )
    }

    // Get cart with items
    const cart = await prisma.cart.findUnique({
      where: { dealerId: session.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!cart || cart.items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      )
    }

    // Validate stock and calculate total
    let totalAmount = 0
    const orderItems = []

    for (const item of cart.items) {
      const product = item.product

      // Check if product is active
      if (!product.isActive) {
        return NextResponse.json(
          {
            error: `Product "${product.name}" is no longer available`,
            productId: product.id,
          },
          { status: 400 }
        )
      }

      // Check stock availability
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
            productId: product.id,
            availableStock: product.stock,
          },
          { status: 400 }
        )
      }

      // Calculate price (could apply dealer price tier here in the future)
      const itemPrice = product.price
      totalAmount += itemPrice * item.quantity

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: itemPrice,
      })
    }

    // Check credit limit if dealer has one
    if (dealer.creditLimit > 0) {
      const currentAccount = await prisma.currentAccount.findUnique({
        where: { dealerId: dealer.id },
      })

      if (currentAccount) {
        const availableCredit = dealer.creditLimit - currentAccount.balance
        if (totalAmount > availableCredit) {
          return NextResponse.json(
            {
              error: "Order amount exceeds available credit limit",
              totalAmount,
              availableCredit,
            },
            { status: 400 }
          )
        }
      }
    }

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${dealer.id.substring(0, 6)}`

    // Create order and clear cart in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          dealerId: dealer.id,
          totalAmount,
          shippingAddress: validatedData.shippingAddress,
          notes: validatedData.notes,
          status: "PENDING",
          items: {
            create: orderItems,
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

      // Update product stock
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        })
      }

      // Create or update current account
      let currentAccount = await tx.currentAccount.findUnique({
        where: { dealerId: dealer.id },
      })

      if (!currentAccount) {
        currentAccount = await tx.currentAccount.create({
          data: {
            dealerId: dealer.id,
            balance: totalAmount,
            creditLimit: dealer.creditLimit,
          },
        })
      } else {
        currentAccount = await tx.currentAccount.update({
          where: { dealerId: dealer.id },
          data: {
            balance: {
              increment: totalAmount,
            },
          },
        })
      }

      // Create current account transaction
      await tx.currentAccountTransaction.create({
        data: {
          accountId: currentAccount.id,
          type: "ORDER",
          amount: totalAmount,
          balance: currentAccount.balance + totalAmount,
          description: `Sipariş: ${orderNumber}`,
          referenceType: "Order",
          referenceId: newOrder.id,
        },
      })

      // Create notification
      await tx.notification.create({
        data: {
          dealerId: dealer.id,
          type: "ORDER_STATUS",
          title: "Sipariş Oluşturuldu",
          message: `${orderNumber} numaralı siparişiniz başarıyla oluşturuldu. Toplam tutar: ${totalAmount.toFixed(2)} TL`,
          link: `/dashboard/orders/${newOrder.id}`,
        },
      })

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      })

      return newOrder
    })

    return NextResponse.json(
      {
        message: "Order created successfully",
        order,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Cart checkout error:", error)
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}
