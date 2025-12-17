import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"

/**
 * Advanced Product Search API
 * Supports full-text search, filtering, and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams

    // Search parameters
    const search = searchParams.get("search") || ""
    const categoryId = searchParams.get("categoryId")
    const brand = searchParams.get("brand")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const inStock = searchParams.get("inStock") === "true"
    const isFeatured = searchParams.get("isFeatured") === "true"
    const sortBy = searchParams.get("sortBy") || "newest"

    // Pagination
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "20")
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      isActive: true,
    }

    // Text search (name, description, brand, model)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
      ]
    }

    // Category filter
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Brand filter
    if (brand) {
      where.brand = brand
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = parseFloat(minPrice)
      if (maxPrice) where.price.lte = parseFloat(maxPrice)
    }

    // Stock filter
    if (inStock) {
      where.stock = { gt: 0 }
    }

    // Featured filter
    if (isFeatured) {
      where.isFeatured = true
    }

    // Sorting
    let orderBy: any = { createdAt: "desc" } // default: newest

    switch (sortBy) {
      case "name":
        orderBy = { name: "asc" }
        break
      case "price-asc":
        orderBy = { price: "asc" }
        break
      case "price-desc":
        orderBy = { price: "desc" }
        break
      case "stock":
        orderBy = { stock: "desc" }
        break
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
        break
    }

    // Execute query with pagination
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ])

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
      filters: {
        search,
        categoryId,
        brand,
        minPrice,
        maxPrice,
        inStock,
        isFeatured,
        sortBy,
      },
    })
  } catch (error) {
    console.error("Product search error:", error)
    return NextResponse.json(
      { error: "Failed to search products" },
      { status: 500 }
    )
  }
}

/**
 * Get filter options (brands, price ranges, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { categoryId } = body

    // Build where clause for active products
    const where: any = { isActive: true }
    if (categoryId) {
      where.categoryId = categoryId
    }

    // Get unique brands
    const brands = await prisma.product.findMany({
      where,
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    })

    // Get price range
    const priceRange = await prisma.product.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    })

    // Get product count by category
    const categoryCounts = await prisma.product.groupBy({
      by: ["categoryId"],
      where: { isActive: true },
      _count: true,
    })

    return NextResponse.json({
      brands: brands.map((b) => b.brand).filter(Boolean),
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 0,
      },
      categoryCounts,
    })
  } catch (error) {
    console.error("Filter options error:", error)
    return NextResponse.json(
      { error: "Failed to get filter options" },
      { status: 500 }
    )
  }
}
