import { Dealer, Product, Category, Order, OrderItem, Cart, CartItem, OrderStatus } from "@prisma/client"

export type DealerWithOrders = Dealer & {
  orders: Order[]
}

export type ProductWithCategory = Product & {
  category: Category
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
  })[]
}

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product
  })[]
}

export type { Dealer, Product, Category, Order, OrderItem, Cart, CartItem, OrderStatus }
