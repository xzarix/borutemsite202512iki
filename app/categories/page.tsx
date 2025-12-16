import Link from "next/link"

export default function CategoriesPage() {
  return (
    <div>
      <header>
        <h1>BoruTem Sulama</h1>
        <nav>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/products">Ürünler</Link>
          <Link href="/categories">Kategoriler</Link>
          <Link href="/about">Hakkımızda</Link>
          <Link href="/contact">İletişim</Link>
        </nav>
      </header>

      <main>
        <h2>Ürün Kategorileri</h2>
        
        <section>
          <h3>Damla Sulama Sistemleri</h3>
          <p>Damla sulama borular, damlalıklar ve aksesuarlar</p>
          <Link href="/categories/damla-sulama">Detaylı İncele</Link>
        </section>

        <section>
          <h3>Yağmurlama Sistemleri</h3>
          <p>Sprinkler sistemleri, yağmurlama başlıkları</p>
          <Link href="/categories/yagmurlama">Detaylı İncele</Link>
        </section>

        <section>
          <h3>Mikro Sulama</h3>
          <p>Mikro sprinkler ve mikro sulama ekipmanları</p>
          <Link href="/categories/mikro-sulama">Detaylı İncele</Link>
        </section>

        <section>
          <h3>Filtre Sistemleri</h3>
          <p>Kum filtreleri, disk filtreler, hidrosiklon</p>
          <Link href="/categories/filtreler">Detaylı İncele</Link>
        </section>

        <section>
          <h3>Borular ve Bağlantı Elemanları</h3>
          <p>PE borular, PVC borular, fittingsler</p>
          <Link href="/categories/borular">Detaylı İncele</Link>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} BoruTem Sulama</p>
      </footer>
    </div>
  )
}
