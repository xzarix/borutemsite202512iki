import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"
import { PERMISSIONS, hasPermission } from "@/lib/auth/rbac"
import { z } from "zod"

// Validation schema for dealer update
const dealerUpdateSchema = z.object({
  companyName: z.string().min(1).optional(),
  contactName: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  taxNumber: z.string().optional(),
  role: z.enum([
    "SUPER_ADMIN",
    "ADMIN",
    "SALES_MANAGER",
    "SALES_REP",
    "DEALER",
    "DEALER_EMPLOYEE",
  ]).optional(),
  isApproved: z.boolean().optional(),
  isActive: z.boolean().optional(),
  priceTier: z.enum(["STANDARD", "BRONZE", "SILVER", "GOLD", "PLATINUM"]).optional(),
  creditLimit: z.number().min(0).optional(),
})

/**
 * GET - Get single dealer by ID
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

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.DEALERS_VIEW_ALL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const dealer = await prisma.dealer.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        companyName: true,
        contactName: true,
        phone: true,
        address: true,
        city: true,
        taxNumber: true,
        role: true,
        isApproved: true,
        isActive: true,
        priceTier: true,
        creditLimit: true,
        createdAt: true,
        updatedAt: true,
        orders: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        quoteRequests: {
          take: 10,
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            quoteNumber: true,
            status: true,
            totalAmount: true,
            createdAt: true,
          },
        },
        currentAccount: {
          select: {
            balance: true,
            creditLimit: true,
            transactions: {
              take: 10,
              orderBy: {
                createdAt: "desc",
              },
            },
          },
        },
        _count: {
          select: {
            orders: true,
            quoteRequests: true,
            notifications: true,
          },
        },
      },
    })

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    return NextResponse.json(dealer)
  } catch (error) {
    console.error("Admin dealer GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dealer" },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update dealer information
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

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.DEALERS_UPDATE_ALL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = dealerUpdateSchema.parse(body)

    // Check if dealer exists
    const existingDealer = await prisma.dealer.findUnique({
      where: { id: params.id },
    })

    if (!existingDealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Update dealer
    const dealer = await prisma.dealer.update({
      where: { id: params.id },
      data: validatedData,
      select: {
        id: true,
        email: true,
        companyName: true,
        contactName: true,
        phone: true,
        address: true,
        city: true,
        taxNumber: true,
        role: true,
        isApproved: true,
        isActive: true,
        priceTier: true,
        creditLimit: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    // Create notification if important changes were made
    if (
      validatedData.isApproved !== undefined ||
      validatedData.priceTier !== undefined ||
      validatedData.creditLimit !== undefined ||
      validatedData.isActive !== undefined
    ) {
      let message = "Hesap bilgileriniz güncellendi."

      if (validatedData.isApproved === true && !existingDealer.isApproved) {
        message = "Tebrikler! Bayi hesabınız onaylandı."
      } else if (validatedData.isApproved === false && existingDealer.isApproved) {
        message = "Bayi hesabınızın onayı kaldırıldı."
      } else if (validatedData.isActive === false && existingDealer.isActive) {
        message = "Hesabınız pasif duruma alındı."
      } else if (validatedData.priceTier && validatedData.priceTier !== existingDealer.priceTier) {
        message = `Fiyat kademeniz ${validatedData.priceTier} olarak güncellendi.`
      } else if (validatedData.creditLimit !== undefined && validatedData.creditLimit !== existingDealer.creditLimit) {
        message = `Kredi limitiniz ${validatedData.creditLimit} TL olarak güncellendi.`
      }

      await prisma.notification.create({
        data: {
          dealerId: params.id,
          type: "SYSTEM",
          title: "Hesap Güncellemesi",
          message,
          link: "/dashboard/profile",
        },
      })
    }

    return NextResponse.json({
      message: "Dealer updated successfully",
      dealer,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Admin dealer UPDATE error:", error)
    return NextResponse.json(
      { error: "Failed to update dealer" },
      { status: 500 }
    )
  }
}

/**
 * DELETE - Delete dealer (soft delete by setting isActive = false)
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

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.DEALERS_DELETE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Check if dealer exists
    const dealer = await prisma.dealer.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Soft delete if dealer has orders, hard delete otherwise
    if (dealer._count.orders > 0) {
      await prisma.dealer.update({
        where: { id: params.id },
        data: {
          isActive: false,
          isApproved: false,
        },
      })

      return NextResponse.json({
        message: "Dealer deactivated (has existing orders)",
      })
    } else {
      await prisma.dealer.delete({
        where: { id: params.id },
      })

      return NextResponse.json({
        message: "Dealer deleted successfully",
      })
    }
  } catch (error) {
    console.error("Admin dealer DELETE error:", error)
    return NextResponse.json(
      { error: "Failed to delete dealer" },
      { status: 500 }
    )
  }
}
