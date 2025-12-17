import { notFound } from "next/navigation"
import { prisma } from "@/lib/auth/prisma"
import Link from "next/link"

export default async function PublicProductPage({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findFirst({
    where: { slug: params.slug },
    include: { category: true },
  })

  if (!product) notFound()

  return (
    <div>
      <header>
        <h1>BoruTem Sulama</h1>
        <nav>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/products">Ürünler</Link>
          <Link href="/login">Giriş Yap</Link>
        </nav>
      </header>

      <main>
        <h2>{product.name}</h2>
        
        <section>
          <h3>Ürün Bilgileri</h3>
          <ul>
            <li>Kategori: {product.category.name}</li>
            {product.brand && <li>Marka: {product.brand}</li>}
            {product.model && <li>Model: {product.model}</li>}
            {product.material && <li>Malzeme: {product.material}</li>}
          </ul>
        </section>

        {product.description && (
          <section>
            <h3>Açıklama</h3>
            <p>{product.description}</p>
          </section>
        )}

        <section>
          <p>Fiyat ve stok bilgisi için lütfen giriş yapınız.</p>
          <Link href="/login">Giriş Yap</Link>
          <Link href="/register">Bayi Ol</Link>
        </section>

        <Link href="/products">← Ürünlere Dön</Link>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} BoruTem Sulama</p>
      </footer>
    </div>
  )
}
