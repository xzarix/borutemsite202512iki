import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(3, "Ürün adı en az 3 karakter olmalıdır"),
  slug: z.string().min(3, "Slug en az 3 karakter olmalıdır"),
  description: z.string().optional(),
  price: z.number().min(0, "Fiyat 0'dan büyük olmalıdır"),
  stock: z.number().int().min(0, "Stok 0 veya daha fazla olmalıdır"),
  categoryId: z.string().min(1, "Kategori seçilmelidir"),
  brand: z.string().optional(),
  model: z.string().optional(),
  material: z.string().optional(),
  diameter: z.string().optional(),
  pressure: z.string().optional(),
  flowRate: z.string().optional(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

export type ProductFormData = z.infer<typeof productSchema>

export const productFilterSchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  brand: z.string().optional(),
  inStock: z.boolean().optional(),
  sortBy: z.enum(["name", "price-asc", "price-desc", "newest"]).optional(),
})

export type ProductFilterData = z.infer<typeof productFilterSchema>
