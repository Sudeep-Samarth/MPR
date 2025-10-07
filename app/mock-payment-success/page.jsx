"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function MockPaymentSuccess() {
  const params = useSearchParams();
  const tx = params.get("tx");
  const amt = params.get("amt");
  const cur = params.get("cur");
  const email = params.get("email");

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-2">✅ Payment Successful — Thank you!</h1>
        <p className="text-muted-foreground mb-6">Your transaction ID is {tx}.</p>
        <div className="max-w-lg mx-auto text-left space-y-2 mb-6">
          <div className="flex justify-between"><span>Amount</span><span>{cur} {amt}</span></div>
          <div className="flex justify-between"><span>Billing email</span><span>{email}</span></div>
        </div>
        <div className="space-x-3">
          <a href={`/receipts/${tx}.pdf`} target="_blank" rel="noopener noreferrer">
            <Button>Download receipt (PDF)</Button>
          </a>
          <Link href="/products"><Button variant="outline">Continue Shopping</Button></Link>
        </div>
      </main>
    </div>
  )
}


