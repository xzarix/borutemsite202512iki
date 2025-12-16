"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactName: "",
    phone: "",
    address: "",
    city: "",
    taxNumber: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Şifreler eşleşmiyor")
      return
    }

    if (formData.password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Kayıt başarısız")
      }

      router.push("/login?registered=true")
    } catch (error: any) {
      setError(error.message || "Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h1>Bayi Başvurusu</h1>
      <Link href="/">Ana Sayfa</Link>

      <form onSubmit={handleSubmit}>
        {error && <p>{error}</p>}

        <div>
          <label htmlFor="companyName">Firma Adı *</label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            required
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="contactName">Yetkili Adı Soyadı *</label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            required
            value={formData.contactName}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="phone">Telefon *</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="city">Şehir</label>
          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="taxNumber">Vergi Numarası</label>
          <input
            id="taxNumber"
            name="taxNumber"
            type="text"
            value={formData.taxNumber}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="address">Adres</label>
          <input
            id="address"
            name="address"
            type="text"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="password">Şifre *</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={formData.password}
            onChange={handleChange}
            placeholder="En az 6 karakter"
          />
        </div>

        <div>
          <label htmlFor="confirmPassword">Şifre Tekrar *</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <p>Başvurunuz incelendikten sonra onaylanacaktır.</p>

        <button type="submit" disabled={loading}>
          {loading ? "Kaydediliyor..." : "Başvuru Yap"}
        </button>
      </form>

      <p>
        Zaten hesabınız var mı? <Link href="/login">Giriş Yap</Link>
      </p>
    </div>
  )
}
