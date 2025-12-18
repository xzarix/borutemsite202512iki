import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"
import { PERMISSIONS, hasPermission } from "@/lib/auth/rbac"
import { z } from "zod"

// Validation schema for product update
const productUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().min(1).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  material: z.string().optional(),
  diameter: z.string().optional(),
  pressure: z.string().optional(),
  flowRate: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  technicalSpecs: z.array(z.object({
    id: z.string().optional(),
    key: z.string(),
    value: z.string(),
    unit: z.string().optional(),
    category: z.string().optional(),
    order: z.number().int().optional().default(0),
  })).optional(),
})

/**
 * GET - Get single product by ID
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

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.PRODUCTS_VIEW)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        technicalSpecs: {
          orderBy: {
            order: "asc",
          },
        },
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
            quoteRequestItems: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error("Admin product GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update product
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

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.PRODUCTS_UPDATE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = productUpdateSchema.parse(body)

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if slug is being changed and if it's unique
    if (validatedData.slug && validatedData.slug !== existingProduct.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: validatedData.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: "Product with this slug already exists" },
          { status: 400 }
        )
      }
    }

    // Check if category exists
    if (validatedData.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: validatedData.categoryId },
      })

      if (!category) {
        return NextResponse.json(
          { error: "Category not found" },
          { status: 400 }
        )
      }
    }

    const { technicalSpecs, ...productData } = validatedData

    // Update product
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...productData,
        ...(technicalSpecs && {
          technicalSpecs: {
            deleteMany: {},
            create: technicalSpecs.map(({ id, ...spec }) => spec),
          },
        }),
      },
      include: {
        category: true,
        technicalSpecs: true,
      },
    })

    return NextResponse.json({
      message: "Product updated successfully",
      product,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Admin product UPDATE error:", error)
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete product
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

    const admin = await prisma.dealer.findUnique({
      where: { email: session.user.email },
    })

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.PRODUCTS_DELETE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orderItems: true,
            cartItems: true,
            quoteRequestItems: true,
          },
        },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Check if product is used in orders
    if (product._count.orderItems > 0) {
      return NextResponse.json(
        {
          error: "Cannot delete product that has been ordered",
          suggestion: "Consider marking it as inactive instead",
        },
        { status: 400 }
      )
    }

    // Delete product (will cascade delete technical specs, cart items, quote items)
    await prisma.product.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      message: "Product deleted successfully",
    })
  } catch (error) {
    console.error("Admin product DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
