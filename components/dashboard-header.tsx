"use client"

import { Shield, KeyRound, Terminal, Box, Activity, RefreshCw, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export type DashboardTab = "overview" | "licenses" | "logs" | "products"

interface DashboardHeaderProps {
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  onOpenCreateModal?: () => void
  onOpenRenewModal?: () => void
  onRefresh: () => void
  isRefreshing?: boolean
  autoRefresh: boolean
  onToggleAutoRefresh: () => void
  totalLogsCount?: number
}

export function DashboardHeader({
  activeTab,
  onTabChange,
  onOpenCreateModal,
  onOpenRenewModal,
  onRefresh,
  isRefreshing,
  autoRefresh,
  onToggleAutoRefresh,
  totalLogsCount = 0
}: DashboardHeaderProps) {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const navItems = [
    { id: "overview" as DashboardTab, label: "Visão Geral", icon: Activity },
    { id: "licenses" as DashboardTab, label: "Keys", icon: KeyRound },
    { id: "logs" as DashboardTab, label: "Auditoria & Logs", icon: Terminal, count: totalLogsCount },
    { id: "products" as DashboardTab, label: "Produtos", icon: Box },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-[#222630] bg-[#090a0d]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6 gap-4">
        {/* Logo / Brand - Minimalista e Sólido, sem animação piscando */}
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => onTabChange("overview")}
            className="flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#181b22] border border-[#262a35] text-white">
              <Shield className="h-4.5 w-4.5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white font-sans">ianoba</span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#8a8f98] bg-[#181b22] px-1.5 py-0.5 rounded border border-[#262a35]">
                Auth
              </span>
            </div>
          </button>

          {/* Navegação Estilo Picnic / Linear */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-[#181b22] text-white border border-[#262a35]"
                      : "text-[#8a8f98] hover:text-white hover:bg-[#12141a]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.count !== undefined && item.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-[#222630] text-[#8a8f98]">
                      {item.count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Controles do Lado Direito */}
        <div className="flex items-center gap-2.5">
          {/* Status Auto-refresh estático e discreto */}
          <button
            onClick={onToggleAutoRefresh}
            className={cn(
              "hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors",
              autoRefresh
                ? "bg-[#14171f] border-[#222630] text-[#8a8f98]"
                : "bg-transparent border-[#222630] text-[#555a66]"
            )}
          >
            <span className={cn("h-2 w-2 rounded-full", autoRefresh ? "bg-emerald-400" : "bg-[#555a66]")} />
            <span className="text-xs">{autoRefresh ? "Auto (10s)" : "Manual"}</span>
          </button>

          <Button
            onClick={onRefresh}
            variant="ghost"
            size="sm"
            disabled={isRefreshing}
            className="h-9 w-9 p-0 text-[#8a8f98] hover:text-white hover:bg-[#181b22] rounded-lg"
            title="Atualizar dados"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin text-white")} />
          </Button>

          <div className="mx-1 h-4 w-px bg-[#222630]" role="separator" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="h-8 px-2 text-[#8a8f98] hover:text-white hover:bg-[#181b22] rounded-lg text-xs"
            title="Sair"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Mobile nav bar */}
      <div className="flex md:hidden overflow-x-auto px-4 py-1.5 gap-1 border-t border-[#222630] bg-[#090a0d]">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs whitespace-nowrap font-medium transition-all flex-1 justify-center",
                isActive
                  ? "bg-[#181b22] text-white border border-[#262a35]"
                  : "text-[#8a8f98]"
              )}
            >
              <Icon className="h-3 w-3" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </header>
  )
}
