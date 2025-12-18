import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"
import { PERMISSIONS, hasPermission } from "@/lib/auth/rbac"
import { z } from "zod"
import { QuoteStatus } from "@prisma/client"

// Validation schema for quote update
const quoteUpdateSchema = z.object({
  status: z.enum([
    "PENDING",
    "REVIEWED",
    "QUOTED",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
  ]),
  adminNotes: z.string().optional(),
  discountPercent: z.number().min(0).max(100).optional(),
  validUntil: z.string().optional(), // ISO date string
  items: z
    .array(
      z.object({
        id: z.string(),
        quotedPrice: z.number().positive(),
      })
    )
    .optional(),
})

/**
 * GET - Get single quote request by ID
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

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.QUOTES_VIEW_ALL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const quote = await prisma.quoteRequest.findUnique({
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

    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    return NextResponse.json(quote)
  } catch (error) {
    console.error("Admin quote GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch quote" },
      { status: 500 }
    )
  }
}

/**
 * PUT - Update quote request (review, quote, approve/reject)
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

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.QUOTES_UPDATE_ALL)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = quoteUpdateSchema.parse(body)

    // Check if quote exists
    const existingQuote = await prisma.quoteRequest.findUnique({
      where: { id: params.id },
      include: {
        items: true,
        dealer: true,
      },
    })

    if (!existingQuote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 })
    }

    // Validate status transitions
    const validTransitions: Record<QuoteStatus, QuoteStatus[]> = {
      PENDING: ["REVIEWED", "REJECTED"],
      REVIEWED: ["QUOTED", "REJECTED"],
      QUOTED: ["ACCEPTED", "REJECTED", "EXPIRED"],
      ACCEPTED: [],
      REJECTED: [],
      EXPIRED: [],
    }

    const newStatus = validatedData.status as QuoteStatus
    const currentStatus = existingQuote.status

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

    // Calculate totals if quoting
    let totalAmount = existingQuote.totalAmount
    let finalAmount = existingQuote.finalAmount

    if (newStatus === "QUOTED" || validatedData.items) {
      totalAmount = 0

      // Update item prices if provided
      if (validatedData.items) {
        for (const itemUpdate of validatedData.items) {
          const item = existingQuote.items.find((i) => i.id === itemUpdate.id)
          if (item) {
            totalAmount += itemUpdate.quotedPrice * item.quantity
          }
        }
      } else {
        // Use existing prices
        for (const item of existingQuote.items) {
          const price = item.quotedPrice || item.requestedPrice || 0
          totalAmount += price * item.quantity
        }
      }

      // Apply discount if provided
      const discount = validatedData.discountPercent || 0
      finalAmount = totalAmount * (1 - discount / 100)
    }

    // Update quote in a transaction
    const quote = await prisma.$transaction(async (tx) => {
      // Update quote request
      const updatedQuote = await tx.quoteRequest.update({
        where: { id: params.id },
        data: {
          status: newStatus,
          ...(validatedData.adminNotes && { adminNotes: validatedData.adminNotes }),
          ...(newStatus === "REVIEWED" && { reviewedAt: new Date() }),
          ...(newStatus === "QUOTED" && {
            quotedAt: new Date(),
            totalAmount,
            finalAmount,
            discountPercent: validatedData.discountPercent || 0,
            validUntil: validatedData.validUntil
              ? new Date(validatedData.validUntil)
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
          }),
        },
        include: {
          dealer: true,
          items: true,
        },
      })

      // Update quote items if provided
      if (validatedData.items) {
        for (const itemUpdate of validatedData.items) {
          await tx.quoteRequestItem.update({
            where: { id: itemUpdate.id },
            data: {
              quotedPrice: itemUpdate.quotedPrice,
            },
          })
        }
      }

      // Create notification for dealer
      const statusMessages: Record<QuoteStatus, { title: string; message: string }> = {
        PENDING: {
          title: "Teklif İsteğiniz Alındı",
          message: "Teklif isteğiniz incelenmek üzere alındı",
        },
        REVIEWED: {
          title: "Teklif İsteğiniz İncelendi",
          message: "Teklif isteğiniz incelendi ve fiyatlandırma yapılıyor",
        },
        QUOTED: {
          title: "Teklifiniz Hazır",
          message: `Teklif isteğiniz için fiyat verildi. Toplam: ${finalAmount?.toFixed(2)} TL`,
        },
        ACCEPTED: {
          title: "Teklif Kabul Edildi",
          message: "Teklifiniz kabul edildi",
        },
        REJECTED: {
          title: "Teklif Reddedildi",
          message: "Teklif isteğiniz reddedildi",
        },
        EXPIRED: {
          title: "Teklif Süresi Doldu",
          message: "Teklifinizin geçerlilik süresi sona erdi",
        },
      }

      await tx.notification.create({
        data: {
          dealerId: existingQuote.dealerId,
          type: "QUOTE_STATUS",
          title: statusMessages[newStatus].title,
          message: `${existingQuote.quoteNumber} - ${statusMessages[newStatus].message}`,
          link: `/dashboard/quotes/${existingQuote.id}`,
        },
      })

      return updatedQuote
    })

    // Fetch updated items
    const quoteWithItems = await prisma.quoteRequest.findUnique({
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

    return NextResponse.json({
      message: "Quote updated successfully",
      quote: quoteWithItems,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }
    console.error("Admin quote UPDATE error:", error)
    return NextResponse.json(
      { error: "Failed to update quote" },
      { status: 500 }
    )
  }
}
