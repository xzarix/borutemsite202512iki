# BoruTem Sulama - B2B E-Ticaret Platformu

Modern, profesyonel bir tarımsal sulama ekipmanları B2B e-ticaret platformu.

## 🌟 Özellikler

### Bayi Yönetimi
- Bayi kaydı ve onay sistemi
- Güvenli authentication (NextAuth.js)
- Bayi profil yönetimi
- Onay bekleyen bayiler için bilgilendirme

### Ürün Yönetimi
- Kategorize edilmiş ürün kataloğu
- Detaylı ürün bilgileri (marka, model, özellikler)
- Ürün görselleri
- Stok takibi

### Sipariş Sistemi
- Sepet yönetimi
- Sipariş oluşturma
- Sipariş durumu takibi
- Sipariş geçmişi

### Teknik Özellikler
- **Framework**: Next.js 15 (App Router)
- **Dil**: TypeScript
- **Stil**: Tailwind CSS + Shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5
- **State Management**: TanStack Query + Zustand
- **Validation**: Zod
- **Icons**: Lucide React

## 🚀 Kurulum

### Gereksinimler
- Node.js 18+ 
- PostgreSQL 14+
- npm veya pnpm

### Adımlar

1. Repository'yi klonlayın:
```bash
git clone <repository-url>
cd borutemsite202512iki
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını yapılandırın:
```bash
cp .env.example .env
```

`.env` dosyasındaki değerleri güncelleyin:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/borutemsite?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"
```

4. Veritabanı migration'larını çalıştırın:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

5. Development server'ı başlatın:
```bash
npm run dev
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

## 📁 Proje Yapısı

```
borutemsite202512iki/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # NextAuth routes
│   │   └── register/     # Registration endpoint
│   ├── dashboard/        # Bayi dashboard
│   ├── login/            # Login page
│   ├── register/         # Registration page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Homepage
├── components/
│   └── ui/               # Shadcn UI components
├── lib/
│   ├── auth/
│   │   └── prisma.ts     # Prisma client
│   └── utils.ts          # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── auth.ts               # NextAuth configuration
├── middleware.ts         # Auth middleware
└── components.json       # Shadcn config
```

## 🗄️ Database Schema

### Dealer (Bayi)
- Firma bilgileri
- İletişim detayları
- Onay durumu
- Aktiflik durumu

### Category (Kategori)
- Hiyerarşik kategori yapısı
- Slug-based routing

### Product (Ürün)
- Detaylı ürün bilgileri
- Kategorilere bağlı
- Stok takibi
- Öne çıkan ürün işaretleme

### Order & OrderItem (Sipariş)
- Sipariş numarası
- Sipariş durumu (PENDING, CONFIRMED, PREPARING, SHIPPED, DELIVERED, CANCELLED)
- Sipariş kalemleri

### Cart & CartItem (Sepet)
- Bayi bazında sepet
- Sepet ürünleri

## 🔐 Authentication Flow

1. **Kayıt**: Bayi başvurusu yapılır (`/register`)
2. **Onay Bekleme**: Admin tarafından onaylanması beklenir (`isApproved: false`)
3. **Giriş**: Onaylı bayiler giriş yapabilir (`/login`)
4. **Dashboard**: Başarılı giriş sonrası dashboard'a yönlendirilir

## 🎨 Tasarım

- **Renk Paleti**: Tarımsal temaya uygun yeşil tonları
- **Primary Color**: `hsl(142, 76%, 36%)` - Yeşil
- **Responsive**: Mobile-first yaklaşım
- **Dark Mode**: Hazır dark mode desteği
- **Professional**: B2B odaklı, profesyonel tasarım

## 📝 TODO

- [ ] Ürün listesi sayfası (`/dashboard/products`)
- [ ] Ürün detay sayfası
- [ ] Sepet yönetimi (`/dashboard/cart`)
- [ ] Sipariş oluşturma
- [ ] Sipariş listeleme (`/dashboard/orders`)
- [ ] Admin paneli
- [ ] Ürün arama ve filtreleme
- [ ] Email bildirimleri
- [ ] PDF fatura oluşturma
- [ ] Ödeme entegrasyonu (iyzico)
- [ ] Resim upload sistemi
- [ ] Unit & Integration testler
- [ ] Docker deployment

## 🚢 Deployment

### Vercel (Önerilen)
1. GitHub'a push yapın
2. Vercel'e import edin
3. Environment variables'ları ayarlayın
4. Deploy edin

### Docker
```bash
# Coming soon
```

## 📄 License

MIT

## 👥 İletişim

Proje ile ilgili sorularınız için iletişime geçin.
