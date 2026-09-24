"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { DashboardHeader, type DashboardTab } from "@/components/dashboard-header"
import { AnalyticsView } from "@/components/analytics-view"
import { LicensesView, type KeyData } from "@/components/licenses-view"
import { LogsView } from "@/components/logs-view"
import { ProductsView, type ProductData } from "@/components/products-view"
import { CreateKeyModal } from "@/components/modals/create-key-modal"
import { RenewKeyModal } from "@/components/modals/renew-key-modal"
import { UpdateProductModal } from "@/components/modals/update-product-modal"
import { useAuth } from "@/lib/auth-context"
import { useAlert } from "@/hooks/use-alert"
import { api, ApiError } from "@/lib/api"
import { toast } from "sonner"

export default function DashboardPage() {
  const { token, logout } = useAuth()
  const router = useRouter()
  const alert = useAlert()

  const [activeTab, setActiveTab] = useState<DashboardTab>("overview")
  const [keys, setKeys] = useState<KeyData[]>([])
  const [products, setProducts] = useState<ProductData[]>([])
  const [stats, setStats] = useState<{
    summary: {
      totalKeys: number
      activeKeys: number
      expiringKeys: number
      expiredKeys: number
      unboundKeys: number
      totalStarts: number
      totalActivations: number
      totalBlocked: number
      blockedHwid: number
      blockedExpired: number
      blockedInvalidKey: number
      totalProducts: number
    }
    activityChart: Array<{ date: string; iniciou: number; ativou: number; bloqueado: number }>
    recentLogs: any[]
    topProducts: Array<{ name: string; count: number }>
  }>({
    summary: {
      totalKeys: 0,
      activeKeys: 0,
      expiringKeys: 0,
      expiredKeys: 0,
      unboundKeys: 0,
      totalStarts: 0,
      totalActivations: 0,
      totalBlocked: 0,
      blockedHwid: 0,
      blockedExpired: 0,
      blockedInvalidKey: 0,
      totalProducts: 0
    },
    activityChart: [],
    recentLogs: [],
    topProducts: []
  })

  const [loading, setLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [renewModalOpen, setRenewModalOpen] = useState(false)
  const [selectedKeyForRenew, setSelectedKeyForRenew] = useState<KeyData | null>(null)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null)

  const loadAllData = useCallback(async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!token) return

    if (!silent) setLoading(true)

    try {
      const [keysRes, statsRes, prodsRes] = await Promise.allSettled([
        api.listKeys(token),
        api.getStats(token),
        api.listProducts(token)
      ])

      // Keys
      if (keysRes.status === "fulfilled" && keysRes.value) {
        const kData = Array.isArray(keysRes.value) ? keysRes.value : (keysRes.value as any)?.data || []
        if (Array.isArray(kData)) setKeys(kData)
      }

      // Stats
      if (statsRes.status === "fulfilled" && statsRes.value) {
        const sData = statsRes.value
        if (sData && sData.summary) {
          setStats(sData)
        }
      }

      // Products
      if (prodsRes.status === "fulfilled" && prodsRes.value) {
        const pData = Array.isArray(prodsRes.value) ? prodsRes.value : (prodsRes.value as any)?.data || []
        if (Array.isArray(pData)) setProducts(pData)
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        toast.warning("Sessão expirada. Faça login novamente.")
        logout()
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }, [token, logout, router])

  // Initial Load
  useEffect(() => {
    loadAllData({ silent: false })
  }, [loadAllData])

  // Auto-refresh interval (10s)
  useEffect(() => {
    if (!autoRefresh || !token) return

    const interval = setInterval(() => {
      loadAllData({ silent: true })
    }, 10000)

    return () => clearInterval(interval)
  }, [autoRefresh, token, loadAllData])

  // Ações de Licença
  const handleResetHwid = (keyId: string) => {
    if (!token) return

    alert.confirm(
      "Resetar HWID",
      "Tem certeza que deseja liberar o hardware desta key? O usuário poderá registrar um novo computador no próximo acesso.",
      async () => {
        try {
          await api.resetHwid(token, keyId)
          toast.success("HWID resetado com sucesso!")
          loadAllData({ silent: true })
        } catch (err: any) {
          toast.error(err.message || "Erro ao resetar HWID")
        }
      },
      { confirmText: "Liberar Hardware" }
    )
  }

  const handleDeleteKey = (keyId: string) => {
    if (!token) return

    alert.confirm(
      "Excluir Key",
      "Esta ação é irreversível. A chave será removida permanentemente do sistema.",
      async () => {
        try {
          await api.deleteKey(token, keyId)
          toast.success("Key excluída com sucesso!")
          loadAllData({ silent: true })
        } catch (err: any) {
          toast.error(err.message || "Erro ao excluir key")
        }
      },
      { destructive: true, confirmText: "Excluir Key" }
    )
  }

  const handleOpenRenew = (key: KeyData) => {
    setSelectedKeyForRenew(key)
    setRenewModalOpen(true)
  }

  const handleOpenProductModal = (product?: ProductData) => {
    setSelectedProduct(product || null)
    setProductModalOpen(true)
  }

  const handleDeleteProduct = (productName: string) => {
    if (!token) return

    alert.confirm(
      "Excluir Produto",
      `Tem certeza que deseja excluir o produto "${productName}"? Esta ação removerá o registro e notas de versão.`,
      async () => {
        try {
          await api.deleteProduct(token, productName)
          toast.success(`Produto "${productName}" excluído com sucesso!`)
          loadAllData({ silent: true })
        } catch (err: any) {
          toast.error(err.message || "Erro ao excluir produto")
        }
      },
      { destructive: true, confirmText: "Excluir Produto" }
    )
  }

  return (
    <AuthGuard>
      <div className="app-bg min-h-screen pb-16">
        {/* Header estilo pill */}
        <DashboardHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCreateModal={() => setCreateModalOpen(true)}
          onOpenRenewModal={() => {
            setSelectedKeyForRenew(null)
            setRenewModalOpen(true)
          }}
          onRefresh={() => loadAllData({ silent: false })}
          isRefreshing={loading}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
          totalLogsCount={stats.summary.totalStarts + stats.summary.totalBlocked + stats.summary.totalActivations}
        />

        {/* Conteúdo Principal conforme aba selecionada */}
        <main className="mx-auto max-w-7xl p-4 md:p-6">
          {activeTab === "overview" && (
            <AnalyticsView
              stats={stats}
              onNavigateToLicenses={() => setActiveTab("licenses")}
              onNavigateToLogs={() => setActiveTab("logs")}
              onOpenCreateKey={() => setCreateModalOpen(true)}
            />
          )}

          {activeTab === "licenses" && (
            <LicensesView
              keys={keys}
              loading={loading}
              onResetHwid={handleResetHwid}
              onDeleteKey={handleDeleteKey}
              onOpenRenewKey={handleOpenRenew}
              onOpenCreateKey={() => setCreateModalOpen(true)}
              onRefresh={() => loadAllData({ silent: false })}
            />
          )}

          {activeTab === "logs" && (
            <LogsView token={token || ""} />
          )}

          {activeTab === "products" && (
            <ProductsView
              products={products}
              loading={loading}
              onOpenUpdateModal={handleOpenProductModal}
              onDeleteProduct={handleDeleteProduct}
              onRefresh={() => loadAllData({ silent: false })}
            />
          )}
        </main>

        {/* Modais Rápidos */}
        <CreateKeyModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          token={token || ""}
          onSuccess={() => loadAllData({ silent: true })}
        />

        <RenewKeyModal
          open={renewModalOpen}
          onOpenChange={setRenewModalOpen}
          token={token || ""}
          initialData={selectedKeyForRenew}
          onSuccess={() => loadAllData({ silent: true })}
        />

        <UpdateProductModal
          open={productModalOpen}
          onOpenChange={setProductModalOpen}
          token={token || ""}
          product={selectedProduct}
          onSuccess={() => loadAllData({ silent: true })}
        />
      </div>
    </AuthGuard>
  )
}
