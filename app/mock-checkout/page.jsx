"use client"

import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, CreditCard, Truck, Shield } from "lucide-react"
import { apiPost } from "@/lib/api"

export default function MockCheckoutPage() {
  const { user, isLoading } = useAuth()
  const { cart, clearCart } = useCart()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId')

  const [paymentData, setPaymentData] = useState(null)
  const [formData, setFormData] = useState({
    cardNumber: '4242424242424242',
    expiryDate: '12/25',
    cvv: '123',
    cardName: user?.name || user?.email || '',
    billingAddress: '',
    city: '',
    zipCode: '',
    country: 'US'
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentComplete, setPaymentComplete] = useState(false)
  const [orderDetails, setOrderDetails] = useState(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (sessionId) {
      loadPaymentSession()
    }
  }, [sessionId])

  const loadPaymentSession = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/payment-session/${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setPaymentData(data)
      } else {
        console.error('Failed to load payment session')
      }
    } catch (error) {
      console.error('Error loading payment session:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePayment = async () => {
    setIsProcessing(true)
    
    try {
      const response = await apiPost('/api/complete-payment', {
        sessionId,
        paymentMethod: 'mock_card',
        shippingAddress: {
          name: formData.cardName,
          address: formData.billingAddress,
          city: formData.city,
          zipCode: formData.zipCode,
          country: formData.country
        }
      })

      setOrderDetails(response)
      setPaymentComplete(true)
      clearCart()
      
      // Clear session storage
      sessionStorage.removeItem('mock_payment_meta')
      
    } catch (error) {
      console.error('Payment failed:', error)
      alert(error.message || 'Payment failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (paymentComplete && orderDetails) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 text-green-600">Payment Successful!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your order has been confirmed and payment processed successfully.
            </p>
            
            <Card className="mb-8 text-left">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4">Order Details</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono">{orderDetails.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction ID:</span>
                    <span className="font-mono">{orderDetails.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-bold">${orderDetails.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-600 font-semibold">Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-x-4">
              <Button onClick={() => router.push('/home')} size="lg">
                Back to Home
              </Button>
              <Button onClick={() => router.push('/products')} size="lg" variant="outline">
                Continue Shopping
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading payment session...</div>
      </div>
    )
  }

  const calculateTotals = () => {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0)
    const shipping = subtotal >= 100 ? 0 : 9.99
    const tax = subtotal * 0.08
    const total = subtotal + shipping + tax
    
    return { subtotal, shipping, tax, total }
  }

  const totals = calculateTotals()

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Complete Your Payment</h1>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Payment Form */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="w-5 h-5" />
                    <h2 className="text-2xl font-bold">Payment Information</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input
                        id="cardName"
                        name="cardName"
                        value={formData.cardName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="4242 4242 4242 4242"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Expiry Date</Label>
                        <Input
                          id="expiryDate"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Truck className="w-5 h-5" />
                    <h2 className="text-2xl font-bold">Billing Address</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="billingAddress">Address</Label>
                      <Input
                        id="billingAddress"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        placeholder="123 Main St"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          placeholder="New York"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="zipCode">ZIP Code</Label>
                        <Input
                          id="zipCode"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          placeholder="10001"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card className="sticky top-20">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} x{item.quantity}
                        </span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>${totals.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{totals.shipping === 0 ? "FREE" : `$${totals.shipping.toFixed(2)}`}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Tax</span>
                      <span>${totals.tax.toFixed(2)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handlePayment}
                    className="w-full mt-6" 
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : `Pay $${totals.total.toFixed(2)}`}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By completing this purchase, you agree to our terms of service and privacy policy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
