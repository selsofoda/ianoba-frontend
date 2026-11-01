"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loading } from "@/components/ui/loading"
import { isTokenValid } from "@/lib/api"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { token, isLoading, logout } = useAuth()
  const router = useRouter()

  // Token presente porem expirado/malformado NAO e autenticado.
  const authenticated = !isLoading && isTokenValid(token)

  useEffect(() => {
    if (isLoading) return

    if (!isTokenValid(token)) {
      // Ausente, malformado ou expirado -> limpa e volta pro login.
      if (token) logout()
      router.replace("/login")
    }
  }, [token, isLoading, logout, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading size="lg" text="Verificando autenticação..." />
      </div>
    )
  }

  if (!authenticated) {
    return null
  }

  return <>{children}</>
}
