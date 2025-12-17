import { Product, Category } from "@prisma/client"

export type ProductWithCategory = Product & {
  category: Category
}

export type ProductListItem = Pick<
  Product,
  "id" | "name" | "slug" | "price" | "stock" | "images" | "isFeatured"
> & {
  category: Pick<Category, "id" | "name" | "slug">
}

export type ProductDetail = Product & {
  category: Category
}

export interface ProductFilters {
  categoryId?: string
  search?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  isFeatured?: boolean
}

export interface ProductListResponse {
  products: ProductListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}
