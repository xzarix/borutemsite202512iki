import { redirect } from "next/navigation"
import { auth } from "@/auth"
import Link from "next/link"
import prisma from "@/lib/auth/prisma"

export default async function CurrentAccountPage() {
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

  // Get or create current account
  let currentAccount = await prisma.currentAccount.findUnique({
    where: { dealerId: dealer.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
    },
  })

  if (!currentAccount) {
    currentAccount = await prisma.currentAccount.create({
      data: {
        dealerId: dealer.id,
        balance: 0,
        creditLimit: dealer.creditLimit,
      },
      include: {
        transactions: true,
      },
    })
  }

  const transactionTypeMap: Record<string, string> = {
    DEBIT: "Borç",
    CREDIT: "Alacak",
    ORDER: "Sipariş",
    PAYMENT: "Ödeme",
    REFUND: "İade",
    ADJUSTMENT: "Düzeltme",
  }

  return (
    <div>
      <header>
        <h1>BoruTem Sulama - Cari Hesap</h1>
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
        <h2>Cari Hesap</h2>

        <section>
          <h3>Hesap Özeti</h3>
          <ul>
            <li>
              Bakiye:{" "}
              <strong>
                {currentAccount.balance.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: "TRY",
                })}
              </strong>
              {currentAccount.balance > 0 ? " (Borç)" : currentAccount.balance < 0 ? " (Alacak)" : ""}
            </li>
            <li>
              Kredi Limiti:{" "}
              {currentAccount.creditLimit.toLocaleString("tr-TR", {
                style: "currency",
                currency: "TRY",
              })}
            </li>
            <li>
              Kullanılabilir Limit:{" "}
              {(currentAccount.creditLimit - currentAccount.balance).toLocaleString(
                "tr-TR",
                {
                  style: "currency",
                  currency: "TRY",
                }
              )}
            </li>
          </ul>
        </section>

        <section>
          <h3>Hesap Hareketleri</h3>
          {currentAccount.transactions.length === 0 ? (
            <p>Henüz işlem bulunmuyor.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>İşlem Tipi</th>
                  <th>Açıklama</th>
                  <th>Tutar</th>
                  <th>Bakiye</th>
                </tr>
              </thead>
              <tbody>
                {currentAccount.transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>
                      {new Date(transaction.createdAt).toLocaleString("tr-TR")}
                    </td>
                    <td>{transactionTypeMap[transaction.type] || transaction.type}</td>
                    <td>{transaction.description}</td>
                    <td
                      style={{
                        color:
                          transaction.type === "DEBIT" ||
                          transaction.type === "ORDER"
                            ? "red"
                            : "green",
                      }}
                    >
                      {transaction.type === "DEBIT" ||
                      transaction.type === "ORDER"
                        ? "+"
                        : "-"}
                      {transaction.amount.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </td>
                    <td>
                      {transaction.balance.toLocaleString("tr-TR", {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  )
}
