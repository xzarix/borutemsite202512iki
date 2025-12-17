/**
 * e-Fatura / e-Arşiv Integration Infrastructure
 *
 * Bu dosya Türkiye'deki e-Fatura sistemi ile entegrasyon için altyapıyı içerir.
 * Gerçek entegrasyon için GİB (Gelir İdaresi Başkanlığı) onaylı bir e-Fatura
 * entegratörü kullanılmalıdır (örn: Logo, Netsis, Paraşüt).
 */

/**
 * e-Fatura belge tipleri
 */
export enum EFaturaDocumentType {
  SATIS = "SATIS", // Satış Faturası
  IADE = "IADE", // İade Faturası
  TEVKIFAT = "TEVKIFAT", // Tevkifatlı Fatura
  ISTISNA = "ISTISNA", // İstisna Faturası
  OZEL_MATRAH = "OZEL_MATRAH", // Özel Matrah Faturası
}

/**
 * e-Fatura durumları
 */
export enum EFaturaStatus {
  DRAFT = "DRAFT", // Taslak
  PENDING = "PENDING", // GİB'e gönderildi, onay bekleniyor
  APPROVED = "APPROVED", // Onaylandı
  REJECTED = "REJECTED", // Reddedildi
  CANCELLED = "CANCELLED", // İptal edildi
}

/**
 * e-Fatura vergi türleri
 */
export enum TaxType {
  KDV = "KDV", // Katma Değer Vergisi
  OTV = "OTV", // Özel Tüketim Vergisi
  OIV = "OIV", // Özel İletişim Vergisi
}

/**
 * e-Fatura müşteri bilgileri
 */
export interface EFaturaCustomer {
  vkn?: string // Vergi Kimlik Numarası (tüzel kişi)
  tckn?: string // TC Kimlik Numarası (gerçek kişi)
  unvan: string // Ünvan/Ad Soyad
  adres: string // Adres
  vergiDairesi?: string // Vergi Dairesi
  il: string // İl
  ilce?: string // İlçe
  ulke: string // Ülke (default: TÜRKİYE)
  telefon?: string
  email?: string
}

/**
 * e-Fatura satır (kalem) bilgisi
 */
export interface EFaturaLine {
  siraNo: number
  malHizmet: string // Mal/Hizmet adı
  miktar: number
  birim: string // Birim (Adet, Kg, Mt, vb.)
  birimFiyat: number
  malHizmetTutari: number // Vergi hariç tutar
  kdvOrani: number // KDV oranı (18, 8, 1, 0)
  kdvTutari: number
  satirToplam: number // KDV dahil toplam
  aciklama?: string
}

/**
 * e-Fatura belgesi
 */
export interface EFaturaDocument {
  // Temel bilgiler
  faturaNo: string
  faturaTarihi: Date
  faturaSaati: string
  belgeNumarasi?: string // GİB tarafından verilen numara
  ettn?: string // Evrensel Tekil Tanımlama Numarası (UUID)

  // Belge türü ve senaryo
  belgeTuru: EFaturaDocumentType
  senaryo: "BASIC" | "COMMERCIAL" | "EXPORT"

  // Müşteri bilgileri
  musteri: EFaturaCustomer

  // Satırlar
  satirlar: EFaturaLine[]

  // Tutarlar
  vergilerHaricToplam: number
  vergilerDahilToplam: number
  odenecekTutar: number

  // Vergi detayları
  kdvMatrah: number
  toplamKdv: number

  // Ödeme bilgileri
  odemeSekli?: string // Nakit, Havale, Kredi Kartı, vb.
  odemeTarihi?: Date
  vadeTarihi?: Date

  // Notlar
  not?: string

  // Durum
  durum: EFaturaStatus
  olusturmaTarihi: Date
  gonderimTarihi?: Date
  onayTarihi?: Date
}

/**
 * e-Fatura oluşturma parametreleri
 */
export interface CreateEFaturaParams {
  orderId: string
  customerId: string
  lines: Array<{
    productName: string
    quantity: number
    unit: string
    unitPrice: number
    kdvRate: number
  }>
  paymentMethod?: string
  dueDate?: Date
  notes?: string
}

/**
 * e-Fatura servisi (soyut interface)
 * Gerçek implementasyon için entegratör API'sini kullanın
 */
export interface EFaturaService {
  /**
   * e-Fatura oluştur (taslak)
   */
  createDraft(params: CreateEFaturaParams): Promise<EFaturaDocument>

  /**
   * e-Fatura'yı GİB'e gönder
   */
  send(faturaNo: string): Promise<{ success: boolean; ettn?: string }>

  /**
   * e-Fatura durumunu sorgula
   */
  getStatus(ettn: string): Promise<EFaturaStatus>

  /**
   * e-Fatura PDF indir
   */
  downloadPDF(ettn: string): Promise<Buffer>

  /**
   * e-Fatura iptal et
   */
  cancel(ettn: string, reason: string): Promise<{ success: boolean }>
}

/**
 * Mock e-Fatura servisi (development için)
 */
export class MockEFaturaService implements EFaturaService {
  async createDraft(params: CreateEFaturaParams): Promise<EFaturaDocument> {
    const now = new Date()
    const faturaNo = `2024${String(Date.now()).slice(-8)}`

    const satirlar: EFaturaLine[] = params.lines.map((line, index) => {
      const malHizmetTutari = line.quantity * line.unitPrice
      const kdvTutari = (malHizmetTutari * line.kdvRate) / 100
      const satirToplam = malHizmetTutari + kdvTutari

      return {
        siraNo: index + 1,
        malHizmet: line.productName,
        miktar: line.quantity,
        birim: line.unit,
        birimFiyat: line.unitPrice,
        malHizmetTutari,
        kdvOrani: line.kdvRate,
        kdvTutari,
        satirToplam,
      }
    })

    const vergilerHaricToplam = satirlar.reduce(
      (sum, line) => sum + line.malHizmetTutari,
      0
    )
    const toplamKdv = satirlar.reduce((sum, line) => sum + line.kdvTutari, 0)
    const vergilerDahilToplam = vergilerHaricToplam + toplamKdv

    return {
      faturaNo,
      faturaTarihi: now,
      faturaSaati: now.toTimeString().slice(0, 8),
      belgeTuru: EFaturaDocumentType.SATIS,
      senaryo: "BASIC",
      musteri: {
        unvan: "Mock Customer",
        adres: "Mock Address",
        il: "İstanbul",
        ulke: "TÜRKİYE",
      },
      satirlar,
      vergilerHaricToplam,
      vergilerDahilToplam,
      odenecekTutar: vergilerDahilToplam,
      kdvMatrah: vergilerHaricToplam,
      toplamKdv,
      durum: EFaturaStatus.DRAFT,
      olusturmaTarihi: now,
    }
  }

  async send(faturaNo: string): Promise<{ success: boolean; ettn?: string }> {
    // Mock ETTN (UUID)
    const ettn = `${Date.now()}-${Math.random().toString(36).substring(7)}`
    return { success: true, ettn }
  }

  async getStatus(ettn: string): Promise<EFaturaStatus> {
    return EFaturaStatus.APPROVED
  }

  async downloadPDF(ettn: string): Promise<Buffer> {
    return Buffer.from("Mock PDF content")
  }

  async cancel(ettn: string, reason: string): Promise<{ success: boolean }> {
    return { success: true }
  }
}

/**
 * Sipariş'ten e-Fatura oluştur (helper function)
 */
export async function createEFaturaFromOrder(
  orderId: string,
  eFaturaService: EFaturaService
): Promise<EFaturaDocument> {
  // Bu fonksiyon gerçek implementasyonda:
  // 1. Siparişi database'den çeker
  // 2. Müşteri bilgilerini alır
  // 3. e-Fatura parametrelerini hazırlar
  // 4. e-Fatura servisini çağırır

  // Mock implementation
  const mockParams: CreateEFaturaParams = {
    orderId,
    customerId: "mock-customer-id",
    lines: [
      {
        productName: "Damla Sulama Hortumu 16mm",
        quantity: 100,
        unit: "Mt",
        unitPrice: 12.5,
        kdvRate: 20,
      },
    ],
  }

  return eFaturaService.createDraft(mockParams)
}
