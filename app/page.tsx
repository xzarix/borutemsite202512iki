import Link from "next/link"

export default function Home() {
  return (
    <div>
      <header>
        <h1>BoruTem Sulama</h1>
        <nav>
          <Link href="/products">Ürünler</Link>
          <Link href="/categories">Kategoriler</Link>
          <Link href="/about">Hakkımızda</Link>
          <Link href="/contact">İletişim</Link>
          <Link href="/login">Giriş Yap</Link>
          <Link href="/register">Bayi Ol</Link>
        </nav>
      </header>

      <main>
        <section>
          <h2>Profesyonel Tarımsal Sulama Çözümleri</h2>
          <p>Modern tarım için yenilikçi sulama sistemleri. Bayilerimize özel fiyatlar ve hızlı teslimat ile hizmetinizdeyiz.</p>
          <Link href="/products">Ürünleri İncele</Link>
          <Link href="/register">Bayi Başvurusu</Link>
        </section>

        <section>
          <h3>Özellikler</h3>
          <ul>
            <li>Geniş Ürün Yelpazesi</li>
            <li>Uzman Destek</li>
            <li>Kalite Garantisi</li>
            <li>Hızlı Teslimat</li>
          </ul>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} BoruTem Sulama</p>
      </footer>
    </div>
  )
}
