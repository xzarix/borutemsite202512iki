# BoruTem Sulama - B2B E-Ticaret Platformu

Modern, profesyonel bir tarımsal sulama ekipmanları B2B e-ticaret platformu iskelet yapısı.

## 🎯 Proje Durumu

✅ **Eksiksiz İskelet Yapı Hazır**
- Tüm sayfalar oluşturuldu
- Tüm API route'ları hazır
- Database şeması tamamlandı
- Authentication sistemi çalışıyor
- Minimal CSS ile fonksiyonel yapı

## 🌟 Özellikler

### Bayi Yönetimi
- ✅ Bayi kayıt sistemi (`/register`)
- ✅ Güvenli authentication (NextAuth.js v5)
- ✅ Bayi onay sistemi (`isApproved` flag)
- ✅ Bayi girişi (`/login`)
- ✅ Bayi dashboard (`/dashboard`)

### Sayfalar
**Public Pages:**
- ✅ Ana Sayfa (`/`)
- ✅ Ürünler (`/products`)
- ✅ Kategoriler (`/categories`)
- ✅ Hakkımızda (`/about`)
- ✅ İletişim (`/contact`)
- ✅ Login (`/login`)
- ✅ Register (`/register`)

**Dashboard Pages:**
- ✅ Dashboard (`/dashboard`)
- ✅ Ürünler (`/dashboard/products`)
- ✅ Siparişler (`/dashboard/orders`)
- ✅ Sepet (`/dashboard/cart`)

### API Endpoints
- ✅ `/api/auth/[...nextauth]` - NextAuth
- ✅ `/api/register` - Bayi kaydı
- ✅ `/api/products` - Ürün listesi (GET)
- ✅ `/api/categories` - Kategori listesi (GET)
- ✅ `/api/orders` - Sipariş işlemleri (GET, POST)
- ✅ `/api/cart` - Sepet işlemleri (GET, POST, DELETE)

### Database Models
- ✅ Dealer - Bayi bilgileri
- ✅ Category - Ürün kategorileri (hiyerarşik)
- ✅ Product - Ürün bilgileri
- ✅ Order & OrderItem - Sipariş sistemi
- ✅ Cart & CartItem - Sepet sistemi

### Components
- ✅ UI Components (Button, Input)
- ✅ Layout Components (Header, Footer, DashboardHeader)
- ✅ Form Components (LoginForm)

### Teknik Özellikler
- **Framework**: Next.js 15 (App Router)
- **Dil**: TypeScript
- **Stil**: Minimal CSS (Tailwind hazır, kullanıma hazır)
- **Database**: PostgreSQL + Prisma ORM
- **Authentication**: NextAuth.js v5
- **Validation**: Zod
- **State**: React Hooks

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
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth endpoints
│   │   ├── register/             # Bayi kayıt
│   │   ├── products/             # Ürün API
│   │   ├── categories/           # Kategori API
│   │   ├── orders/               # Sipariş API
│   │   └── cart/                 # Sepet API
│   ├── dashboard/
│   │   ├── products/             # Ürünler sayfası
│   │   ├── orders/               # Siparişler sayfası
│   │   └── cart/                 # Sepet sayfası
│   ├── login/                    # Login sayfası
│   ├── register/                 # Register sayfası
│   ├── products/                 # Public ürünler
│   ├── categories/               # Kategoriler
│   ├── about/                    # Hakkımızda
│   ├── contact/                  # İletişim
│   ├── globals.css               # Minimal CSS
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Ana sayfa
├── components/
│   ├── ui/                       # UI components
│   ├── layout/                   # Layout components
│   └── forms/                    # Form components
├── lib/
│   ├── auth/
│   │   └── prisma.ts             # Prisma client
│   └── utils.ts                  # Utility functions
├── types/
│   ├── index.ts                  # Type definitions
│   └── next-auth.d.ts            # NextAuth types
├── prisma/
│   └── schema.prisma             # Database schema
├── auth.ts                       # NextAuth config
├── middleware.ts                 # Auth middleware
├── .env.example                  # Environment template
└── components.json               # Shadcn config
```

## 🗄️ Database Schema

### Dealer (Bayi)
```prisma
- id, email, password
- companyName, contactName, phone
- address, city, taxNumber
- isApproved, isActive
- orders[], cart
```

### Category (Kategori)
```prisma
- id, name, slug, description, image
- parentId (hiyerarşik yapı)
- products[]
```

### Product (Ürün)
```prisma
- id, name, slug, description, price, stock
- images[], categoryId
- brand, model, material, diameter, pressure, flowRate
- isActive, isFeatured
```

### Order & OrderItem
```prisma
Order:
- id, orderNumber, dealerId, status
- totalAmount, shippingAddress, notes
- items[]

OrderItem:
- id, orderId, productId, quantity, price
```

### Cart & CartItem
```prisma
Cart:
- id, dealerId, items[]

CartItem:
- id, cartId, productId, quantity
```

## 🔐 Authentication Flow

1. **Kayıt**: Bayi `/register` sayfasından başvuru yapar
2. **Onay Bekleme**: `isApproved: false` olarak kaydedilir
3. **Admin Onayı**: Admin bayiyi onaylar (manuel veya admin panel)
4. **Giriş**: Onaylı bayi `/login` ile giriş yapar
5. **Dashboard**: Bayi `/dashboard` sayfasına yönlendirilir

## 🎨 Tasarım

**Mevcut Durum:**
- ✅ Minimal CSS (sadece temel stiller)
- ✅ Temiz HTML semantiği
- ✅ Fonksiyonel form ve butonlar
- ✅ Responsive yapı hazır

**Kullanıma Hazır:**
- Tailwind CSS kurulu ve kullanıma hazır
- Custom CSS eklenebilir
- Shadcn/ui bağımlılıkları kurulu
- Tasarım özgürlüğü tam

## 📝 Geliştirme Önerileri

### Kısa Vadede
- [ ] Ürün ekleme/düzenleme sayfaları
- [ ] Kategori ekleme/düzenleme sayfaları
- [ ] Admin paneli
- [ ] Ürün arama ve filtreleme
- [ ] Sepetten sipariş oluşturma fonksiyonu

### Orta Vadede
- [ ] Email bildirimleri (Resend, SendGrid)
- [ ] Resim upload sistemi (Cloudinary, S3)
- [ ] PDF fatura oluşturma
- [ ] Ödeme entegrasyonu (iyzico, Stripe)
- [ ] Stok yönetimi

### Uzun Vadede
- [ ] Unit & Integration testler (Jest, Vitest)
- [ ] E2E testler (Playwright)
- [ ] Docker container
- [ ] CI/CD pipeline
- [ ] Monitoring (Sentry, LogRocket)

## 🚢 Deployment

### Vercel (Önerilen)
```bash
# 1. GitHub'a push yapın
# 2. Vercel'e import edin
# 3. Environment variables ekleyin
# 4. Deploy butonuna tıklayın
```

### Docker
```dockerfile
# Dockerfile oluşturulacak
```

## 🔧 Geliştirme

### Yeni Sayfa Ekleme
```bash
mkdir app/yeni-sayfa
# app/yeni-sayfa/page.tsx oluştur
```

### Yeni API Endpoint
```bash
mkdir app/api/yeni-endpoint
# app/api/yeni-endpoint/route.ts oluştur
```

### Component Ekleme
```bash
# components/ui/YeniComponent.tsx oluştur
```

## 📄 License

MIT

## 👥 İletişim

Proje ile ilgili sorularınız için iletişime geçin.

---

**Not**: Bu proje iskelet yapıdır. Tasarım ve görsel öğeler sizin tercihinize bırakılmıştır. Tailwind CSS veya custom CSS ile istediğiniz tasarımı ekleyebilirsiniz.
