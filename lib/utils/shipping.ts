/**
 * Shipping Cost Calculation Utilities
 * for Turkish Agricultural Irrigation Equipment B2B Platform
 */

// Turkish city zones for shipping calculation
export const SHIPPING_ZONES = {
  ZONE_1: [
    "İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Adana", "Konya",
    "Gaziantep", "Kocaeli", "Mersin"
  ],
  ZONE_2: [
    "Kayseri", "Eskişehir", "Diyarbakır", "Samsun", "Denizli", "Şanlıurfa",
    "Adapazarı", "Malatya", "Kahramanmaraş", "Erzurum", "Van"
  ],
  ZONE_3: [] // All other cities
} as const

/**
 * Determine shipping zone from city name
 */
export function getShippingZone(city: string): 1 | 2 | 3 {
  const normalizedCity = city.trim()

  if (SHIPPING_ZONES.ZONE_1.includes(normalizedCity)) return 1
  if (SHIPPING_ZONES.ZONE_2.includes(normalizedCity)) return 2
  return 3
}

/**
 * Base shipping rates per kg by zone (in TRY)
 */
const SHIPPING_RATES_PER_KG = {
  1: 8,   // Zone 1 cities - 8 TL/kg
  2: 12,  // Zone 2 cities - 12 TL/kg
  3: 15,  // Zone 3 cities - 15 TL/kg
} as const

/**
 * Minimum shipping charge
 */
const MINIMUM_SHIPPING_CHARGE = 50 // TRY

/**
 * Free shipping threshold by dealer tier
 */
const FREE_SHIPPING_THRESHOLDS = {
  STANDARD: 5000,   // 5,000 TL
  BRONZE: 4000,     // 4,000 TL
  SILVER: 3000,     // 3,000 TL
  GOLD: 2000,       // 2,000 TL
  PLATINUM: 1000,   // 1,000 TL (or always free)
} as const

/**
 * Calculate shipping cost based on weight and destination
 */
export interface ShippingCalculationParams {
  totalWeight: number // in kg
  city: string
  orderTotal: number
  priceTier?: "STANDARD" | "BRONZE" | "SILVER" | "GOLD" | "PLATINUM"
  isExpress?: boolean
}

export interface ShippingCalculationResult {
  zone: 1 | 2 | 3
  baseRate: number
  weightCharge: number
  expressCharge: number
  subtotal: number
  discount: number
  total: number
  isFree: boolean
  estimatedDays: number
}

export function calculateShippingCost(params: ShippingCalculationParams): ShippingCalculationResult {
  const {
    totalWeight,
    city,
    orderTotal,
    priceTier = "STANDARD",
    isExpress = false,
  } = params

  // Determine zone
  const zone = getShippingZone(city)

  // Calculate base weight charge
  const baseRate = SHIPPING_RATES_PER_KG[zone]
  const weightCharge = Math.max(totalWeight * baseRate, MINIMUM_SHIPPING_CHARGE)

  // Express shipping adds 50% to the cost
  const expressCharge = isExpress ? weightCharge * 0.5 : 0

  // Subtotal before discounts
  const subtotal = weightCharge + expressCharge

  // Check if qualifies for free shipping
  const freeShippingThreshold = FREE_SHIPPING_THRESHOLDS[priceTier]
  const qualifiesForFree = orderTotal >= freeShippingThreshold

  // Special case: PLATINUM tier gets free shipping regardless
  const isFree = priceTier === "PLATINUM" || qualifiesForFree

  // Calculate discount
  const discount = isFree ? subtotal : 0

  // Final total
  const total = isFree ? 0 : subtotal

  // Estimated delivery days
  const estimatedDays = isExpress
    ? zone === 1 ? 1 : zone === 2 ? 2 : 3
    : zone === 1 ? 2 : zone === 2 ? 3 : 5

  return {
    zone,
    baseRate,
    weightCharge,
    expressCharge,
    subtotal,
    discount,
    total,
    isFree,
    estimatedDays,
  }
}

/**
 * Estimate product weight from category and quantity
 * (This is a simplified estimation - in real system, each product would have weight)
 */
const CATEGORY_AVERAGE_WEIGHTS = {
  "damla-sulama": 0.5,           // 0.5 kg per unit
  "yagmurlama-sulama": 1.5,      // 1.5 kg per unit
  "borular-ve-baglanti": 2.5,    // 2.5 kg per meter/unit
  "pompalar": 15,                // 15 kg per unit
  "filtreler": 8,                // 8 kg per unit
  "gubreleme-sistemleri": 5,     // 5 kg per unit
  "vana-ve-kontrol": 2,          // 2 kg per unit
  default: 1,                    // 1 kg default
} as const

export function estimateProductWeight(categorySlug: string, quantity: number): number {
  const avgWeight = (CATEGORY_AVERAGE_WEIGHTS as any)[categorySlug] || CATEGORY_AVERAGE_WEIGHTS.default
  return avgWeight * quantity
}

/**
 * Calculate total order weight
 */
export interface OrderItem {
  categorySlug: string
  quantity: number
  weight?: number // Optional custom weight
}

export function calculateTotalOrderWeight(items: OrderItem[]): number {
  return items.reduce((total, item) => {
    const weight = item.weight ?? estimateProductWeight(item.categorySlug, item.quantity)
    return total + weight
  }, 0)
}

/**
 * Get shipping carriers available for zone
 */
export interface ShippingCarrier {
  code: string
  name: string
  trackingUrl: string
  supportedZones: (1 | 2 | 3)[]
  isExpress: boolean
}

export const SHIPPING_CARRIERS: ShippingCarrier[] = [
  {
    code: "mng",
    name: "MNG Kargo",
    trackingUrl: "https://www.mngkargo.com.tr/takip/",
    supportedZones: [1, 2, 3],
    isExpress: false,
  },
  {
    code: "yurtici",
    name: "Yurtiçi Kargo",
    trackingUrl: "https://www.yurticikargo.com/tr/kargo-takip/",
    supportedZones: [1, 2, 3],
    isExpress: false,
  },
  {
    code: "aras",
    name: "Aras Kargo",
    trackingUrl: "https://www.araskargo.com.tr/kargo-takip",
    supportedZones: [1, 2, 3],
    isExpress: false,
  },
  {
    code: "ups-express",
    name: "UPS Express",
    trackingUrl: "https://www.ups.com/track?loc=tr_TR",
    supportedZones: [1, 2],
    isExpress: true,
  },
]

export function getAvailableCarriers(zone: 1 | 2 | 3, isExpress: boolean = false): ShippingCarrier[] {
  return SHIPPING_CARRIERS.filter(
    (carrier) => carrier.supportedZones.includes(zone) && (!isExpress || carrier.isExpress)
  )
}
