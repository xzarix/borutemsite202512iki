import { Dealer, Order } from "@prisma/client"

export type DealerProfile = Omit<Dealer, "password">

export type DealerWithOrders = Omit<Dealer, "password"> & {
  orders: Order[]
}

export interface DealerRegistrationData {
  email: string
  password: string
  companyName: string
  contactName: string
  phone: string
  address?: string
  city?: string
  taxNumber?: string
}

export interface DealerUpdateData {
  companyName?: string
  contactName?: string
  phone?: string
  address?: string
  city?: string
  taxNumber?: string
}
