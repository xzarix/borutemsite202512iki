import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"
import { PERMISSIONS, hasPermission } from "@/lib/auth/rbac"

/**
 * GET - List all dealers (admin view with filters)
 */
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams
    const isApproved = searchParams.get("isApproved")
    const isActive = searchParams.get("isActive")
    const priceTier = searchParams.get("priceTier")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

    if (isApproved !== null && isApproved !== undefined) {
      where.isApproved = isApproved === "true"
    }

    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true"
    }

    if (priceTier) {
      where.priceTier = priceTier
    }

    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: "insensitive" } },
        { contactName: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
        { taxNumber: { contains: search, mode: "insensitive" } },
      ]
    }

    const [dealers, total] = await Promise.all([
      prisma.dealer.findMany({
        where,
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
          _count: {
            select: {
              orders: true,
              quoteRequests: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.dealer.count({ where }),
    ])

    return NextResponse.json({
      dealers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Admin dealers GET error:", error)
    return NextResponse.json(
      { error: "Failed to fetch dealers" },
      { status: 500 }
    )
  }
}
