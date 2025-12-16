import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect("/login")
  }

  return (
    <div>
      <header>
        <h1>BoruTem Sulama - Dashboard</h1>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/products">Ürünler</Link>
          <Link href="/dashboard/orders">Siparişlerim</Link>
          <Link href="/dashboard/cart">Sepetim</Link>
          <span>{session.user?.name}</span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit">Çıkış</button>
          </form>
        </nav>
      </header>

      <main>
        <h2>Hoş Geldiniz, {session.user?.name}</h2>

        <section>
          <h3>İstatistikler</h3>
          <ul>
            <li>Toplam Ürün: 0</li>
            <li>Aktif Sipariş: 0</li>
            <li>Toplam Sipariş: 0</li>
            <li>Sepet: 0</li>
          </ul>
        </section>

        <section>
          <h3>Hızlı Erişim</h3>
          <ul>
            <li><Link href="/dashboard/products">Ürünleri İncele</Link></li>
            <li><Link href="/dashboard/orders">Siparişlerim</Link></li>
            <li><Link href="/dashboard/cart">Sepetim</Link></li>
          </ul>
        </section>
      </main>
    </div>
  )
}
