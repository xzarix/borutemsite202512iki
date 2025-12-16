import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/auth/prisma"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = loginSchema.parse(credentials)

          const dealer = await prisma.dealer.findUnique({
            where: { email },
          })

          if (!dealer) {
            throw new Error("Geçersiz email veya şifre")
          }

          if (!dealer.isActive) {
            throw new Error("Hesabınız aktif değil")
          }

          if (!dealer.isApproved) {
            throw new Error("Hesabınız henüz onaylanmamış")
          }

          const isPasswordValid = await compare(password, dealer.password)

          if (!isPasswordValid) {
            throw new Error("Geçersiz email veya şifre")
          }

          return {
            id: dealer.id,
            email: dealer.email,
            name: dealer.companyName,
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
})
