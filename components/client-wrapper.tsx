"use client"

import dynamic from "next/dynamic"
import type React from "react"

const ClientProviders = dynamic(
  () => import("@/components/client-providers").then((mod) => ({ default: mod.ClientProviders })),
  {
    ssr: false,
    loading: () => <div className="min-h-screen bg-background" />,
  },
)

interface ClientWrapperProps {
  children: React.ReactNode
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return <ClientProviders>{children}</ClientProviders>
}
