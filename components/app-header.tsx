"use client"

import { KeyRound, LogOut, Plus, RefreshCcw } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/lib/auth-context"

interface AppHeaderProps {
  /** Título da página atual exibido ao lado do logo */
  title?: string
  /** Esconde o botão "Sair" (usado no login) */
  showLogout?: boolean
  /** Esconde a navegação Criar/Renovar (usado nas próprias páginas de ação) */
  showNav?: boolean
}

/**
 * Header compartilhado entre as páginas autenticadas.
 * - Logo clicável volta ao dashboard (evita depender de router.back()).
 * - Navegação rápida para Criar/Renovar keys.
 */
export function AppHeader({ title, showLogout = true, showNav = true }: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 gap-3">
        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-3 rounded-xl focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Ir para o dashboard"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary shadow-lg shadow-primary/25">
            <KeyRound className="h-4.5 w-4.5 text-primary-foreground" />
          </span>
          <span className="flex flex-col items-start leading-none">
            <span className="text-sm font-semibold tracking-tight">ianoba</span>
            <span className="text-[11px] text-muted-foreground">{title ?? "Gerenciamento de Keys"}</span>
          </span>
        </button>

        <div className="flex items-center gap-1.5">
          {showNav && pathname !== "/create" && (
            <Button variant="ghost" size="sm" onClick={() => router.push("/create")} className="text-muted-foreground hover:text-foreground">
              <Plus className="h-4 w-4 md:mr-1.5" />
              <span className="hidden md:inline">Criar</span>
            </Button>
          )}
          {showNav && pathname !== "/renew-key" && (
            <Button variant="ghost" size="sm" onClick={() => router.push("/renew-key")} className="text-muted-foreground hover:text-foreground">
              <RefreshCcw className="h-4 w-4 md:mr-1.5" />
              <span className="hidden md:inline">Renovar</span>
            </Button>
          )}

          <div className="mx-1 h-6 w-px bg-border/70" role="separator" />

          <ThemeToggle />
          {showLogout && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4 md:mr-1.5" />
              <span className="hidden md:inline">Sair</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}