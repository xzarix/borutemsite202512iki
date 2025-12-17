"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RequestQuotePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [cart, setCart] = useState<any>(null)
  const [formData, setFormData] = useState({
    shippingAddress: "",
    notes: "",
  })

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      const data = await response.json()
      setCart(data)
    } catch (error) {
      console.error("Cart fetch error:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!cart || cart.items.length === 0) {
      setError("Sepetiniz boş")
      return
    }

    if (!formData.shippingAddress.trim()) {
      setError("Teslimat adresi gereklidir")
      return
    }

    setLoading(true)

    try {
      const items = cart.items.map((item: any) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const response = await fetch("/api/quote-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shippingAddress: formData.shippingAddress,
          notes: formData.notes,
          items,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Teklif isteği oluşturulamadı")
      }

      // Clear cart after successful quote request
      for (const item of cart.items) {
        await fetch(`/api/cart/${item.id}`, {
          method: "DELETE",
        })
      }

      router.push("/dashboard/quote-requests?success=true")
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  const totalItems = cart?.items.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0
  const totalAmount =
    cart?.items.reduce(
      (sum: number, item: any) => sum + item.product.price * item.quantity,
      0
    ) || 0

  return (
    <div>
      <h1>Teklif İste</h1>
      <Link href="/dashboard/cart">← Sepete Dön</Link>

      {!cart || cart.items.length === 0 ? (
        <div>
          <p>Sepetiniz boş. Teklif isteyebilmek için sepetinize ürün ekleyin.</p>
          <Link href="/dashboard/products">Ürünlere Git</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p style={{ color: "red" }}>{error}</p>}

          <section>
            <h2>Sepet Özeti</h2>
            <ul>
              <li>Toplam Ürün: {totalItems}</li>
              <li>
                Tahmini Toplam:{" "}
                {totalAmount.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </li>
            </ul>

            <table>
              <thead>
                <tr>
                  <th>Ürün</th>
                  <th>Miktar</th>
                  <th>Birim Fiyat</th>
                  <th>Toplam</th>
                </tr>
              </thead>
              <tbody>
                {cart.items.map((item: any) => (
                  <tr key={item.id}>
                    <td>{item.product.name}</td>
                    <td>{item.quantity}</td>
                    <td>
                      {item.product.price.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </td>
                    <td>
                      {(item.product.price * item.quantity).toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section>
            <h2>Teslimat Bilgileri</h2>

            <div>
              <label htmlFor="shippingAddress">Teslimat Adresi *</label>
              <textarea
                id="shippingAddress"
                name="shippingAddress"
                required
                value={formData.shippingAddress}
                onChange={(e) =>
                  setFormData({ ...formData, shippingAddress: e.target.value })
                }
                rows={4}
                placeholder="Teslimat adresinizi giriniz"
                style={{ width: "100%", padding: "8px" }}
              />
            </div>

            <div>
              <label htmlFor="notes">Notlar (Opsiyonel)</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={4}
                placeholder="Eklemek istediğiniz notları buraya yazabilirsiniz"
                style={{ width: "100%", padding: "8px" }}
              />
            </div>
          </section>

          <section>
            <p>
              Teklif isteğiniz alındığında, satış ekibimiz en kısa sürede sizinle
              iletişime geçecektir.
            </p>
            <button type="submit" disabled={loading}>
              {loading ? "Gönderiliyor..." : "Teklif İsteği Gönder"}
            </button>
          </section>
        </form>
      )}
    </div>
  )
}
