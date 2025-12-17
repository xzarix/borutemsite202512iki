import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Ürün adı gereklidir"),
  slug: z.string().min(1, "Slug gereklidir"),
  description: z.string().optional(),
  price: z.number().positive("Fiyat pozitif olmalıdır"),
  stock: z.number().int().min(0, "Stok 0 veya daha fazla olmalıdır"),
  categoryId: z.string().min(1, "Kategori gereklidir"),
  brand: z.string().optional(),
  model: z.string().optional(),
  material: z.string().optional(),
  diameter: z.string().optional(),
  pressure: z.string().optional(),
  flowRate: z.string().optional(),
})

export type ProductInput = z.infer<typeof productSchema>
