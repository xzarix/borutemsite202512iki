/**
 * Turkish Tax (KDV) and Pricing Utilities
 * for B2B Agricultural Irrigation E-Commerce
 */

// Turkish VAT rates
export const KDV_RATES = {
  STANDARD: 0.20, // 20% - Standard rate
  REDUCED: 0.10,  // 10% - Reduced rate (some agricultural products)
  SUPER_REDUCED: 0.01, // 1% - Super reduced rate (basic foods, books)
  ZERO: 0.00,     // 0% - Exempt products
} as const

export type KDVRate = typeof KDV_RATES[keyof typeof KDV_RATES]

/**
 * Calculate KDV (VAT) amount from base price
 */
export function calculateKDV(basePrice: number, rate: KDVRate = KDV_RATES.STANDARD): number {
  return basePrice * rate
}

/**
 * Calculate total price including KDV
 */
export function calculatePriceWithKDV(basePrice: number, rate: KDVRate = KDV_RATES.STANDARD): number {
  return basePrice + calculateKDV(basePrice, rate)
}

/**
 * Calculate base price from total price (including KDV)
 */
export function calculateBasePriceFromTotal(totalPrice: number, rate: KDVRate = KDV_RATES.STANDARD): number {
  return totalPrice / (1 + rate)
}

/**
 * Extract KDV amount from total price
 */
export function extractKDVFromTotal(totalPrice: number, rate: KDVRate = KDV_RATES.STANDARD): number {
  const basePrice = calculateBasePriceFromTotal(totalPrice, rate)
  return totalPrice - basePrice
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(price: number, discountPercent: number): number {
  return (price * discountPercent) / 100
}

/**
 * Apply discount to price
 */
export function applyDiscount(price: number, discountPercent: number): number {
  return price - calculateDiscount(price, discountPercent)
}

/**
 * Calculate dealer-specific price based on tier
 */
export function calculateDealerPrice(
  basePrice: number,
  priceTier: "STANDARD" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
): number {
  const discounts = {
    STANDARD: 0,    // No discount
    BRONZE: 5,      // 5% discount
    SILVER: 10,     // 10% discount
    GOLD: 15,       // 15% discount
    PLATINUM: 20,   // 20% discount
  }

  const discount = discounts[priceTier] || 0
  return applyDiscount(basePrice, discount)
}

/**
 * Calculate volume discount
 */
export function calculateVolumeDiscount(quantity: number): number {
  if (quantity >= 1000) return 15      // 15% for 1000+
  if (quantity >= 500) return 10       // 10% for 500-999
  if (quantity >= 100) return 5        // 5% for 100-499
  if (quantity >= 50) return 2         // 2% for 50-99
  return 0                             // No discount for < 50
}

/**
 * Calculate line item total with all discounts and tax
 */
export interface PriceCalculationParams {
  basePrice: number
  quantity: number
  priceTier?: "STANDARD" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  manualDiscountPercent?: number
  kdvRate?: KDVRate
  includeKDV?: boolean
}

export interface PriceCalculationResult {
  basePrice: number
  quantity: number
  subtotal: number
  dealerDiscount: number
  volumeDiscount: number
  manualDiscount: number
  totalDiscount: number
  discountedSubtotal: number
  kdvAmount: number
  total: number
  unitPriceAfterDiscounts: number
}

export function calculateLineItemPrice(params: PriceCalculationParams): PriceCalculationResult {
  const {
    basePrice,
    quantity,
    priceTier = "STANDARD",
    manualDiscountPercent = 0,
    kdvRate = KDV_RATES.STANDARD,
    includeKDV = true,
  } = params

  // Calculate subtotal
  const subtotal = basePrice * quantity

  // Calculate dealer tier discount
  const dealerDiscountPercent = {
    STANDARD: 0,
    BRONZE: 5,
    SILVER: 10,
    GOLD: 15,
    PLATINUM: 20,
  }[priceTier]
  const dealerDiscount = calculateDiscount(subtotal, dealerDiscountPercent)

  // Calculate volume discount (applied to already discounted price)
  const afterDealerDiscount = subtotal - dealerDiscount
  const volumeDiscountPercent = calculateVolumeDiscount(quantity)
  const volumeDiscount = calculateDiscount(afterDealerDiscount, volumeDiscountPercent)

  // Calculate manual discount (applied last)
  const afterVolumeDiscount = afterDealerDiscount - volumeDiscount
  const manualDiscount = calculateDiscount(afterVolumeDiscount, manualDiscountPercent)

  // Total discounts
  const totalDiscount = dealerDiscount + volumeDiscount + manualDiscount
  const discountedSubtotal = subtotal - totalDiscount

  // Calculate KDV
  const kdvAmount = includeKDV ? calculateKDV(discountedSubtotal, kdvRate) : 0

  // Total
  const total = discountedSubtotal + kdvAmount

  // Unit price after all discounts (excluding KDV)
  const unitPriceAfterDiscounts = discountedSubtotal / quantity

  return {
    basePrice,
    quantity,
    subtotal,
    dealerDiscount,
    volumeDiscount,
    manualDiscount,
    totalDiscount,
    discountedSubtotal,
    kdvAmount,
    total,
    unitPriceAfterDiscounts,
  }
}

/**
 * Calculate order summary with multiple line items
 */
export interface OrderSummaryParams {
  items: Array<{
    basePrice: number
    quantity: number
  }>
  priceTier?: "STANDARD" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  shippingCost?: number
  kdvRate?: KDVRate
}

export interface OrderSummaryResult {
  itemsSubtotal: number
  itemsDiscount: number
  itemsTotal: number
  shippingCost: number
  subtotal: number
  kdvAmount: number
  grandTotal: number
}

export function calculateOrderSummary(params: OrderSummaryParams): OrderSummaryResult {
  const {
    items,
    priceTier = "STANDARD",
    shippingCost = 0,
    kdvRate = KDV_RATES.STANDARD,
  } = params

  // Calculate each item
  const itemCalculations = items.map((item) =>
    calculateLineItemPrice({
      basePrice: item.basePrice,
      quantity: item.quantity,
      priceTier,
      kdvRate,
      includeKDV: false, // We'll calculate KDV on the total
    })
  )

  // Sum up items
  const itemsSubtotal = itemCalculations.reduce((sum, calc) => sum + calc.subtotal, 0)
  const itemsDiscount = itemCalculations.reduce((sum, calc) => sum + calc.totalDiscount, 0)
  const itemsTotal = itemCalculations.reduce((sum, calc) => sum + calc.discountedSubtotal, 0)

  // Add shipping
  const subtotal = itemsTotal + shippingCost

  // Calculate KDV on subtotal (including shipping)
  const kdvAmount = calculateKDV(subtotal, kdvRate)

  // Grand total
  const grandTotal = subtotal + kdvAmount

  return {
    itemsSubtotal,
    itemsDiscount,
    itemsTotal,
    shippingCost,
    subtotal,
    kdvAmount,
    grandTotal,
  }
}

/**
 * Format price for Turkish locale
 */
export function formatPrice(amount: number, includeSymbol: boolean = true): string {
  const formatted = new Intl.NumberFormat("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  return includeSymbol ? `${formatted} TL` : formatted
}

/**
 * Format currency with symbol
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount)
}
