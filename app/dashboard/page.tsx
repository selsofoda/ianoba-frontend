"use client"

import { AuthGuard } from "@/components/auth-guard"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { KeyStatusBadge } from "@/components/key-status-badge"
import { CopyButton } from "@/components/copy-button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Plus,
  RefreshCw,
  MoreHorizontal,
  Key,
  Search,
  X,
  RotateCcw,
  Trash2,
  AlertTriangle,
  Activity,
  Clock,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { api, ApiError } from "@/lib/api"
import { useAlert } from "@/hooks/use-alert"
import { toast } from "sonner"
import { formatDateTime, getExpirationText, getKeyStatus } from "@/lib/format"

interface KeyData {
  key: string
  username: string
  product: string
  hwid: string
  created_at: string
  expire_at: string
}

export default function DashboardPage() {
  const { logout, token } = useAuth()
  const router = useRouter()
  const alert = useAlert()
  const [keys, setKeys] = useState<KeyData[]>([])
  const [filterUser, setFilterUser] = useState("")
  const [filterProduct, setFilterProduct] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const hasActiveFilters = Boolean(filterUser || filterProduct)

  const clearFilters = () => {
    setFilterUser("")
    setFilterProduct("")
  }

  // Estatísticas calculadas a partir do status de expiração de cada key
  const stats = useMemo(() => {
    let active = 0
    let expiring = 0
    let expired = 0
    for (const key of keys) {
      const { status } = getKeyStatus(key.expire_at)
      if (status === "active") active++
      else if (status === "expiring") expiring++
      else if (status === "expired") expired++
    }
    return { active, expiring, expired }
  }, [keys])

  const filteredKeys = useMemo(() => {
    if (!filterUser && !filterProduct) {
      return keys
    }

    return keys.filter((key) => {
      const matchesUser = !filterUser || key.username.toLowerCase().includes(filterUser.toLowerCase())
      const matchesProduct = !filterProduct || key.product.toLowerCase().includes(filterProduct.toLowerCase())
      return matchesUser && matchesProduct
    })
  }, [keys, filterUser, filterProduct])

  const loadKeys = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!token) return

    if (silent) {
      setLoading(true)
    } else {
      setError(null)
      setInitialLoading(true)
      setLoading(true)
    }

    try {
      const response = await api.listKeys(token)

      // A resposta pode ser um array diretamente ou estar em response.data
      const keysData = Array.isArray(response) ? response : response?.data || []

      if (Array.isArray(keysData)) {
        setKeys(keysData)
        setError(null)
        setLastUpdated(new Date())
      } else {
        setKeys([])
      }
    } catch (err) {
      if (err instanceof ApiError) {
        // Sessão expirada: avisa o usuário em vez de deslogar silenciosamente
        if (err.status === 401) {
          toast.warning("Sessão expirada", "Faça login novamente para continuar.")
          logout()
          router.push("/login")
          return
        }
        setError(err.message || "Erro ao carregar as keys.")
      } else {
        setError("Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.")
      }
      setKeys([])
    } finally {
      setLoading(false)
      setInitialLoading(false)
    }
  }

  const handleResetHwid = async (keyId: string) => {
    if (!token) return

    alert.confirm("Resetar HWID", "Tem certeza que deseja resetar o HWID desta key? O usuário precisará registrar um novo hardware.", async () => {
      try {
        await api.resetHwid(token, keyId)
        toast.success("HWID resetado com sucesso!")
        loadKeys({ silent: true })
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 404) {
            alert.error(
              "Funcionalidade Não Disponível",
              "O endpoint de reset HWID não foi encontrado na API. Verifique se esta funcionalidade está implementada no servidor.",
            )
          } else {
            toast.error("Erro ao resetar HWID", error.message)
          }
        } else {
          toast.error("Erro ao resetar HWID", "Erro desconhecido.")
        }
      }
    }, { confirmText: "Resetar HWID" })
  }

  const handleDeleteKey = async (keyId: string) => {
    if (!token) return

    alert.confirm(
      "Deletar Key",
      "Tem certeza que deseja deletar esta key? Esta ação não pode ser desfeita!",
      async () => {
        try {
          await api.deleteKey(token, keyId)
          toast.success("Key deletada com sucesso!")
          loadKeys({ silent: true })
        } catch (error) {
          if (error instanceof ApiError) {
            if (error.status === 404) {
              alert.error(
                "Funcionalidade Não Disponível",
                "O endpoint de deletar key não foi encontrado na API. Verifique se esta funcionalidade está implementada no servidor.",
              )
            } else {
              toast.error("Erro ao deletar key", error.message)
            }
          } else {
            toast.error("Erro ao deletar key", "Erro desconhecido.")
          }
        }
      },
      { destructive: true, confirmText: "Deletar Key" },
    )
  }

  useEffect(() => {
    loadKeys()
  }, [token])

  return (
    <AuthGuard>
      <div className="app-bg min-h-screen">
        {/* Header compartilhado com navegação */}
        <AppHeader />

        {/* Main Content */}
        <main className="mx-auto max-w-7xl p-4 md:p-6 space-y-5">
          {/* Stats: visão geral das keys */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Key className="h-4 w-4" />
                <span className="text-xs font-medium">Total</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">{keys.length}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-primary">
                <Activity className="h-4 w-4" />
                <span className="text-xs font-medium">Ativas</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">{stats.active}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Clock className="h-4 w-4" />
                <span className="text-xs font-medium">Expirando</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">{stats.expiring}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-xs font-medium">Expiradas</span>
              </div>
              <p className="mt-2 text-2xl font-bold tracking-tight">{stats.expired}</p>
            </div>
          </div>

          {/* Toolbar: busca + ações em uma linha compacta */}
          <div className="glass-card rounded-xl p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuário..."
                    aria-label="Filtrar por usuário"
                    value={filterUser}
                    onChange={(e) => setFilterUser(e.target.value)}
                    className="pl-9 pr-9 h-9 bg-background/60"
                  />
                  {filterUser && (
                    <button
                      type="button"
                      aria-label="Limpar filtro de usuário"
                      onClick={() => setFilterUser("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar produto..."
                    aria-label="Filtrar por produto"
                    value={filterProduct}
                    onChange={(e) => setFilterProduct(e.target.value)}
                    className="pl-9 pr-9 h-9 bg-background/60"
                  />
                  {filterProduct && (
                    <button
                      type="button"
                      aria-label="Limpar filtro de produto"
                      onClick={() => setFilterProduct("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => loadKeys({ silent: true })}
                  disabled={loading}
                  variant="ghost"
                  size="sm"
                  className="h-9 text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  <span className="hidden sm:inline ml-1.5">Atualizar</span>
                </Button>
                <Button
                  onClick={() => router.push("/renew-key")}
                  variant="outline"
                  size="sm"
                  className="h-9 bg-background/60"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Renovar
                </Button>
                <Button
                  onClick={() => router.push("/create")}
                  size="sm"
                  className="h-9 bg-gradient-to-r from-primary to-secondary text-primary-foreground font-medium shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:brightness-110"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Criar Key
                </Button>
              </div>
            </div>
          </div>

          {/* Tabela de Keys */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="flex flex-row items-start justify-between gap-2 px-4 pt-4 pb-3">
              <div className="space-y-0.5">
                <h2 className="text-base font-semibold tracking-tight">Keys</h2>
                <p className="text-xs text-muted-foreground">
                  {hasActiveFilters
                    ? `${filteredKeys.length} de ${keys.length} correspondem aos filtros`
                    : `${keys.length} ${keys.length === 1 ? "key cadastrada" : "keys cadastradas"}`}
                  {lastUpdated && ` · atualizado às ${lastUpdated.toLocaleTimeString("pt-BR")}`}
                </p>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5 mr-1" />
                  Limpar filtros
                </Button>
              )}
            </div>
            <div className="px-4 pb-4 md:px-4 md:pb-4">
              {error ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
                  <AlertTriangle className="h-10 w-10 text-destructive" />
                  <div>
                    <p className="font-medium">Erro ao carregar as keys</p>
                    <p className="text-sm text-muted-foreground max-w-md">{error}</p>
                  </div>
                  <Button variant="outline" onClick={() => loadKeys()} disabled={loading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Tentar novamente
                  </Button>
                </div>
              ) : initialLoading && keys.length === 0 ? (
                <div className="space-y-4 p-4 md:p-0">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-9 w-48" />
                      <Skeleton className="h-9 w-28" />
                      <Skeleton className="h-9 w-24" />
                      <Skeleton className="h-9 flex-1" />
                      <Skeleton className="h-9 w-9 rounded-full" />
                    </div>
                  ))}
                </div>
              ) : filteredKeys.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3 text-muted-foreground">
                  <Key className="h-10 w-10 opacity-50" />
                  {keys.length === 0 ? (
                    <>
                      <p>Nenhuma key cadastrada ainda.</p>
                      <Button variant="outline" size="sm" onClick={() => router.push("/create")}>
                        <Plus className="h-4 w-4 mr-2" />
                        Criar primeira key
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>Nenhuma key corresponde aos filtros aplicados.</p>
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Limpar filtros
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Mobile View - Cards */}
                  <div className="block lg:hidden space-y-4 p-4">
                    {filteredKeys.map((key) => (
                      <Card key={key.key} className="bg-muted/30">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <KeyStatusBadge expireAt={key.expire_at} />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Ações da key">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem onClick={() => handleResetHwid(key.key)}>
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  Reset HWID
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteKey(key.key)} className="text-destructive focus:text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Deletar Key
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono bg-background px-2 py-1 rounded flex-1 truncate">{key.key}</code>
                            <CopyButton value={key.key} label="Key" className="h-8 w-8" />
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-xs text-muted-foreground block">Usuário</span>
                              <span className="font-medium">{key.username}</span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">Produto</span>
                              <span className="font-medium">{key.product}</span>
                            </div>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground block">HWID</span>
                            {key.hwid ? (
                              <div className="flex items-center gap-2">
                                <code className="text-xs font-mono bg-background px-2 py-1 rounded flex-1 truncate">{key.hwid}</code>
                                <CopyButton value={key.hwid} label="HWID" className="h-6 w-6" />
                              </div>
                            ) : (
                              <span className="text-muted-foreground italic text-sm">Não definido</span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                            <div>
                              <span className="text-xs text-muted-foreground block">Criado em</span>
                              <span>{formatDateTime(key.created_at)}</span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground block">Expira em</span>
                              <span>{formatDateTime(key.expire_at)}</span>
                              <span className="block text-xs text-muted-foreground">{getExpirationText(key.expire_at)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Desktop View - Table */}
                  <div className="hidden lg:block overflow-x-auto w-full">
                    <Table className="min-w-[900px]">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-left p-2 font-medium whitespace-nowrap">Key</TableHead>
                          <TableHead className="text-left p-2 font-medium whitespace-nowrap">Usuário</TableHead>
                          <TableHead className="text-left p-2 font-medium whitespace-nowrap">Produto</TableHead>
                          <TableHead className="text-left p-2 font-medium whitespace-nowrap">HWID</TableHead>
                          <TableHead className="text-left p-2 font-medium whitespace-nowrap">Status</TableHead>
                          <TableHead className="text-left p-2 font-medium whitespace-nowrap">Criado em</TableHead>
                          <TableHead className="text-left p-2 font-medium whitespace-nowrap">Expira em</TableHead>
                          <TableHead className="text-left p-2 font-medium whitespace-nowrap">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredKeys.map((key) => (
                          <TableRow key={key.key} className="border-b hover:bg-muted/50">
                            <TableCell className="p-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-sm max-w-[180px] truncate">{key.key}</span>
                                      <CopyButton value={key.key} label="Key" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" className="max-w-md break-all font-mono text-xs">
                                    {key.key}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="p-2 whitespace-nowrap">{key.username}</TableCell>
                            <TableCell className="p-2 whitespace-nowrap">{key.product}</TableCell>
                            <TableCell className="p-2">
                              {key.hwid ? (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-sm max-w-[150px] truncate">{key.hwid}</span>
                                        <CopyButton value={key.hwid} label="HWID" />
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="max-w-md break-all font-mono text-xs">
                                      {key.hwid}
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ) : (
                                <span className="text-muted-foreground italic">Não definido</span>
                              )}
                            </TableCell>
                            <TableCell className="p-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div>
                                      <KeyStatusBadge expireAt={key.expire_at} />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    {getExpirationText(key.expire_at)}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell className="p-2 text-sm whitespace-nowrap">{formatDateTime(key.created_at)}</TableCell>
                            <TableCell className="p-2 text-sm whitespace-nowrap">
                              <span>{formatDateTime(key.expire_at)}</span>
                              <span className="block text-xs text-muted-foreground">{getExpirationText(key.expire_at)}</span>
                            </TableCell>
                            <TableCell className="p-2">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    aria-label="Ações da key"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                    }}
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleResetHwid(key.key)}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Reset HWID
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteKey(key.key)}
                                    className="text-destructive focus:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Deletar Key
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
