"use client"

import { useEffect } from "react"
import Link from "next/link"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <h1>Bir Hata Oluştu</h1>
      <p>Üzgünüz, bir şeyler yanlış gitti.</p>
      <p>{error.message}</p>
      <div>
        <button onClick={() => reset()}>Tekrar Dene</button>
        <Link href="/">Ana Sayfaya Dön</Link>
      </div>
    </div>
  )
}
