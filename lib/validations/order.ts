import { z } from "zod"

export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, "En az bir ürün gereklidir"),
  shippingAddress: z.string().min(10, "Teslimat adresi en az 10 karakter olmalıdır"),
  notes: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof createOrderSchema>
