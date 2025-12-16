# Components

Bu klasör projede kullanılacak React componentlerini içerir.

## Yapı

```
components/
├── ui/           # Temel UI bileşenleri (Button, Input, vb.)
├── layout/       # Layout bileşenleri (Header, Footer, vb.)
└── forms/        # Form bileşenleri
```

## Kullanım

Componentler minimal iskelet yapıdadır. İstediğiniz tasarımı ekleyebilirsiniz.

```tsx
import { Button } from "@/components/ui/Button"
import { Header } from "@/components/layout/Header"

export default function Page() {
  return (
    <div>
      <Header />
      <Button>Tıkla</Button>
    </div>
  )
}
```
