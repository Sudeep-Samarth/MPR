"use client"

import { createContext, useContext, useState, useEffect } from "react"

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user")
    console.log("[v0] AuthProvider - checking localStorage, found:", storedUser)
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = (username, password) => {
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const foundUser = users.find((u) => u.username === username && u.password === password)

    if (foundUser) {
      const userWithoutPassword = { username: foundUser.username, email: foundUser.email }
      console.log("[v0] Login successful:", userWithoutPassword)
      setUser(userWithoutPassword)
      localStorage.setItem("user", JSON.stringify(userWithoutPassword))
      return { success: true }
    }
    console.log("[v0] Login failed: invalid credentials")
    return { success: false, error: "Invalid username or password" }
  }

  const register = (email, username, password) => {
    // Get existing users
    const users = JSON.parse(localStorage.getItem("users") || "[]")

    // Check if username already exists
    if (users.find((u) => u.username === username)) {
      console.log("[v0] Registration failed: username exists")
      return { success: false, error: "Username already exists" }
    }

    // Add new user
    const newUser = { email, username, password }
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    // Auto login
    const userWithoutPassword = { username, email }
    console.log("[v0] Registration successful, auto-login:", userWithoutPassword)
    setUser(userWithoutPassword)
    localStorage.setItem("user", JSON.stringify(userWithoutPassword))

    return { success: true }
  }

  const logout = () => {
    console.log("[v0] Logging out")
    setUser(null)
    localStorage.removeItem("user")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
