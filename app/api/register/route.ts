import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/auth/prisma"
import { z } from "zod"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  phone: z.string().min(1),
  address: z.string().optional(),
  city: z.string().optional(),
  taxNumber: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if email already exists
    const existingDealer = await prisma.dealer.findUnique({
      where: { email: data.email },
    })

    if (existingDealer) {
      return NextResponse.json(
        { error: "Bu email adresi zaten kullanılıyor" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(data.password, 12)

    // Create dealer
    const dealer = await prisma.dealer.create({
      data: {
        email: data.email,
        password: hashedPassword,
        companyName: data.companyName,
        contactName: data.contactName,
        phone: data.phone,
        address: data.address || null,
        city: data.city || null,
        taxNumber: data.taxNumber || null,
        isApproved: false, // Will be approved by admin
        isActive: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Başvurunuz alınmıştır. Onay sürecinden sonra bilgilendirileceksiniz.",
    })
  } catch (error: any) {
    console.error("Registration error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Geçersiz form verileri" },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Kayıt sırasında bir hata oluştu" },
      { status: 500 }
    )
  }
}
