"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { ReviewCard } from "@/components/review-card"
import { products, reviews } from "@/lib/products"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Shield, Truck } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export default function HomePage() {
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

  const popularProducts = products.slice(0, 6)

  // Review carousel logic
  const [reviewIndex, setReviewIndex] = useState(0)
  const reviewsPerPage = 2
  const totalPages = Math.ceil(reviews.length / reviewsPerPage)
  const handlePrev = () => setReviewIndex((i) => Math.max(i - 1, 0))
  const handleNext = () => setReviewIndex((i) => Math.min(i + 1, totalPages - 1))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-6 md:py-12">
        {/* Welcome Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 md:mb-16 text-center"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6"
          >
            Welcome to <span className="text-primary">NewGen Fitness</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8"
          >
            Your ultimate destination for premium fitness equipment and supplements. We provide everything you need to
            achieve your fitness goals, from professional-grade equipment to scientifically-formulated supplements.
          </motion.p>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8 md:mt-12">
            {[{
              icon: <Zap className="w-10 h-10 text-primary mx-auto mb-4" />,
              title: "Premium Quality",
              desc: "Only the highest quality products from trusted brands"
            }, {
              icon: <Shield className="w-10 h-10 text-primary mx-auto mb-4" />,
              title: "Certified Safe",
              desc: "All supplements are third-party tested and certified"
            }, {
              icon: <Truck className="w-10 h-10 text-primary mx-auto mb-4" />,
              title: "Fast Shipping",
              desc: "Free shipping on orders over $100"
            }].map((feature, idx) => (
              <motion.div
                key={feature.title}
                whileHover={{ scale: 1.04, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className="p-6 rounded-lg border border-border bg-card shadow-sm"
              >
                {feature.icon}
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Popular Products */}
        <section className="mb-12 md:mb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular Products</h2>
              <p className="text-muted-foreground">Our best-selling fitness essentials</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="flex items-center gap-2">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.5 }}
                whileHover={{ scale: 1.03, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
                className="transition-all"
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Reviews Section */}
        <section>
          <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Customer Reviews</h2>
              <p className="text-muted-foreground">See what our customers are saying</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrev}
                disabled={reviewIndex === 0}
                aria-label="Previous reviews"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                disabled={reviewIndex === totalPages - 1}
                aria-label="Next reviews"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {reviews
                .slice(reviewIndex * reviewsPerPage, reviewIndex * reviewsPerPage + reviewsPerPage)
                .map((review, idx) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 40 }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02, boxShadow: "0 8px 32px rgba(0,0,0,0.10)" }}
                    className="transition-all"
                  >
                    <ReviewCard review={review} />
                  </motion.div>
                ))}
            </AnimatePresence>
          </div>
          <div className="flex justify-center mt-6 gap-2">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`w-3 h-3 rounded-full ${i === reviewIndex ? "bg-primary" : "bg-muted-foreground"} transition-all`}
                onClick={() => setReviewIndex(i)}
                aria-label={`Go to reviews page ${i + 1}`}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
