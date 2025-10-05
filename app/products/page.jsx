"use client"

import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Navbar } from "@/components/navbar"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/products"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [sortBy, setSortBy] = useState("featured")

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

  // Filter products based on search and category
  let filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  // Sort products
  if (sortBy === "price-low") {
    filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price)
  } else if (sortBy === "price-high") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price)
  } else if (sortBy === "rating") {
    filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating)
  }

  const categories = ["all", ...new Set(products.map((p) => p.category))]

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Our Products</h1>
          <p className="text-xl text-muted-foreground">
            Browse our complete collection of premium fitness equipment and supplements
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium">Filters:</span>
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || categoryFilter !== "all" || sortBy !== "featured") && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("")
                  setCategoryFilter("all")
                  setSortBy("featured")
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
          </p>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">No products found</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setCategoryFilter("all")
                setSortBy("featured")
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
