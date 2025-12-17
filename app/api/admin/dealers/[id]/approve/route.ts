import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"
import { PERMISSIONS, hasPermission } from "@/lib/auth/rbac"

/**
 * POST - Approve dealer
 */
export async function POST(
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

    if (!admin || !hasPermission(admin.role as any, PERMISSIONS.DEALERS_APPROVE)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { priceTier, creditLimit } = body

    const dealer = await prisma.dealer.update({
      where: { id: params.id },
      data: {
        isApproved: true,
        priceTier: priceTier || "STANDARD",
        creditLimit: creditLimit || 10000,
      },
    })

    // Create notification for dealer
    await prisma.notification.create({
      data: {
        dealerId: dealer.id,
        type: "SYSTEM",
        title: "Başvurunuz Onaylandı",
        message: `Tebrikler! Bayi başvurunuz onaylandı. Artık sipariş verebilir ve teklif isteyebilirsiniz. Fiyat kademeniz: ${priceTier}`,
        link: "/dashboard",
      },
    })

    return NextResponse.json({
      message: "Dealer approved successfully",
      dealer,
    })
  } catch (error) {
    console.error("Dealer approval error:", error)
    return NextResponse.json(
      { error: "Failed to approve dealer" },
      { status: 500 }
    )
  }
}
