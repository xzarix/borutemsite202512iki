import { z } from "zod"

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Ürün ID gereklidir"),
  quantity: z.number().int().positive("Miktar 1 veya daha fazla olmalıdır"),
})

export const updateCartItemSchema = z.object({
  itemId: z.string().min(1, "Item ID gereklidir"),
  quantity: z.number().int().positive("Miktar 1 veya daha fazla olmalıdır"),
})

export type AddToCartInput = z.infer<typeof addToCartSchema>
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>
