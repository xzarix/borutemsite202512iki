"use client"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <h1>Kritik Bir Hata Oluştu</h1>
        <p>Uygulama beklenmedik bir hatayla karşılaştı.</p>
        <button onClick={() => reset()}>Tekrar Dene</button>
      </body>
    </html>
  )
}
