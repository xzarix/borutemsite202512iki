import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/auth/prisma"

// GET /api/current-account - Get dealer's current account
export async function GET(request: NextRequest) {
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

    // Get or create current account
    let currentAccount = await prisma.currentAccount.findUnique({
      where: { dealerId: dealer.id },
      include: {
        transactions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
      },
    })

    if (!currentAccount) {
      currentAccount = await prisma.currentAccount.create({
        data: {
          dealerId: dealer.id,
          balance: 0,
          creditLimit: dealer.creditLimit,
        },
        include: {
          transactions: true,
        },
      })
    }

    return NextResponse.json(currentAccount)
  } catch (error) {
    console.error("Current account fetch error:", error)
    return NextResponse.json(
      { error: "Failed to fetch current account" },
      { status: 500 }
    )
  }
}

// POST /api/current-account/transactions - Add transaction (internal use)
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { type, amount, description, referenceType, referenceId } = body

    if (!type || !amount || !description) {
      return NextResponse.json(
        { error: "Type, amount, and description are required" },
        { status: 400 }
      )
    }

    const dealer = await prisma.dealer.findUnique({
      where: { email: session.user.email },
    })

    if (!dealer) {
      return NextResponse.json({ error: "Dealer not found" }, { status: 404 })
    }

    // Get or create current account
    let currentAccount = await prisma.currentAccount.findUnique({
      where: { dealerId: dealer.id },
    })

    if (!currentAccount) {
      currentAccount = await prisma.currentAccount.create({
        data: {
          dealerId: dealer.id,
          balance: 0,
          creditLimit: dealer.creditLimit,
        },
      })
    }

    // Calculate new balance
    const isDebit = type === "DEBIT" || type === "ORDER"
    const newBalance = isDebit
      ? currentAccount.balance + amount
      : currentAccount.balance - amount

    // Create transaction and update balance in a transaction
    const [transaction, _] = await prisma.$transaction([
      prisma.currentAccountTransaction.create({
        data: {
          accountId: currentAccount.id,
          type,
          amount,
          balance: newBalance,
          description,
          referenceType,
          referenceId,
        },
      }),
      prisma.currentAccount.update({
        where: { id: currentAccount.id },
        data: { balance: newBalance },
      }),
    ])

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Transaction creation error:", error)
    return NextResponse.json(
      { error: "Failed to create transaction" },
      { status: 500 }
    )
  }
}
