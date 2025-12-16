import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import { Droplets, Package, ShoppingCart, FileText } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

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
            <Link href="/dashboard" className="text-sm font-medium text-primary">
              Dashboard
            </Link>
            <Link href="/dashboard/products" className="text-sm font-medium hover:text-primary transition-colors">
              Ürünler
            </Link>
            <Link href="/dashboard/orders" className="text-sm font-medium hover:text-primary transition-colors">
              Siparişlerim
            </Link>
            <Link href="/dashboard/cart" className="text-sm font-medium hover:text-primary transition-colors">
              Sepetim
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{session.user?.name}</span>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 bg-muted/50 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Hoş Geldiniz, {session.user?.name}</h1>
            <p className="text-muted-foreground mt-2">Bayi yönetim panelinize göz atın</p>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Ürün</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aktif Sipariş</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Toplam Sipariş</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-6">
              <div className="flex items-center gap-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Droplets className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Sepet</p>
                  <h3 className="text-2xl font-bold">0</h3>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/dashboard/products" className="group rounded-lg border bg-card p-6 hover:border-primary transition-colors">
              <Package className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Ürünleri İncele</h3>
              <p className="text-sm text-muted-foreground">
                Tüm ürün kataloğumuza göz atın ve sipariş verin
              </p>
            </Link>

            <Link href="/dashboard/orders" className="group rounded-lg border bg-card p-6 hover:border-primary transition-colors">
              <FileText className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Siparişlerim</h3>
              <p className="text-sm text-muted-foreground">
                Geçmiş ve aktif siparişlerinizi görüntüleyin
              </p>
            </Link>

            <Link href="/dashboard/cart" className="group rounded-lg border bg-card p-6 hover:border-primary transition-colors">
              <ShoppingCart className="h-8 w-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">Sepetim</h3>
              <p className="text-sm text-muted-foreground">
                Sepetinizdeki ürünleri görüntüleyin ve sipariş verin
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
