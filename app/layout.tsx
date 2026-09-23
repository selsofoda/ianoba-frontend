import type React from "react"
import type { Metadata, Viewport } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { ClientProviders } from "@/components/client-providers"
import "./globals.css"

export const metadata: Metadata = {
  title: "Sistema de Gerenciamento de Keys",
  description: "Sistema moderno para gerenciar licenças e keys de software",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={`dark ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
      <body>
        <ThemeProvider defaultTheme="dark" storageKey="ianoba-theme">
          <ClientProviders>{children}</ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
