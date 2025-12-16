import Link from "next/link"

export default function ContactPage() {
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
        <h2>İletişim</h2>
        
        <section>
          <h3>İletişim Bilgileri</h3>
          <ul>
            <li>Telefon: +90 (XXX) XXX XX XX</li>
            <li>Email: info@borutemsulama.com</li>
            <li>Adres: [Adres bilgisi]</li>
          </ul>
        </section>

        <section>
          <h3>Mesaj Gönderin</h3>
          <form>
            <div>
              <label htmlFor="name">Adınız</label>
              <input id="name" name="name" type="text" required />
            </div>
            
            <div>
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            
            <div>
              <label htmlFor="message">Mesajınız</label>
              <textarea id="message" name="message" rows={5} required></textarea>
            </div>
            
            <button type="submit">Gönder</button>
          </form>
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} BoruTem Sulama</p>
      </footer>
    </div>
  )
}
