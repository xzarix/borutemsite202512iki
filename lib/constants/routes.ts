export const PUBLIC_ROUTES = {
  HOME: "/",
  PRODUCTS: "/products",
  CATEGORIES: "/categories",
  ABOUT: "/about",
  CONTACT: "/contact",
  LOGIN: "/login",
  REGISTER: "/register",
} as const

export const DASHBOARD_ROUTES = {
  DASHBOARD: "/dashboard",
  PRODUCTS: "/dashboard/products",
  ORDERS: "/dashboard/orders",
  CART: "/dashboard/cart",
} as const

export const API_ROUTES = {
  PRODUCTS: "/api/products",
  CATEGORIES: "/api/categories",
  ORDERS: "/api/orders",
  CART: "/api/cart",
  REGISTER: "/api/register",
} as const
