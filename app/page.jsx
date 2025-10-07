"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { LoginForm } from "@/components/login-form"
import { RegisterForm } from "@/components/register-form"
import { Button } from "@/components/ui/button"
import { Dumbbell } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState("login")
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/home")
    }
  }, [user, isLoading])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    )
  }

  if (showAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        {authMode === "login" ? (
          <LoginForm onSwitchToRegister={() => setAuthMode("register")} onSuccess={() => router.push("/home")} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode("login")} onSuccess={() => router.push("/home")} />
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center justify-center mb-6">
            <Dumbbell className="w-16 h-16 text-primary" />
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">
            NEWGEN
            <span className="block text-primary">FITNESS</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your body, elevate your performance. Premium fitness equipment and supplements for the next
            generation of athletes.
          </p>

          <Button size="lg" onClick={() => setShowAuth(true)} className="text-lg px-12 py-6 h-auto font-bold">
            GET STARTED
          </Button>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">Products</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50K+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">4.9★</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wide">Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
  
