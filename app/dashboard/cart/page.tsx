import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import prisma from "@/lib/auth/prisma"

export default async function CartPage() {
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

  const cart = await prisma.cart.findUnique({
    where: { dealerId: dealer.id },
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

  const totalItems = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0
  const totalAmount =
    cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0

  return (
    <div>
      <header>
        <h1>BoruTem Sulama - Sepetim</h1>
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
        <h2>Sepetim</h2>

        {!cart || cart.items.length === 0 ? (
          <div>
            <p>Sepetiniz boş.</p>
            <Link href="/dashboard/products">Alışverişe Devam Et</Link>
          </div>
        ) : (
          <>
            <section>
              <h3>Sepet İçeriği</h3>
              <table>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Kategori</th>
                    <th>Birim Fiyat</th>
                    <th>Miktar</th>
                    <th>Ara Toplam</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link href={`/dashboard/products/${item.product.id}`}>
                          {item.product.name}
                        </Link>
                      </td>
                      <td>{item.product.category.name}</td>
                      <td>
                        {item.product.price.toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        })}
                      </td>
                      <td>{item.quantity}</td>
                      <td>
                        {(item.product.price * item.quantity).toLocaleString("tr-TR", {
                          style: "currency",
                          currency: "TRY",
                        })}
                      </td>
                      <td>
                        <button>Güncelle</button>
                        <button>Sil</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            <section>
              <h3>Sepet Özeti</h3>
              <ul>
                <li>Toplam Ürün: {totalItems}</li>
                <li>
                  Toplam Tutar:{" "}
                  {totalAmount.toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </li>
              </ul>
            </section>

            <section>
              <h3>İşlemler</h3>
              <p>
                Sepetinizi siparişe dönüştürebilir veya teklif isteyebilirsiniz.
              </p>
              <div>
                <Link href="/dashboard/products">Alışverişe Devam Et</Link>
                <Link href="/dashboard/cart/checkout">
                  <button>Siparişi Tamamla</button>
                </Link>
                <Link href="/dashboard/cart/request-quote">
                  <button>Teklif İste</button>
                </Link>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  )
}
