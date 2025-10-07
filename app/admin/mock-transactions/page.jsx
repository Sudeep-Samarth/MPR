"use client"

import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiGet, apiPost } from "@/lib/api"

export default function AdminMockTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [event, setEvent] = useState("payment.succeeded")
  const [txId, setTxId] = useState("")

  const load = async () => {
    setLoading(true)
    try {
      const data = await apiGet("/admin/mock-transactions")
      setTransactions(data.transactions || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const fire = async () => {
    if (!txId) return
    await apiPost("/admin/fire-webhook", { transactionId: txId, event })
    alert("Webhook fired (mock)")
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Mock Transactions (last 50)</h1>

        <Card className="mb-6">
          <CardContent className="p-4 flex gap-2 items-end">
            <div>
              <label className="block text-xs mb-1">Transaction ID</label>
              <input className="px-3 py-2 rounded border" value={txId} onChange={(e) => setTxId(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs mb-1">Event</label>
              <select className="px-3 py-2 rounded border" value={event} onChange={(e) => setEvent(e.target.value)}>
                <option value="payment.succeeded">payment.succeeded</option>
                <option value="payment.failed">payment.failed</option>
              </select>
            </div>
            <Button onClick={fire}>Fire Webhook</Button>
          </CardContent>
        </Card>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2">Time</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Txn ID</th>
                  <th className="p-2">Amount</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Card last4</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t, idx) => (
                  <tr key={idx} className="border-t">
                    <td className="p-2 whitespace-nowrap">{t.timestamp}</td>
                    <td className="p-2">{t.status}{t.code ? ` (${t.code})` : ""}</td>
                    <td className="p-2">{t.transactionId || "-"}</td>
                    <td className="p-2">{t.currency} {t.amount}</td>
                    <td className="p-2">{t.billingEmail || "-"}</td>
                    <td className="p-2">{t.card_last4 || "-"}</td>
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


