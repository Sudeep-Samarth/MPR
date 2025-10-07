"use client"

import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function MockPaymentFailure() {
  const params = useSearchParams();
  const router = useRouter();
  const sid = params.get("sid");
  const code = params.get("code");
  const msg = params.get("msg");

  const retry = () => {
    if (sid) {
      router.push(`/mock-checkout?sessionId=${encodeURIComponent(sid)}`)
    } else {
      router.push("/cart")
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold mb-2">❌ Payment Failed</h1>
        <p className="text-muted-foreground mb-6">{msg} ({code})</p>
        <div className="space-x-3">
          <Button onClick={retry}>Retry Payment</Button>
          <Link href="/products"><Button variant="outline">Continue Shopping</Button></Link>
        </div>
      </main>
    </div>
  )
}


