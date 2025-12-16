import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"

export default async function CartPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div>
      <header>
        <h1>BoruTem Sulama - Sepetim</h1>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/products">Ürünler</Link>
          <Link href="/dashboard/orders">Siparişlerim</Link>
          <Link href="/dashboard/cart">Sepetim</Link>
        </nav>
      </header>

      <main>
        <h2>Sepetim</h2>
        <p>Sepetiniz boş.</p>
        
        <section>
          <h3>Sepet Özeti</h3>
          <ul>
            <li>Toplam Ürün: 0</li>
            <li>Toplam Tutar: 0 TL</li>
          </ul>
        </section>
        
        <div>
          <Link href="/dashboard/products">Alışverişe Devam Et</Link>
          <button disabled>Siparişi Tamamla</button>
        </div>
      </main>
    </div>
  )
}
