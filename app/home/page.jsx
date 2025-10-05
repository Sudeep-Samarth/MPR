"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { ReviewCard } from "@/components/review-card"
import { products, reviews } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Truck } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Home page - user:", user, "isLoading:", isLoading)
    if (!isLoading && !user) {
      console.log("[v0] No user found, redirecting to landing page")
      router.push("/")
    }
  }, [user, isLoading, router])

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

  const popularProducts = products.slice(0, 6)

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Welcome Section */}
        <section className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Welcome to <span className="text-primary">NewGen Fitness</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Your ultimate destination for premium fitness equipment and supplements. We provide everything you need to
            achieve your fitness goals, from professional-grade equipment to scientifically-formulated supplements.
          </p>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-12">
            <div className="p-6 rounded-lg border border-border bg-card">
              <Zap className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Premium Quality</h3>
              <p className="text-sm text-muted-foreground">Only the highest quality products from trusted brands</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <Shield className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Certified Safe</h3>
              <p className="text-sm text-muted-foreground">All supplements are third-party tested and certified</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <Truck className="w-10 h-10 text-primary mx-auto mb-4" />
              <h3 className="font-bold text-lg mb-2">Fast Shipping</h3>
              <p className="text-sm text-muted-foreground">Free shipping on orders over $100</p>
            </div>
          </div>
        </section>

        {/* Popular Products */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-4xl font-bold mb-2">Popular Products</h2>
              <p className="text-muted-foreground">Our best-selling fitness essentials</p>
            </div>
            <Link href="/products">
              <Button variant="outline">
                View All
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section>
          <div className="mb-8">
            <h2 className="text-4xl font-bold mb-2">Customer Reviews</h2>
            <p className="text-muted-foreground">See what our customers are saying</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
