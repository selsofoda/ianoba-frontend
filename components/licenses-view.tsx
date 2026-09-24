"use client"

import { useState, useMemo } from "react"
import {
  KeyRound,
  Search,
  X,
  RotateCcw,
  Trash2,
  MoreHorizontal,
  Clock,
  User,
  Plus,
  RefreshCw,
  Cpu,
  Layers,
  Calendar,
  AlertTriangle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { KeyStatusBadge } from "@/components/key-status-badge"
import { CopyButton } from "@/components/copy-button"
import { formatDateTime, getExpirationText, getKeyStatus } from "@/lib/format"
import { cn } from "@/lib/utils"

export interface KeyData {
  key: string
  username: string
  product: string
  hwid: string | null
  max_threads?: number
  created_at: string
  expire_at: string
}

interface LicensesViewProps {
  keys: KeyData[]
  loading: boolean
  onResetHwid: (key: string) => void
  onDeleteKey: (key: string) => void
  onOpenRenewKey: (key: KeyData) => void
  onOpenCreateKey: () => void
  onRefresh: () => void
}

export function LicensesView({
  keys,
  loading,
  onResetHwid,
  onDeleteKey,
  onOpenRenewKey,
  onOpenCreateKey,
  onRefresh
}: LicensesViewProps) {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [productFilter, setProductFilter] = useState<string>("ALL")

  // Lista única de produtos para filtro
  const availableProducts = useMemo(() => {
    const prods = new Set<string>()
    keys.forEach((k) => prods.add(k.product))
    return Array.from(prods).sort()
  }, [keys])

  // Filtragem
  const filteredKeys = useMemo(() => {
    return keys.filter((k) => {
      // Filtro de texto
      const matchesSearch =
        !search ||
        k.username.toLowerCase().includes(search.toLowerCase()) ||
        k.product.toLowerCase().includes(search.toLowerCase()) ||
        k.key.toLowerCase().includes(search.toLowerCase()) ||
        (k.hwid && k.hwid.toLowerCase().includes(search.toLowerCase()))

      // Filtro de produto
      const matchesProduct = productFilter === "ALL" || k.product === productFilter

      // Filtro de status
      const { status } = getKeyStatus(k.expire_at)
      let matchesStatus = true
      if (statusFilter === "ACTIVE") matchesStatus = status === "active"
      else if (statusFilter === "EXPIRING") matchesStatus = status === "expiring"
      else if (statusFilter === "EXPIRED") matchesStatus = status === "expired"
      else if (statusFilter === "UNBOUND") matchesStatus = k.hwid === null

      return matchesSearch && matchesProduct && matchesStatus
    })
  }, [keys, search, productFilter, statusFilter])

  return (
    <div className="space-y-6">
      {/* Barra de Filtros e Busca */}
      <div className="rounded-xl p-5 border border-[#222630] bg-[#111318]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8f98]" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filtrar por usuário, key, HWID ou produto..."
                className="pl-10 pr-10 h-10 rounded-lg bg-[#090a0d] border-[#222630] text-sm text-[#ededed]"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Product Selector */}
            <Select value={productFilter} onValueChange={setProductFilter}>
              <SelectTrigger className="h-10 w-full rounded-lg bg-[#090a0d] border-[#222630] px-3 text-sm font-medium text-[#ededed] focus-visible:ring-1 focus-visible:ring-[#444a59] focus-visible:border-[#444a59]">
                <SelectValue placeholder="Todos os Produtos" />
              </SelectTrigger>
              <SelectContent className="bg-[#111318] border-[#222630] text-[#ededed] rounded-lg shadow-xl">
                <SelectItem value="ALL" className="focus:bg-[#181b22] focus:text-white cursor-pointer text-sm">
                  Todos os Produtos
                </SelectItem>
                {availableProducts.map((p) => (
                  <SelectItem key={p} value={p} className="focus:bg-[#181b22] focus:text-white cursor-pointer text-sm">
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Action buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-lg h-9 text-sm px-3.5 border-[#222630] hover:bg-[#181b22]"
            >
              <RefreshCw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin text-white")} />
              Atualizar
            </Button>
            <Button
              onClick={onOpenCreateKey}
              size="sm"
              className="rounded-lg h-9 px-4 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Key
            </Button>
          </div>
        </div>

        {/* Status Chips */}
        <div className="flex flex-wrap gap-1.5 pt-4 mt-4 border-t border-[#222630]">
          {[
            { id: "ALL", label: `Todas (${keys.length})` },
            { id: "ACTIVE", label: "Ativas" },
            { id: "EXPIRING", label: "Expirando em Breve" },
            { id: "EXPIRED", label: "Expiradas" },
            { id: "UNBOUND", label: "Sem HWID (1º Uso Pendente)" },
          ].map((chip) => {
            const isSelected = statusFilter === chip.id
            return (
              <button
                key={chip.id}
                onClick={() => setStatusFilter(chip.id)}
                className={cn(
                  "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
                  isSelected
                    ? "bg-white border-white text-black font-semibold"
                    : "bg-[#181b22] border-[#222630] text-[#8a8f98] hover:text-white hover:bg-[#222630]"
                )}
              >
                {chip.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tabela de Keys */}
      <div className="rounded-xl p-5 border border-[#222630] bg-[#111318] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-white">Keys Emitidas</h3>
            <p className="text-xs text-[#8a8f98]">
              {filteredKeys.length} de {keys.length} keys listadas
            </p>
          </div>
        </div>

        {filteredKeys.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-3">
            <KeyRound className="h-10 w-10 mx-auto opacity-30" />
            <p className="text-sm font-medium">Nenhuma key encontrada com esses filtros.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("")
                setStatusFilter("ALL")
                setProductFilter("ALL")
              }}
              className="rounded-xl"
            >
              Resetar Filtros
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border/40 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usuário</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produto</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Chave de Acesso</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Hardware ID</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Threads</TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status / Expiração</TableHead>
                  <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKeys.map((key) => {
                  const threads = key.max_threads || 5
                  return (
                    <TableRow key={key.key} className="border-border/30 hover:bg-muted/30 transition-colors">
                      {/* Usuário com Avatar */}
                      <TableCell className="font-medium py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-7 w-7 rounded-md bg-[#181b22] border border-[#222630] flex items-center justify-center text-[#ededed] font-mono text-[11px] font-semibold">
                            {key.username.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-semibold text-foreground block text-xs tracking-tight">{key.username}</span>
                            <span className="text-[10px] text-muted-foreground block font-mono">
                              criado em {new Date(key.created_at).toLocaleDateString("pt-BR")}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Produto */}
                      <TableCell>
                        <Badge variant="outline" className="text-[11px] font-mono border-[#222630] bg-[#111318] text-[#8a8f98] uppercase">
                          {key.product}
                        </Badge>
                      </TableCell>

                      {/* Key */}
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center gap-1.5 max-w-[200px]">
                                <code className="text-xs font-mono bg-[#111318] border border-[#222630] px-2 py-0.5 rounded text-[#ededed] truncate flex-1">
                                  {key.key}
                                </code>
                                <CopyButton value={key.key} label="Key" className="h-7 w-7" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent className="font-mono text-xs max-w-sm break-all">
                              {key.key}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>

                      {/* HWID */}
                      <TableCell>
                        {key.hwid ? (
                          <div className="flex items-center gap-1.5 max-w-[170px]">
                            <code className="text-xs font-mono text-[#ededed] bg-[#111318] border border-[#222630] px-2 py-0.5 rounded truncate flex-1">
                              {key.hwid}
                            </code>
                            <CopyButton value={key.hwid} label="HWID" className="h-7 w-7" />
                          </div>
                        ) : (
                          <span className="inline-flex items-center text-[11px] text-muted-foreground italic rounded border border-dashed border-[#222630] px-2 py-0.5">
                            Aguardando 1º uso
                          </span>
                        )}
                      </TableCell>

                      {/* Threads */}
                      <TableCell>
                        <div className="flex items-center gap-1.5" title={`${threads} threads permitidas`}>
                          <span className="text-xs font-mono text-[#ededed] bg-[#181b22] px-2 py-0.5 rounded border border-[#222630]">
                            {threads} th
                          </span>
                        </div>
                      </TableCell>

                      {/* Status / Expiração */}
                      <TableCell>
                        <div>
                          <KeyStatusBadge expireAt={key.expire_at} />
                          <span className="text-[10px] text-muted-foreground block mt-1 font-mono">
                            {getExpirationText(key.expire_at)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Ações */}
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-xl">
                            <DropdownMenuItem onClick={() => onOpenRenewKey(key)}>
                              <Clock className="h-4 w-4 mr-2 text-violet-400" />
                              Renovar Key
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onResetHwid(key.key)}>
                              <RotateCcw className="h-4 w-4 mr-2 text-amber-400" />
                              Resetar HWID
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onDeleteKey(key.key)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Deletar Key
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
