import { z } from "zod"

export const quoteRequestSchema = z.object({
  shippingAddress: z.string().min(10, "Teslimat adresi en az 10 karakter olmalıdır"),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1, "Miktar en az 1 olmalıdır"),
      requestedPrice: z.number().optional(),
    })
  ).min(1, "En az bir ürün olmalıdır"),
})

export type QuoteRequestFormData = z.infer<typeof quoteRequestSchema>

export const quoteRequestItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().min(1, "Miktar en az 1 olmalıdır"),
  requestedPrice: z.number().optional(),
  quotedPrice: z.number().optional(),
  notes: z.string().optional(),
})

export type QuoteRequestItemData = z.infer<typeof quoteRequestItemSchema>
