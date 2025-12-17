import Link from "next/link"

export default function NotFound() {
  return (
    <div>
      <h1>404 - Sayfa Bulunamadı</h1>
      <p>Aradığınız sayfa mevcut değil.</p>
      <Link href="/">Ana Sayfaya Dön</Link>
    </div>
  )
}
