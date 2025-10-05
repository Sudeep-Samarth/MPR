"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Navbar } from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Award, Users, Zap, Shield, Heart, TrendingUp } from "lucide-react"

export default function AboutPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
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

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="text-primary">NewGen Fitness</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We're on a mission to empower the next generation of athletes with premium fitness equipment and supplements
            that deliver real results.
          </p>
        </section>

        {/* Our Story */}
        <section className="mb-16">
          <Card>
            <CardContent className="p-8 md:p-12">
              <h2 className="text-3xl font-bold mb-6">Our Story</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Founded in 2020, NewGen Fitness was born from a simple belief: everyone deserves access to
                  high-quality fitness equipment and supplements without breaking the bank. Our founders, a group of
                  passionate fitness enthusiasts and former athletes, saw a gap in the market for products that combined
                  premium quality with affordability.
                </p>
                <p>
                  What started as a small online store has grown into a trusted brand serving over 50,000 customers
                  worldwide. We've built our reputation on three core principles: quality, transparency, and customer
                  satisfaction.
                </p>
                <p>
                  Today, we partner with leading manufacturers and supplement brands to bring you products that are
                  rigorously tested, scientifically backed, and designed to help you achieve your fitness goals.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Our Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
                <p className="text-muted-foreground">
                  We source only the highest quality products from trusted manufacturers and brands.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Safety First</h3>
                <p className="text-muted-foreground">
                  All supplements are third-party tested and certified for purity and safety.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Community Driven</h3>
                <p className="text-muted-foreground">
                  We listen to our customers and continuously improve based on your feedback.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Fast Delivery</h3>
                <p className="text-muted-foreground">
                  Quick processing and shipping to get your products to you as fast as possible.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Customer Care</h3>
                <p className="text-muted-foreground">
                  Dedicated support team ready to help you with any questions or concerns.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Results Focused</h3>
                <p className="text-muted-foreground">
                  Every product is chosen to help you achieve measurable fitness results.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats */}
        <section className="mb-16">
          <Card className="bg-primary/5">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">50K+</div>
                  <div className="text-muted-foreground">Happy Customers</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
                  <div className="text-muted-foreground">Products</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">4.9</div>
                  <div className="text-muted-foreground">Average Rating</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">100%</div>
                  <div className="text-muted-foreground">Satisfaction Guarantee</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Mission Statement */}
        <section>
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
              <p className="text-xl leading-relaxed max-w-3xl mx-auto opacity-90">
                To inspire and equip the next generation of athletes with the tools they need to push their limits,
                achieve their goals, and live healthier, stronger lives.
              </p>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
