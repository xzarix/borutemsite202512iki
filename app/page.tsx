import Link from "next/link"
import { Droplets, Sprout, Shield, Zap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Droplets className="h-8 w-8" />
            <span>BoruTem Sulama</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/products" className="text-sm font-medium hover:text-primary transition-colors">
              Ürünler
            </Link>
            <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
              Kategoriler
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
              Hakkımızda
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
              İletişim
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Bayi Ol
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-50 to-white py-20 dark:from-green-950/20 dark:to-background">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-2 items-center">
            <div className="flex flex-col gap-6">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Profesyonel Tarımsal Sulama Çözümleri
              </h1>
              <p className="text-lg text-muted-foreground">
                Modern tarım için yenilikçi sulama sistemleri. Bayilerimize özel fiyatlar ve hızlı teslimat ile hizmetinizdeyiz.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/products"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Ürünleri İncele
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Bayi Başvurusu
                </Link>
              </div>
            </div>
            <div className="relative h-[400px] rounded-lg bg-gradient-to-br from-green-400 to-green-600 dark:from-green-600 dark:to-green-800">
              <div className="absolute inset-0 flex items-center justify-center">
                <Droplets className="h-48 w-48 text-white/20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              Neden BoruTem Sulama?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tarımsal sulama sektöründe yıllardır lider konumundayız
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card">
              <div className="rounded-full bg-primary/10 p-4">
                <Droplets className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Geniş Ürün Yelpazesi</h3>
              <p className="text-sm text-muted-foreground">
                Damla sulama, yağmurlama, mikro sulama ve daha fazlası
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card">
              <div className="rounded-full bg-primary/10 p-4">
                <Sprout className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Uzman Destek</h3>
              <p className="text-sm text-muted-foreground">
                Teknik destek ve montaj hizmetleri
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card">
              <div className="rounded-full bg-primary/10 p-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Kalite Garantisi</h3>
              <p className="text-sm text-muted-foreground">
                Tüm ürünlerimizde uzun süreli garanti
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-4 p-6 rounded-lg border bg-card">
              <div className="rounded-full bg-primary/10 p-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Hızlı Teslimat</h3>
              <p className="text-sm text-muted-foreground">
                Türkiye geneli hızlı kargo ve nakliye
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Bayimiz Olmak İster Misiniz?
          </h2>
          <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Rekabetçi fiyatlar, özel kampanyalar ve güvenilir iş ortaklığı için hemen başvurun
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-md bg-white px-8 py-3 text-sm font-medium text-primary hover:bg-white/90 transition-colors"
          >
            Bayi Başvurusu Yap
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="font-semibold mb-4">BoruTem Sulama</h3>
              <p className="text-sm text-muted-foreground">
                Profesyonel tarımsal sulama sistemleri ve ekipmanları
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Kurumsal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary">Hakkımızda</Link></li>
                <li><Link href="/contact" className="hover:text-primary">İletişim</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Ürünler</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/products" className="hover:text-primary">Tüm Ürünler</Link></li>
                <li><Link href="/categories" className="hover:text-primary">Kategoriler</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Bayi Paneli</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-primary">Giriş Yap</Link></li>
                <li><Link href="/register" className="hover:text-primary">Bayi Ol</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} BoruTem Sulama. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
