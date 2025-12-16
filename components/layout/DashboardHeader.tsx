import Link from "next/link"

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header>
      <h1>BoruTem Sulama - Dashboard</h1>
      <nav>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/products">Ürünler</Link>
        <Link href="/dashboard/orders">Siparişlerim</Link>
        <Link href="/dashboard/cart">Sepetim</Link>
        {userName && <span>{userName}</span>}
        <form action="/api/auth/signout" method="POST">
          <button type="submit">Çıkış</button>
        </form>
      </nav>
    </header>
  )
}
