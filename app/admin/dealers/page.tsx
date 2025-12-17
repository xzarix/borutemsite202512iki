import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import prisma from "@/lib/auth/prisma"
import { isStaff } from "@/lib/auth/rbac"

export default async function AdminDealersPage({
  searchParams,
}: {
  searchParams: { filter?: string; search?: string }
}) {
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

  // Build filter
  const where: any = {}
  if (searchParams.filter === "pending") {
    where.isApproved = false
  }
  if (searchParams.search) {
    where.OR = [
      { companyName: { contains: searchParams.search, mode: "insensitive" } },
      { contactName: { contains: searchParams.search, mode: "insensitive" } },
      { email: { contains: searchParams.search, mode: "insensitive" } },
    ]
  }

  const dealers = await prisma.dealer.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          orders: true,
          quoteRequests: true,
        },
      },
    },
  })

  return (
    <div>
      <header>
        <h1>BoruTem Sulama - Bayi Yönetimi</h1>
        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/dealers">Bayiler</Link>
          <Link href="/admin/products">Ürünler</Link>
          <Link href="/admin/orders">Siparişler</Link>
          <Link href="/admin/quotes">Teklif İstekleri</Link>
        </nav>
      </header>

      <main>
        <h2>Bayiler</h2>

        <section>
          <div>
            <Link href="/admin/dealers">Tümü</Link>
            <Link href="/admin/dealers?filter=pending">Onay Bekleyenler</Link>
          </div>

          <form method="GET">
            <input
              type="text"
              name="search"
              placeholder="Firma, yetkili veya email ara..."
              defaultValue={searchParams.search}
            />
            <button type="submit">Ara</button>
          </form>
        </section>

        <section>
          <table>
            <thead>
              <tr>
                <th>Firma Adı</th>
                <th>Yetkili</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Kademe</th>
                <th>Durum</th>
                <th>Sipariş</th>
                <th>Teklif</th>
                <th>İşlem</th>
              </tr>
            </thead>
            <tbody>
              {dealers.map((d) => (
                <tr key={d.id}>
                  <td>{d.companyName}</td>
                  <td>{d.contactName}</td>
                  <td>{d.email}</td>
                  <td>{d.phone}</td>
                  <td>{d.priceTier}</td>
                  <td>
                    {d.isApproved ? (
                      <span style={{ color: "green" }}>Onaylı</span>
                    ) : (
                      <span style={{ color: "orange" }}>Beklemede</span>
                    )}
                  </td>
                  <td>{d._count.orders}</td>
                  <td>{d._count.quoteRequests}</td>
                  <td>
                    <Link href={`/admin/dealers/${d.id}`}>Detay</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {dealers.length === 0 && <p>Bayi bulunamadı.</p>}
        </section>
      </main>
    </div>
  )
}
