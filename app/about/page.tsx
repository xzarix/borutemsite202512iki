import Link from "next/link"

export default function AboutPage() {
  return (
    <div>
      <header>
        <h1>BoruTem Sulama</h1>
        <nav>
          <Link href="/">Ana Sayfa</Link>
          <Link href="/products">Ürünler</Link>
          <Link href="/about">Hakkımızda</Link>
          <Link href="/contact">İletişim</Link>
        </nav>
      </header>

      <main>
        <h2>Hakkımızda</h2>
        
        <section>
          <h3>Biz Kimiz?</h3>
          <p>BoruTem Sulama, tarımsal sulama sektöründe yıllardır hizmet veren bir bayilik platformudur.</p>
        </section>

        <section>
          <h3>Misyonumuz</h3>
          <p>Modern tarım teknolojilerini bayilerimiz aracılığıyla çiftçilerimize ulaştırmak.</p>
        </section>

        <section>
          <h3>Vizyonumuz</h3>
          <p>Türkiye'nin en güvenilir tarımsal sulama ekipmanları tedarikçisi olmak.</p>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} BoruTem Sulama</p>
      </footer>
    </div>
  )
}
