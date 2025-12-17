import { Order, OrderItem, Product, OrderStatus } from "@prisma/client"

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
  })[]
}

export type OrderListItem = Pick<
  Order,
  "id" | "orderNumber" | "status" | "totalAmount" | "createdAt"
> & {
  itemsCount: number
}

export interface CreateOrderData {
  items: {
    productId: string
    quantity: number
  }[]
  shippingAddress: string
  notes?: string
}

export interface OrderFilters {
  status?: OrderStatus
  startDate?: Date
  endDate?: Date
}

export interface OrderListResponse {
  orders: OrderListItem[]
  total: number
  page: number
  limit: number
}

export { OrderStatus }
