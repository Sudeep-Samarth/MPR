"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

export function LoginForm({ onSwitchToRegister, onSuccess }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const { login } = useAuth()

  const handleSubmit = (e) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError("Please fill in all fields")
      return
    }

    const result = login(username, password)
    if (result.success) {
      onSuccess()
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-zinc-900 rounded-lg border border-zinc-800">
      <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="username" className="block text-sm font-medium">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full px-4 py-2 rounded-lg border border-zinc-800 bg-black text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
        >
          Login
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-zinc-400">
          Don't have an account?{" "}
          <button onClick={onSwitchToRegister} className="text-red-500 hover:underline font-semibold">
            Register here
          </button>
        </p>
      </div>
    </div>
  )
}
