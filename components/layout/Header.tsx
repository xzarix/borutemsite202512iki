import Link from "next/link"

interface HeaderProps {
  title?: string
  showAuth?: boolean
}

export function Header({ title = "BoruTem Sulama", showAuth = true }: HeaderProps) {
  return (
    <header>
      <h1>{title}</h1>
      <nav>
        <Link href="/">Ana Sayfa</Link>
        <Link href="/products">Ürünler</Link>
        <Link href="/categories">Kategoriler</Link>
        <Link href="/about">Hakkımızda</Link>
        <Link href="/contact">İletişim</Link>
        {showAuth && (
          <>
            <Link href="/login">Giriş Yap</Link>
            <Link href="/register">Bayi Ol</Link>
          </>
        )}
      </nav>
    </header>
  )
}
