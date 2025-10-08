"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { apiPost } from "@/lib/api"

function luhnCheck(num) {
  const digits = (num || "").replace(/\D/g, "").split("").map((d) => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = digits[digits.length - 1 - i];
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

export default function MockCheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get("sessionId");

  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState("INR");
  const [billingEmail, setBillingEmail] = useState("");
  const [method, setMethod] = useState("card");
  const [force, setForce] = useState("");
  const [form, setForm] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // In a real flow we might fetch the session to get amount/email; for demo, read from storage
    const stored = sessionStorage.getItem("mock_payment_meta");
    if (stored) {
      try {
        const meta = JSON.parse(stored);
        if (meta.sessionId === sessionId) {
          setAmount(meta.amount || 0);
          setCurrency(meta.currency || "INR");
          setBillingEmail(meta.email || "");
        }
      } catch {}
    }
    // Restore pending form state (if any)
    const saved = sessionStorage.getItem(`mock_payment_form_${sessionId}`)
    if (saved) {
      try {
        const f = JSON.parse(saved)
        setForm({ number: f.number || "", name: f.name || "", expiry: f.expiry || "", cvv: "" })
        setBillingEmail(f.billingEmail || "")
        setMethod(f.method || "card")
      } catch {}
    }
  }, [sessionId]);

  const formatCardNumber = (val) => {
    const digits = (val || "").replace(/\D/g, "").slice(0, 19)
    return digits.replace(/(.{4})/g, "$1 ").trim()
  }

  const rawCardNumber = () => form.number.replace(/\D/g, "")

  const formatExpiry = (val) => {
    const digits = (val || "").replace(/\D/g, "").slice(0, 4)
    if (digits.length <= 2) return digits
    return digits.slice(0, 2) + "/" + digits.slice(2)
  }

  const sanitizeEmail = (val) => (val || "").trim()

  const validate = () => {
    const e = {};
    if (method === "card") {
      const digits = rawCardNumber();
      if (digits.length < 12 || digits.length > 19) e.number = "Enter a valid card number";
      if (!form.name || form.name.length < 2) e.name = "Name required";
      if (!/^((0[1-9])|(1[0-2]))\/(\d{2})$/.test(form.expiry)) e.expiry = "MM/YY";
      if (!/^[0-9]{3,4}$/.test(form.cvv)) e.cvv = "3-4 digit CVV";
      if (digits && !luhnCheck(digits)) e.number = e.number || "Card number failed check";
    }
    if (!billingEmail) e.email = "Email required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingEmail)) e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const payNow = async () => {
    if (!sessionId) return;
    if (!validate()) return;
    setSubmitting(true);
    try {
      // Persist current form state (without CVV) for retries
      try {
        sessionStorage.setItem(
          `mock_payment_form_${sessionId}`,
          JSON.stringify({ number: form.number, name: form.name, expiry: form.expiry, billingEmail, method })
        )
      } catch {}
      const payload = {
        sessionId,
        card: method === "card"
          ? { number: rawCardNumber(), name: form.name.trim(), expiry: form.expiry.trim(), cvv: form.cvv.trim() }
          : { number: "0000000000000000", name: method === "upi" ? "UPI" : "NetBanking", expiry: "12/30", cvv: "000" },
        billingEmail: sanitizeEmail(billingEmail),
        force: force || undefined,
      }
      const res = await apiPost("/api/mock-pay", payload)
      if (res.status === "success") {
        router.push(`/mock-payment-success?tx=${encodeURIComponent(res.transactionId)}&amt=${amount}&cur=${currency}&email=${encodeURIComponent(billingEmail)}`)
      } else {
        const code = res.code || "FAIL"
        router.push(`/mock-payment-failure?sid=${encodeURIComponent(sessionId)}&code=${encodeURIComponent(code)}&msg=${encodeURIComponent(res.message || "Payment failed")}`)
      }
    } catch (err) {
      alert(err?.data?.detail || err.message || "Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Secure Payment — Demo Mode</h1>
        <p className="text-sm text-muted-foreground mb-6">This is a mock payment gateway for demonstration only. No real funds will be collected.</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-2">
                  <Button variant={method === "card" ? "default" : "outline"} onClick={() => setMethod("card")}>Card</Button>
                  <Button variant={method === "upi" ? "default" : "outline"} onClick={() => setMethod("upi")}>Pay with UPI (simulate QR)</Button>
                  <Button variant={method === "netbanking" ? "default" : "outline"} onClick={() => setMethod("netbanking")}>Pay with NetBanking (simulate redirect)</Button>
                </div>

                {method === "card" ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Card number</label>
                      <input className="w-full px-4 py-2 rounded-lg border border-border bg-background" placeholder="1234 5678 9012 3456" value={form.number}
                        inputMode="numeric" autoComplete="cc-number"
                        onChange={(e) => setForm({ ...form, number: formatCardNumber(e.target.value) })} />
                      {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Cardholder name</label>
                      <input className="w-full px-4 py-2 rounded-lg border border-border bg-background" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })} />
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Expiry (MM/YY)</label>
                        <input className="w-full px-4 py-2 rounded-lg border border-border bg-background" placeholder="MM/YY" value={form.expiry}
                          inputMode="numeric" autoComplete="cc-exp"
                          onChange={(e) => setForm({ ...form, expiry: formatExpiry(e.target.value) })} />
                        {errors.expiry && <p className="text-red-600 text-sm mt-1">{errors.expiry}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">CVV</label>
                        <input className="w-full px-4 py-2 rounded-lg border border-border bg-background" placeholder="123" value={form.cvv}
                          inputMode="numeric" autoComplete="cc-csc"
                          onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} />
                        {errors.cvv && <p className="text-red-600 text-sm mt-1">{errors.cvv}</p>}
                      </div>
                    </div>
                  </div>
                ) : method === "upi" ? (
                  <div className="text-sm text-muted-foreground">Scan the mock QR in your mind. This will submit a mock success/failure based on settings.</div>
                ) : (
                  <div className="text-sm text-muted-foreground">Simulating netbanking redirect... clicking pay will complete with mock rules.</div>
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Billing email</label>
                  <input className="w-full px-4 py-2 rounded-lg border border-border bg-background" value={billingEmail}
                    type="email" autoComplete="email"
                    onChange={(e) => setBillingEmail(e.target.value)} />
                  {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-muted-foreground">Force outcome (testing)</label>
                  <select className="px-3 py-2 rounded border" value={force} onChange={(e) => setForce(e.target.value)}>
                    <option value="">Auto</option>
                    <option value="success">Force success</option>
                    <option value="failure">Force failure</option>
                  </select>
                </div>

                <Button className="w-full" size="lg" onClick={payNow} disabled={submitting}>
                  {submitting ? "Processing..." : `Pay Now — ${currency} ${amount}`}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <div className="font-semibold mb-2">Amount</div>
                <div className="text-2xl">{currency} {amount}</div>
                <div className="text-xs text-muted-foreground mt-4">This is a mock gateway for demo/testing — no real money will be charged.</div>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  )
}


