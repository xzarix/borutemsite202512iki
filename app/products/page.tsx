import Link from "next/link"

export default function PublicProductsPage() {
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
          <Link href="/login">Giriş Yap</Link>
        </nav>
      </header>

      <main>
        <h2>Ürünlerimiz</h2>
        <p>Fiyat ve detaylı bilgi için lütfen bayi girişi yapınız.</p>
        
        <section>
          <h3>Ürün Kategorileri</h3>
          <ul>
            <li><Link href="/categories/damla-sulama">Damla Sulama Sistemleri</Link></li>
            <li><Link href="/categories/yagmurlama">Yağmurlama Sistemleri</Link></li>
            <li><Link href="/categories/mikro-sulama">Mikro Sulama</Link></li>
            <li><Link href="/categories/filtreler">Filtre Sistemleri</Link></li>
            <li><Link href="/categories/borular">Borular ve Bağlantı Elemanları</Link></li>
          </ul>
        </section>

        <Link href="/login">Giriş Yapın</Link>
        <Link href="/register">Bayi Olun</Link>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} BoruTem Sulama</p>
      </footer>
    </div>
  )
}
