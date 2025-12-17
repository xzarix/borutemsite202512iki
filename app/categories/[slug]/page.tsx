import { notFound } from "next/navigation"
import { prisma } from "@/lib/auth/prisma"
import Link from "next/link"

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findFirst({
    where: { slug: params.slug },
    include: {
      products: {
        where: { isActive: true },
        take: 20,
      },
    },
  })

  if (!category) notFound()

  return (
    <div>
      <header>
        <h1>BoruTem Sulama</h1>
        <nav>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/categories">Kategoriler</Link>
          <Link href="/login">Giriş Yap</Link>
        </nav>
      </header>

      <main>
        <h2>{category.name}</h2>
        
        {category.description && <p>{category.description}</p>}

        <section>
          <h3>Ürünler</h3>
          {category.products.length === 0 ? (
            <p>Bu kategoride henüz ürün bulunmuyor.</p>
          ) : (
            <ul>
              {category.products.map((product) => (
                <li key={product.id}>
                  <Link href={`/products/${product.slug}`}>
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <p>Detaylı bilgi ve fiyatlar için lütfen giriş yapınız.</p>
        <Link href="/login">Giriş Yap</Link>
        <Link href="/register">Bayi Ol</Link>

        <Link href="/categories">← Kategorilere Dön</Link>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} BoruTem Sulama</p>
      </footer>
    </div>
  )
}
