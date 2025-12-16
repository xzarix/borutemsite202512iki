import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"

export default async function OrdersPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div>
      <header>
        <h1>BoruTem Sulama - Siparişlerim</h1>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/products">Ürünler</Link>
          <Link href="/dashboard/orders">Siparişlerim</Link>
          <Link href="/dashboard/cart">Sepetim</Link>
        </nav>
      </header>

      <main>
        <h2>Siparişlerim</h2>
        <p>Henüz siparişiniz bulunmuyor.</p>
        
        <section>
          <h3>Sipariş Geçmişi</h3>
          <p>Geçmiş siparişleriniz burada görünecek.</p>
        </section>
        
        <Link href="/dashboard/products">Alışverişe Başla</Link>
      </main>
    </div>
  )
}
