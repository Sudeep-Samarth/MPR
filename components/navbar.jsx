"use client"

import { useAuth } from "@/contexts/auth-context"
import { useCart } from "@/contexts/cart-context"
import { Dumbbell, ShoppingCart, User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navbar() {
  const { user, logout } = useAuth()
  const { cartCount } = useCart()
  const pathname = usePathname()

  const navLinks = [
    { href: "/home", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/calculator", label: "Calculator" },
    { href: "/about", label: "About Us" },
  ]

  return (
    <nav className="border-b border-zinc-800 bg-black/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 font-bold text-xl">
            <Dumbbell className="w-6 h-6 text-red-500" />
            <span>NEWGEN FITNESS</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-red-500 ${
                  pathname === link.href ? "text-red-500" : "text-zinc-400"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <Link href="/cart">
              <button className="relative p-2 hover:bg-zinc-900 rounded-lg transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </Link>

            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">{user?.username}</span>
            </div>

            <button
              onClick={logout}
              className="px-3 py-1.5 hover:bg-zinc-900 rounded-lg transition-colors flex items-center gap-2 text-sm"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
