"use client"

import { Star } from "lucide-react"
import { useCart } from "@/contexts/cart-context"

export function ProductCard({ product }) {
  const { addToCart } = useCart()

  return (
    <div className="overflow-hidden group hover:border-red-500 transition-colors border border-zinc-800 rounded-lg bg-zinc-900">
      <div className="aspect-square overflow-hidden bg-zinc-800">
        <img
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4">
        <div className="text-xs text-zinc-400 uppercase tracking-wide mb-1">{product.category}</div>
        <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.name}</h3>
        <p className="text-sm text-zinc-400 mb-3 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center">
            <Star className="w-4 h-4 fill-red-500 text-red-500" />
            <span className="ml-1 text-sm font-semibold">{product.rating}</span>
          </div>
          <span className="text-xs text-zinc-400">({product.reviews} reviews)</span>
        </div>
        <div className="text-2xl font-bold text-red-500 mb-4">${product.price}</div>
        <button
          onClick={() => addToCart(product)}
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
