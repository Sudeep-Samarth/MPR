"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext(undefined)

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    }
  }, [])

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id)
      let newCart

      if (existingItem) {
        newCart = prevCart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item))
      } else {
        newCart = [...prevCart, { ...product, quantity: 1 }]
      }

      localStorage.setItem("cart", JSON.stringify(newCart))
      return newCart
    })
  }

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== productId)
      localStorage.setItem("cart", JSON.stringify(newCart))
      return newCart
    })
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCart((prevCart) => {
      const newCart = prevCart.map((item) => (item.id === productId ? { ...item, quantity } : item))
      localStorage.setItem("cart", JSON.stringify(newCart))
      return newCart
    })
  }

  const clearCart = () => {
    setCart([])
    localStorage.removeItem("cart")
  }

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0)
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
