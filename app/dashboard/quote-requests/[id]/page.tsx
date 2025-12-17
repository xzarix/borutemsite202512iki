import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import prisma from "@/lib/auth/prisma"

export default async function QuoteRequestDetailPage({
  params,
}: {
  params: { id: string }
}) {
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

  const quoteRequest = await prisma.quoteRequest.findFirst({
    where: {
      id: params.id,
      dealerId: dealer.id,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  })

  if (!quoteRequest) {
    redirect("/dashboard/quote-requests")
  }

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
        <h1>BoruTem Sulama - Teklif Detayı</h1>
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
        <Link href="/dashboard/quote-requests">← Teklif İsteklerine Dön</Link>

        <h2>Teklif İsteği Detayı</h2>

        <section>
          <h3>Genel Bilgiler</h3>
          <ul>
            <li>Teklif No: {quoteRequest.quoteNumber}</li>
            <li>Durum: {statusMap[quoteRequest.status]}</li>
            <li>Tarih: {new Date(quoteRequest.createdAt).toLocaleString("tr-TR")}</li>
            {quoteRequest.validUntil && (
              <li>
                Geçerlilik:{" "}
                {new Date(quoteRequest.validUntil).toLocaleDateString("tr-TR")}
              </li>
            )}
          </ul>
        </section>

        <section>
          <h3>Teslimat Adresi</h3>
          <p>{quoteRequest.shippingAddress}</p>
        </section>

        {quoteRequest.notes && (
          <section>
            <h3>Notlar</h3>
            <p>{quoteRequest.notes}</p>
          </section>
        )}

        {quoteRequest.adminNotes && (
          <section>
            <h3>Admin Notları</h3>
            <p>{quoteRequest.adminNotes}</p>
          </section>
        )}

        <section>
          <h3>Ürünler</h3>
          <table>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Kategori</th>
                <th>Miktar</th>
                <th>İstenen Fiyat</th>
                <th>Teklif Edilen Fiyat</th>
                <th>Ara Toplam</th>
              </tr>
            </thead>
            <tbody>
              {quoteRequest.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <Link href={`/dashboard/products/${item.product.id}`}>
                      {item.product.name}
                    </Link>
                  </td>
                  <td>{item.product.category.name}</td>
                  <td>{item.quantity}</td>
                  <td>
                    {item.requestedPrice
                      ? item.requestedPrice.toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        })
                      : "-"}
                  </td>
                  <td>
                    {item.quotedPrice
                      ? item.quotedPrice.toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        })
                      : "Bekleniyor"}
                  </td>
                  <td>
                    {item.quotedPrice
                      ? (item.quotedPrice * item.quantity).toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        })
                      : item.requestedPrice
                      ? (item.requestedPrice * item.quantity).toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        })
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3>Özet</h3>
          <ul>
            <li>
              Ara Toplam:{" "}
              {quoteRequest.totalAmount
                ? quoteRequest.totalAmount.toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  })
                : "-"}
            </li>
            {quoteRequest.discountPercent && (
              <li>İndirim: %{quoteRequest.discountPercent}</li>
            )}
            {quoteRequest.finalAmount && (
              <li>
                Toplam:{" "}
                {quoteRequest.finalAmount.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </li>
            )}
          </ul>
        </section>

        {quoteRequest.status === "QUOTED" && (
          <section>
            <h3>İşlemler</h3>
            <p>Teklif kabul/ret işlemleri burada yapılacak</p>
          </section>
        )}
      </main>
    </div>
  )
}
