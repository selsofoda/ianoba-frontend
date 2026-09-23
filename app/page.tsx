"use client"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loading } from "@/components/ui/loading"

export default function HomePage() {
  const { token, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (token) {
        router.push("/dashboard")
      } else {
        router.push("/login")
      }
    }
  }, [token, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading size="lg" text="Carregando..." />
      </div>
    )
  }

  return null
}
