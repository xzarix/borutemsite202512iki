import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"
import { validateBulkOrderCSV, generateBulkOrderTemplate } from "@/lib/utils/csv-parser"

/**
 * POST - Process bulk order from CSV
 */
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
    const { csvContent, shippingAddress, notes } = body

    if (!csvContent) {
      return NextResponse.json(
        { error: "CSV content is required" },
        { status: 400 }
      )
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: "Shipping address is required" },
        { status: 400 }
      )
    }

    // Validate CSV
    const validation = validateBulkOrderCSV(csvContent)

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: "CSV validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    // Find products by their codes (slug)
    const productCodes = validation.items.map((item) => item.productCode)
    const products = await prisma.product.findMany({
      where: {
        slug: { in: productCodes },
        isActive: true,
      },
    })

    // Create a map of product code to product
    const productMap = new Map()
    products.forEach((product) => {
      productMap.set(product.slug, product)
    })

    // Validate all products exist
    const missingProducts: string[] = []
    const orderItems: Array<{
      productId: string
      quantity: number
      price: number
    }> = []

    let totalAmount = 0

    for (const item of validation.items) {
      const product = productMap.get(item.productCode)

      if (!product) {
        missingProducts.push(item.productCode)
        continue
      }

      // Check stock
      if (product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          },
          { status: 400 }
        )
      }

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      })

      totalAmount += product.price * item.quantity
    }

    if (missingProducts.length > 0) {
      return NextResponse.json(
        {
          error: "Some products not found",
          missingProducts,
        },
        { status: 404 }
      )
    }

    if (orderItems.length === 0) {
      return NextResponse.json(
        { error: "No valid items in order" },
        { status: 400 }
      )
    }

    // Create order
    const orderNumber = "ORD-" + String(Date.now())

    const order = await prisma.order.create({
      data: {
        orderNumber,
        dealerId: dealer.id,
        status: "PENDING",
        totalAmount,
        shippingAddress,
        notes,
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

    // Update stock (decrease)
    for (const item of orderItems) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      })
    }

    return NextResponse.json(
      {
        message: "Bulk order created successfully",
        order,
        itemsCount: orderItems.length,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Bulk order error:", error)
    return NextResponse.json(
      { error: "Failed to process bulk order" },
      { status: 500 }
    )
  }
}

/**
 * GET - Download CSV template
 */
export async function GET() {
  try {
    const template = generateBulkOrderTemplate()

    return new NextResponse(template, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="bulk-order-template.csv"',
      },
    })
  } catch (error) {
    console.error("Template download error:", error)
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 }
    )
  }
}
