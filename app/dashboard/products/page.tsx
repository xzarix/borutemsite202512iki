import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"

export default async function ProductsPage() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div>
      <header>
        <h1>BoruTem Sulama - Ürünler</h1>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/products">Ürünler</Link>
          <Link href="/dashboard/orders">Siparişlerim</Link>
          <Link href="/dashboard/cart">Sepetim</Link>
        </nav>
      </header>

      <main>
        <h2>Ürün Kataloğu</h2>
        <p>Henüz ürün eklenmemiş.</p>
        
        <section>
          <h3>Kategoriler</h3>
          <ul>
            <li><Link href="/dashboard/products?category=damla-sulama">Damla Sulama</Link></li>
            <li><Link href="/dashboard/products?category=yagmurlama">Yağmurlama Sistemleri</Link></li>
            <li><Link href="/dashboard/products?category=mikro-sulama">Mikro Sulama</Link></li>
            <li><Link href="/dashboard/products?category=filtreler">Filtreler</Link></li>
          </ul>
        </section>
      </main>
    </div>
  )
}
