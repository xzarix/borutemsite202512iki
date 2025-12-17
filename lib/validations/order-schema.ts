import { z } from "zod"

export const orderSchema = z.object({
  shippingAddress: z.string().min(10, "Teslimat adresi en az 10 karakter olmalıdır"),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
      price: z.number().min(0),
    })
  ).min(1, "En az bir ürün olmalıdır"),
})

export type OrderFormData = z.infer<typeof orderSchema>

export const orderFilterSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"]).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  search: z.string().optional(),
})

export type OrderFilterData = z.infer<typeof orderFilterSchema>
