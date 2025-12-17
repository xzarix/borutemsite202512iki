import {
  calculateKDV,
  calculatePriceWithKDV,
  calculateDealerPrice,
  calculateVolumeDiscount,
  calculateLineItemPrice,
  KDV_RATES,
} from "@/lib/utils/tax"

describe("Tax Utilities", () => {
  describe("calculateKDV", () => {
    it("should calculate 20% KDV correctly", () => {
      const basePrice = 100
      const kdv = calculateKDV(basePrice, KDV_RATES.STANDARD)
      expect(kdv).toBe(20)
    })

    it("should calculate 10% KDV correctly", () => {
      const basePrice = 100
      const kdv = calculateKDV(basePrice, KDV_RATES.REDUCED)
      expect(kdv).toBe(10)
    })

    it("should handle zero rate", () => {
      const basePrice = 100
      const kdv = calculateKDV(basePrice, KDV_RATES.ZERO)
      expect(kdv).toBe(0)
    })
  })

  describe("calculatePriceWithKDV", () => {
    it("should calculate total price with KDV", () => {
      const basePrice = 100
      const total = calculatePriceWithKDV(basePrice, KDV_RATES.STANDARD)
      expect(total).toBe(120)
    })
  })

  describe("calculateDealerPrice", () => {
    it("should apply correct discount for GOLD tier", () => {
      const basePrice = 100
      const dealerPrice = calculateDealerPrice(basePrice, "GOLD")
      expect(dealerPrice).toBe(85) // 15% discount
    })

    it("should apply no discount for STANDARD tier", () => {
      const basePrice = 100
      const dealerPrice = calculateDealerPrice(basePrice, "STANDARD")
      expect(dealerPrice).toBe(100)
    })

    it("should apply 20% discount for PLATINUM tier", () => {
      const basePrice = 100
      const dealerPrice = calculateDealerPrice(basePrice, "PLATINUM")
      expect(dealerPrice).toBe(80)
    })
  })

  describe("calculateVolumeDiscount", () => {
    it("should return 0% for quantities < 50", () => {
      expect(calculateVolumeDiscount(10)).toBe(0)
      expect(calculateVolumeDiscount(49)).toBe(0)
    })

    it("should return 2% for quantities 50-99", () => {
      expect(calculateVolumeDiscount(50)).toBe(2)
      expect(calculateVolumeDiscount(99)).toBe(2)
    })

    it("should return 5% for quantities 100-499", () => {
      expect(calculateVolumeDiscount(100)).toBe(5)
      expect(calculateVolumeDiscount(499)).toBe(5)
    })

    it("should return 10% for quantities 500-999", () => {
      expect(calculateVolumeDiscount(500)).toBe(10)
      expect(calculateVolumeDiscount(999)).toBe(10)
    })

    it("should return 15% for quantities >= 1000", () => {
      expect(calculateVolumeDiscount(1000)).toBe(15)
      expect(calculateVolumeDiscount(5000)).toBe(15)
    })
  })

  describe("calculateLineItemPrice", () => {
    it("should calculate line item with all discounts and KDV", () => {
      const result = calculateLineItemPrice({
        basePrice: 100,
        quantity: 100, // 5% volume discount
        priceTier: "GOLD", // 15% dealer discount
        kdvRate: KDV_RATES.STANDARD, // 20% KDV
      })

      // Subtotal: 100 * 100 = 10,000
      // Dealer discount (15%): 1,500
      // After dealer: 8,500
      // Volume discount (5%): 425
      // After volume: 8,075
      // KDV (20%): 1,615
      // Total: 9,690

      expect(result.subtotal).toBe(10000)
      expect(result.dealerDiscount).toBe(1500)
      expect(result.volumeDiscount).toBe(425)
      expect(result.discountedSubtotal).toBe(8075)
      expect(result.kdvAmount).toBe(1615)
      expect(result.total).toBe(9690)
    })

    it("should work without KDV", () => {
      const result = calculateLineItemPrice({
        basePrice: 100,
        quantity: 10,
        includeKDV: false,
      })

      expect(result.kdvAmount).toBe(0)
      expect(result.total).toBe(result.discountedSubtotal)
    })
  })
})
