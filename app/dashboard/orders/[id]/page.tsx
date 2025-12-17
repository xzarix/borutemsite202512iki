import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/auth/prisma"
import Link from "next/link"

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth()
  if (!session?.user?.id) redirect("/login")

  const order = await prisma.order.findFirst({
    where: {
      id: params.id,
      dealerId: session.user.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })

  if (!order) notFound()

  return (
    <div>
      <header>
        <h1>BoruTem Sulama</h1>
        <nav>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/orders">Siparişlerim</Link>
        </nav>
      </header>

      <main>
        <h2>Sipariş Detayı</h2>
        
        <section>
          <h3>Sipariş Bilgileri</h3>
          <ul>
            <li>Sipariş No: {order.orderNumber}</li>
            <li>Durum: {order.status}</li>
            <li>Toplam: {order.totalAmount} TL</li>
            <li>Tarih: {order.createdAt.toLocaleDateString("tr-TR")}</li>
          </ul>
        </section>

        <section>
          <h3>Teslimat Adresi</h3>
          <p>{order.shippingAddress}</p>
        </section>

        {order.notes && (
          <section>
            <h3>Notlar</h3>
            <p>{order.notes}</p>
          </section>
        )}

        <section>
          <h3>Sipariş Kalemleri</h3>
          <table>
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Fiyat</th>
                <th>Miktar</th>
                <th>Toplam</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product.name}</td>
                  <td>{item.price} TL</td>
                  <td>{item.quantity}</td>
                  <td>{item.price * item.quantity} TL</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <Link href="/dashboard/orders">← Siparişlere Dön</Link>
      </main>
    </div>
  )
}
