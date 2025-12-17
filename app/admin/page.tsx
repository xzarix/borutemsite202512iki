import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import prisma from "@/lib/auth/prisma"
import { ROLES, isStaff } from "@/lib/auth/rbac"

export default async function AdminDashboardPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  const dealer = await prisma.dealer.findUnique({
    where: { email: session.user.email },
  })

  if (!dealer || !isStaff(dealer.role as any)) {
    redirect("/dashboard")
  }

  // Get statistics
  const [
    totalDealers,
    pendingDealers,
    totalOrders,
    pendingOrders,
    totalProducts,
    lowStockProducts,
    pendingQuotes,
  ] = await Promise.all([
    prisma.dealer.count(),
    prisma.dealer.count({ where: { isApproved: false } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { stock: { lt: 10 } } }),
    prisma.quoteRequest.count({ where: { status: "PENDING" } }),
  ])

  // Recent orders
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      dealer: {
        select: {
          companyName: true,
          contactName: true,
        },
      },
    },
  })

  return (
    <div>
      <header>
        <h1>BoruTem Sulama - Admin Panel</h1>
        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/dealers">Bayiler</Link>
          <Link href="/admin/products">Ürünler</Link>
          <Link href="/admin/orders">Siparişler</Link>
          <Link href="/admin/quotes">Teklif İstekleri</Link>
          <Link href="/admin/categories">Kategoriler</Link>
          <Link href="/dashboard">Bayi Paneli</Link>
          <span>{dealer.contactName} ({dealer.role})</span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit">Çıkış</button>
          </form>
        </nav>
      </header>

      <main>
        <h2>Dashboard</h2>

        <section>
          <h3>İstatistikler</h3>
          <div>
            <div>
              <h4>Bayiler</h4>
              <p>Toplam: {totalDealers}</p>
              <p>Onay Bekleyen: {pendingDealers}</p>
              {pendingDealers > 0 && (
                <Link href="/admin/dealers?filter=pending">Onay Bekleyenleri Gör</Link>
              )}
            </div>

            <div>
              <h4>Siparişler</h4>
              <p>Toplam: {totalOrders}</p>
              <p>Bekleyen: {pendingOrders}</p>
              {pendingOrders > 0 && (
                <Link href="/admin/orders?status=PENDING">Bekleyen Siparişler</Link>
              )}
            </div>

            <div>
              <h4>Teklif İstekleri</h4>
              <p>Bekleyen: {pendingQuotes}</p>
              {pendingQuotes > 0 && (
                <Link href="/admin/quotes?status=PENDING">Bekleyen Teklifler</Link>
              )}
            </div>

            <div>
              <h4>Ürünler</h4>
              <p>Toplam: {totalProducts}</p>
              <p>Düşük Stok: {lowStockProducts}</p>
              {lowStockProducts > 0 && (
                <Link href="/admin/products?stock=low">Düşük Stoklar</Link>
              )}
            </div>
          </div>
        </section>

        <section>
          <h3>Son Siparişler</h3>
          <table>
            <thead>
              <tr>
                <th>Sipariş No</th>
                <th>Bayi</th>
                <th>Tutar</th>
                <th>Durum</th>
                <th>Tarih</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.dealer.companyName}</td>
                  <td>
                    {order.totalAmount.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>
                  <td>{order.status}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString("tr-TR")}</td>
                  <td>
                    <Link href={`/admin/orders/${order.id}`}>Detay</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}
