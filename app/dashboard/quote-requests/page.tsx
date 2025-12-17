import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import prisma from "@/lib/auth/prisma"

export default async function QuoteRequestsPage() {
  const session = await auth()

  if (!session?.user?.email) {
    redirect("/login")
  }

  const dealer = await prisma.dealer.findUnique({
    where: { email: session.user.email },
  })

  if (!dealer) {
    redirect("/login")
  }

  const quoteRequests = await prisma.quoteRequest.findMany({
    where: { dealerId: dealer.id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const statusMap: Record<string, string> = {
    PENDING: "Beklemede",
    REVIEWED: "İncelendi",
    QUOTED: "Fiyat Verildi",
    ACCEPTED: "Kabul Edildi",
    REJECTED: "Reddedildi",
    EXPIRED: "Süresi Doldu",
  }

  return (
    <div>
      <header>
        <h1>BoruTem Sulama - Teklif İsteklerim</h1>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/products">Ürünler</Link>
          <Link href="/dashboard/orders">Siparişlerim</Link>
          <Link href="/dashboard/quote-requests">Teklif İstekleri</Link>
          <Link href="/dashboard/cart">Sepetim</Link>
          <Link href="/dashboard/current-account">Cari Hesap</Link>
          <span>{session.user?.name}</span>
          <form action="/api/auth/signout" method="POST">
            <button type="submit">Çıkış</button>
          </form>
        </nav>
      </header>

      <main>
        <h2>Teklif İsteklerim</h2>

        {quoteRequests.length === 0 ? (
          <div>
            <p>Henüz teklif isteğiniz bulunmuyor.</p>
            <Link href="/dashboard/cart">Sepete Git</Link>
          </div>
        ) : (
          <div>
            <table>
              <thead>
                <tr>
                  <th>Teklif No</th>
                  <th>Tarih</th>
                  <th>Ürün Sayısı</th>
                  <th>Toplam Tutar</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {quoteRequests.map((quote) => (
                  <tr key={quote.id}>
                    <td>{quote.quoteNumber}</td>
                    <td>{new Date(quote.createdAt).toLocaleDateString("tr-TR")}</td>
                    <td>{quote.items.length}</td>
                    <td>
                      {quote.finalAmount
                        ? quote.finalAmount.toLocaleString("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          })
                        : quote.totalAmount
                        ? quote.totalAmount.toLocaleString("tr-TR", {
                            style: "currency",
                            currency: "TRY",
                          })
                        : "-"}
                    </td>
                    <td>{statusMap[quote.status] || quote.status}</td>
                    <td>
                      <Link href={`/dashboard/quote-requests/${quote.id}`}>
                        Detay
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
