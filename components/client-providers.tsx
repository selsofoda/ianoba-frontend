"use client"

import type React from "react"
import { AuthProvider } from "@/lib/auth-context"
import { AlertProvider } from "@/components/alert-provider"
import { Toaster } from "@/components/ui/sonner"

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <AlertProvider />
      {/* Toasts não bloqueantes para feedbacks rápidos (cópia, sucesso, erro) */}
      <Toaster position="bottom-right" richColors closeButton />
    </AuthProvider>
  )
}
