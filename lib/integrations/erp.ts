/**
 * ERP Integration Infrastructure
 *
 * Türkiye'de yaygın kullanılan ERP sistemleri ile entegrasyon altyapısı:
 * - Logo Tiger
 * - Netsis
 * - Paraşüt
 * - SAP Business One
 * - Microsoft Dynamics
 */

/**
 * ERP sistem tipleri
 */
export enum ERPSystem {
  LOGO_TIGER = "LOGO_TIGER",
  NETSIS = "NETSIS",
  PARASUT = "PARASUT",
  SAP = "SAP",
  DYNAMICS = "DYNAMICS",
}

/**
 * Senkronizasyon yönü
 */
export enum SyncDirection {
  TO_ERP = "TO_ERP", // E-ticaret -> ERP
  FROM_ERP = "FROM_ERP", // ERP -> E-ticaret
  BIDIRECTIONAL = "BIDIRECTIONAL", // İki yönlü
}

/**
 * Senkronizasyon durumu
 */
export enum SyncStatus {
  PENDING = "PENDING",
  IN_PROGRESS = "IN_PROGRESS",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  PARTIAL = "PARTIAL",
}

/**
 * ERP varlık tipleri
 */
export enum ERPEntityType {
  CUSTOMER = "CUSTOMER", // Müşteri/Bayi
  PRODUCT = "PRODUCT", // Ürün
  ORDER = "ORDER", // Sipariş
  INVOICE = "INVOICE", // Fatura
  PAYMENT = "PAYMENT", // Ödeme
  STOCK = "STOCK", // Stok
}

/**
 * ERP müşteri verisi
 */
export interface ERPCustomer {
  erpId?: string // ERP sistemindeki ID
  code: string // Müşteri kodu
  title: string // Ünvan
  taxNumber: string // Vergi numarası
  taxOffice: string // Vergi dairesi
  address: string
  city: string
  country: string
  phone?: string
  email?: string
  creditLimit?: number
  balance?: number
  priceTier?: string
  isActive: boolean
}

/**
 * ERP ürün verisi
 */
export interface ERPProduct {
  erpId?: string
  code: string // Ürün kodu
  name: string
  barcode?: string
  categoryCode?: string
  unitPrice: number
  currency: string
  unit: string // Birim (Adet, Kg, Mt)
  stock: number
  minStock?: number
  kdvRate: number
  isActive: boolean
  lastUpdated?: Date
}

/**
 * ERP sipariş verisi
 */
export interface ERPOrder {
  erpId?: string
  orderNumber: string
  orderDate: Date
  customerCode: string
  totalAmount: number
  currency: string
  status: string
  paymentMethod?: string
  shippingAddress: string
  notes?: string
  lines: ERPOrderLine[]
}

/**
 * ERP sipariş satırı
 */
export interface ERPOrderLine {
  lineNumber: number
  productCode: string
  quantity: number
  unitPrice: number
  discountPercent?: number
  kdvRate: number
  totalAmount: number
}

/**
 * Senkronizasyon kaydı
 */
export interface SyncLog {
  id: string
  entityType: ERPEntityType
  entityId: string
  erpSystem: ERPSystem
  direction: SyncDirection
  status: SyncStatus
  startTime: Date
  endTime?: Date
  recordsProcessed: number
  recordsSuccess: number
  recordsFailed: number
  errorMessage?: string
  details?: any
}

/**
 * ERP servis interface
 */
export interface ERPService {
  /**
   * Müşteri senkronizasyonu
   */
  syncCustomer(
    customer: ERPCustomer,
    direction: SyncDirection
  ): Promise<{ success: boolean; erpId?: string; error?: string }>

  /**
   * Ürün senkronizasyonu
   */
  syncProduct(
    product: ERPProduct,
    direction: SyncDirection
  ): Promise<{ success: boolean; erpId?: string; error?: string }>

  /**
   * Sipariş senkronizasyonu
   */
  syncOrder(
    order: ERPOrder,
    direction: SyncDirection
  ): Promise<{ success: boolean; erpId?: string; error?: string }>

  /**
   * Stok sorgulama (ERP'den)
   */
  getStock(productCode: string): Promise<{ stock: number; lastUpdated: Date }>

  /**
   * Müşteri cari hesap bilgisi (ERP'den)
   */
  getCustomerBalance(customerCode: string): Promise<{
    balance: number
    creditLimit: number
    availableCredit: number
  }>

  /**
   * Toplu stok güncelleme (ERP'den)
   */
  syncAllStock(): Promise<SyncLog>

  /**
   * Bağlantı testi
   */
  testConnection(): Promise<{ success: boolean; message: string }>
}

/**
 * Mock ERP servisi (development için)
 */
export class MockERPService implements ERPService {
  private mockDelay = 1000 // 1 saniye gecikme simülasyonu

  private delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, this.mockDelay))
  }

  async syncCustomer(
    customer: ERPCustomer,
    direction: SyncDirection
  ): Promise<{ success: boolean; erpId?: string; error?: string }> {
    await this.delay()
    const erpId = `ERP-CUST-${Date.now()}`
    console.log(`[Mock ERP] Customer synced: ${customer.code} -> ${erpId}`)
    return { success: true, erpId }
  }

  async syncProduct(
    product: ERPProduct,
    direction: SyncDirection
  ): Promise<{ success: boolean; erpId?: string; error?: string }> {
    await this.delay()
    const erpId = `ERP-PROD-${Date.now()}`
    console.log(`[Mock ERP] Product synced: ${product.code} -> ${erpId}`)
    return { success: true, erpId }
  }

  async syncOrder(
    order: ERPOrder,
    direction: SyncDirection
  ): Promise<{ success: boolean; erpId?: string; error?: string }> {
    await this.delay()
    const erpId = `ERP-ORD-${Date.now()}`
    console.log(`[Mock ERP] Order synced: ${order.orderNumber} -> ${erpId}`)
    return { success: true, erpId }
  }

  async getStock(productCode: string): Promise<{ stock: number; lastUpdated: Date }> {
    await this.delay()
    const stock = Math.floor(Math.random() * 1000)
    console.log(`[Mock ERP] Stock query: ${productCode} = ${stock}`)
    return { stock, lastUpdated: new Date() }
  }

  async getCustomerBalance(customerCode: string): Promise<{
    balance: number
    creditLimit: number
    availableCredit: number
  }> {
    await this.delay()
    const balance = Math.random() * 50000
    const creditLimit = 100000
    const availableCredit = creditLimit - balance
    console.log(
      `[Mock ERP] Customer balance: ${customerCode} = ${balance.toFixed(2)} TL`
    )
    return { balance, creditLimit, availableCredit }
  }

  async syncAllStock(): Promise<SyncLog> {
    await this.delay()
    const log: SyncLog = {
      id: `SYNC-${Date.now()}`,
      entityType: ERPEntityType.STOCK,
      entityId: "ALL",
      erpSystem: ERPSystem.LOGO_TIGER,
      direction: SyncDirection.FROM_ERP,
      status: SyncStatus.SUCCESS,
      startTime: new Date(),
      endTime: new Date(),
      recordsProcessed: 150,
      recordsSuccess: 148,
      recordsFailed: 2,
    }
    console.log(`[Mock ERP] Stock sync completed: ${log.recordsSuccess} products`)
    return log
  }

  async testConnection(): Promise<{ success: boolean; message: string }> {
    await this.delay()
    return {
      success: true,
      message: "Mock ERP connection successful",
    }
  }
}

/**
 * ERP fabrika - sistem tipine göre doğru servisi döner
 */
export class ERPFactory {
  static create(system: ERPSystem, config: any): ERPService {
    switch (system) {
      case ERPSystem.LOGO_TIGER:
        // return new LogoTigerERPService(config)
        return new MockERPService()

      case ERPSystem.NETSIS:
        // return new NetsisERPService(config)
        return new MockERPService()

      case ERPSystem.PARASUT:
        // return new ParasutERPService(config)
        return new MockERPService()

      default:
        return new MockERPService()
    }
  }
}

/**
 * Otomatik senkronizasyon görevleri
 */
export class ERPSyncScheduler {
  constructor(private erpService: ERPService) {}

  /**
   * Günlük stok senkronizasyonu (cron job)
   */
  async scheduleDailyStockSync(): Promise<void> {
    console.log("[ERP Sync] Starting daily stock sync...")
    const log = await this.erpService.syncAllStock()
    console.log(`[ERP Sync] Completed: ${log.status}`)
  }

  /**
   * Gerçek zamanlı sipariş senkronizasyonu
   */
  async syncOrderRealtime(orderId: string): Promise<void> {
    // Gerçek implementasyonda:
    // 1. Siparişi database'den çek
    // 2. ERP formatına dönüştür
    // 3. ERP'ye gönder
    // 4. Sonucu kaydet
    console.log(`[ERP Sync] Real-time order sync: ${orderId}`)
  }
}
