import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/auth/prisma"
import { z } from "zod"

const updateItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().min(1),
})

export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const data = updateItemSchema.parse(body)

    await prisma.cartItem.update({
      where: { id: data.itemId },
      data: { quantity: data.quantity },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Cart item PUT error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 })
  }
}
