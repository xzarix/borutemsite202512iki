import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/auth/prisma"
import Link from "next/link"

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) redirect("/login")

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: { category: true },
  })

  if (!product) notFound()

  return (
    <div>
      <header>
        <h1>BoruTem Sulama</h1>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/products">Ürünler</Link>
        </nav>
      </header>

      <main>
        <h2>{product.name}</h2>
        
        <section>
          <h3>Ürün Bilgileri</h3>
          <ul>
            <li>Kategori: {product.category.name}</li>
            <li>Fiyat: {product.price} TL</li>
            <li>Stok: {product.stock}</li>
            {product.brand && <li>Marka: {product.brand}</li>}
            {product.model && <li>Model: {product.model}</li>}
            {product.material && <li>Malzeme: {product.material}</li>}
            {product.diameter && <li>Çap: {product.diameter}</li>}
            {product.pressure && <li>Basınç: {product.pressure}</li>}
            {product.flowRate && <li>Debi: {product.flowRate}</li>}
          </ul>
        </section>

        {product.description && (
          <section>
            <h3>Açıklama</h3>
            <p>{product.description}</p>
          </section>
        )}

        <section>
          <h3>Sipariş</h3>
          <form method="POST" action="/api/cart">
            <input type="hidden" name="productId" value={product.id} />
            <label htmlFor="quantity">Miktar</label>
            <input id="quantity" name="quantity" type="number" min="1" defaultValue="1" />
            <button type="submit">Sepete Ekle</button>
          </form>
        </section>

        <Link href="/dashboard/products">← Ürünlere Dön</Link>
      </main>
    </div>
  )
}
