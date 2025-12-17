import { Cart, CartItem, Product } from "@prisma/client"

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product
  })[]
}

export type CartItemWithProduct = CartItem & {
  product: Product
}

export interface AddToCartData {
  productId: string
  quantity: number
}

export interface UpdateCartItemData {
  itemId: string
  quantity: number
}

export interface CartSummary {
  itemsCount: number
  totalAmount: number
  items: CartItemWithProduct[]
}
