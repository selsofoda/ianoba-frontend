"use client"

import { useState, useEffect } from "react"
import {
  Terminal,
  Search,
  Filter,
  RefreshCw,
  X,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Laptop,
  Zap,
  RotateCcw,
  Plus,
  Trash2,
  KeyRound,
  Globe,
  Clock,
  ChevronDown,
  ChevronUp,
  ShieldAlert
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"
import { api, ApiError } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import { toast } from "sonner"

interface LogsViewProps {
  token: string
}

export function LogsView({ token }: LogsViewProps) {
  const [logs, setLogs] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedAction, setSelectedAction] = useState<string>("ALL")
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)

  const actionFilters = [
    { id: "ALL", label: "Todos os Eventos" },
    { id: "INICIOU", label: "Iniciou Sessão", color: "text-emerald-400" },
    { id: "ATIVOU", label: "Primeiro Vínculo", color: "text-blue-400" },
    { id: "BLOQUEADO_HWID", label: "HWID Divergente", color: "text-rose-400" },
    { id: "BLOQUEADO_EXPIRADO", label: "Key Expirada", color: "text-amber-400" },
    { id: "BLOQUEADO_KEY_INVALIDA", label: "Key Inválida", color: "text-rose-400" },
    { id: "KEY_CRIADA", label: "Key Criada", color: "text-purple-400" },
    { id: "RESET_HWID", label: "Reset HWID", color: "text-amber-400" },
  ]

  const loadLogs = async (currentPage = page, silent = false) => {
    if (!token) return
    if (!silent) setLoading(true)

    try {
      const response = await api.getLogs(token, {
        page: currentPage,
        limit: 20,
        action: selectedAction,
        search: search.trim() || undefined
      })

      if (response && response.logs) {
        setLogs(response.logs)
        setTotal(response.total)
        setTotalPages(response.totalPages)
      } else {
        setLogs([])
        setTotal(0)
        setTotalPages(1)
      }
    } catch (err) {
      toast.error("Erro ao carregar os logs de atividade")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setPage(1)
    loadLogs(1)
  }, [selectedAction, search])

  const handleNextPage = () => {
    if (page < totalPages) {
      const next = page + 1
      setPage(next)
      loadLogs(next)
    }
  }

  const handlePrevPage = () => {
    if (page > 1) {
      const prev = page - 1
      setPage(prev)
      loadLogs(prev)
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id)
  }

  return (
    <div className="space-y-6">
      {/* Header e Busca */}
      <div className="rounded-xl p-5 border border-[#222630] bg-[#111318]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#8a8f98]" />
              <h2 className="text-base font-semibold tracking-tight text-white">Central de Logs & Telemetria</h2>
            </div>
            <p className="text-xs text-[#8a8f98] mt-1">
              Registro em tempo real de cada chamada realizada pelo software dos clientes e ações na plataforma
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadLogs(page, false)}
              disabled={loading}
              className="rounded-lg border-[#222630] hover:bg-[#181b22] h-9 text-xs"
            >
              <RefreshCw className={cn("h-3.5 w-3.5 mr-2", loading && "animate-spin text-white")} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* Barra de Pesquisa e Filtros em Pílulas */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8f98]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar por usuário, key, hardware ID, IP ou mensagem..."
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

          {/* Filtros em Pílulas */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {actionFilters.map((filter) => {
              const isSelected = selectedAction === filter.id
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedAction(filter.id)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-medium transition-colors border",
                    isSelected
                      ? "bg-white border-white text-black font-semibold"
                      : "bg-[#181b22] border-[#222630] text-[#8a8f98] hover:text-white hover:bg-[#222630]"
                  )}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Lista de Logs */}
      <div className="rounded-xl p-5 border border-[#222630] bg-[#111318]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider">
            {total} {total === 1 ? "registro encontrado" : "registros encontrados"}
          </span>
          <span className="text-xs text-[#8a8f98]">Página {page} de {totalPages}</span>
        </div>

        {loading && logs.length === 0 ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-3">
            <Terminal className="h-10 w-10 mx-auto opacity-30" />
            <p className="text-sm font-medium">Nenhum log encontrado para os critérios selecionados.</p>
            {search && (
              <Button variant="outline" size="sm" onClick={() => setSearch("")} className="rounded-lg border-[#222630]">
                Limpar pesquisa
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => {
              const isExpanded = expandedLogId === log._id
              const isBlocked = log.action.startsWith("BLOQUEADO_")

              return (
                <div
                  key={log._id}
                  className="rounded-lg border border-[#222630] bg-[#090a0d] hover:border-[#3b404d] transition-colors overflow-hidden"
                >
                  {/* Linha Principal do Log */}
                  <div
                    onClick={() => toggleExpand(log._id)}
                    className="p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start md:items-center gap-3 min-w-0">
                      {/* Ícone de Ação */}
                      <div className="shrink-0 mt-0.5 md:mt-0">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[#181b22] border border-[#222630] text-[#ededed]">
                          {log.action === "ATIVOU" && <Laptop className="h-3.5 w-3.5" />}
                          {log.action === "INICIOU" && <Zap className="h-3.5 w-3.5" />}
                          {log.action === "BLOQUEADO_HWID" && <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />}
                          {log.action === "BLOQUEADO_EXPIRADO" && <Clock className="h-3.5 w-3.5 text-amber-400" />}
                          {log.action === "BLOQUEADO_KEY_INVALIDA" && <XCircle className="h-3.5 w-3.5 text-rose-400" />}
                          {log.action === "KEY_CRIADA" && <Plus className="h-3.5 w-3.5" />}
                          {log.action === "RESET_HWID" && <RotateCcw className="h-3.5 w-3.5" />}
                          {!["ATIVOU", "INICIOU", "BLOQUEADO_HWID", "BLOQUEADO_EXPIRADO", "BLOQUEADO_KEY_INVALIDA", "KEY_CRIADA", "RESET_HWID"].includes(log.action) && (
                            <Info className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </div>

                      {/* Mensagem e Detalhes */}
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-semibold text-white tracking-tight">
                            {log.username || "SISTEMA"}
                          </span>
                          {log.product && (
                            <span className="rounded bg-[#181b22] border border-[#222630] px-1.5 py-0.2 text-[10px] font-mono text-[#8a8f98] uppercase">
                              {log.product}
                            </span>
                          )}
                          <span className="text-xs text-[#525866]">·</span>
                          <span className="text-xs text-[#8a8f98] font-mono">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-[#8a8f98] mt-0.5 leading-relaxed line-clamp-1">
                          {log.message}
                        </p>
                      </div>
                    </div>

                    {/* Lado Direito: Badge e Botão de Expandir */}
                    <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[11px] font-mono px-2 py-0.5 rounded border",
                          isBlocked && "border-rose-900/40 text-rose-400 bg-rose-950/20",
                          log.action === "BLOQUEADO_EXPIRADO" && "border-amber-900/40 text-amber-400 bg-amber-950/20",
                          !isBlocked && log.action !== "BLOQUEADO_EXPIRADO" && "border-[#222630] text-[#ededed] bg-[#181b22]"
                        )}
                      >
                        {log.action}
                      </Badge>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-[#8a8f98]" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-[#8a8f98]" />
                      )}
                    </div>
                  </div>

                  {/* Detalhes Expandidos (estilo console/drawer) */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-border/30 bg-muted/10 space-y-3 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {log.key && (
                          <div className="rounded-xl bg-background/60 p-2.5 border border-border/40">
                            <span className="text-[10px] text-muted-foreground block font-medium">Key</span>
                            <div className="flex items-center gap-1.5 mt-1 font-mono">
                              <span className="truncate flex-1">{log.key}</span>
                              <CopyButton value={log.key} label="Key" className="h-6 w-6" />
                            </div>
                          </div>
                        )}
                        {log.hwid && (
                          <div className="rounded-lg bg-[#111318] p-2.5 border border-[#222630]">
                            <span className="text-[10px] text-[#8a8f98] block font-medium">Hardware ID (HWID)</span>
                            <div className="flex items-center gap-1.5 mt-1 font-mono">
                              <span className="truncate flex-1 text-[#ededed]">{log.hwid}</span>
                              <CopyButton value={log.hwid} label="HWID" className="h-6 w-6" />
                            </div>
                          </div>
                        )}
                        {log.ip && (
                          <div className="rounded-lg bg-[#111318] p-2.5 border border-[#222630]">
                            <span className="text-[10px] text-[#8a8f98] block font-medium">Endereço IP</span>
                            <span className="font-mono mt-1 block text-[#ededed]">{log.ip}</span>
                          </div>
                        )}
                      </div>

                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="rounded-lg bg-[#111318] p-2.5 border border-[#222630] font-mono text-[11px]">
                          <span className="text-[10px] text-[#8a8f98] font-sans block mb-1">Metadados do Evento:</span>
                          <pre className="overflow-x-auto text-[#8a8f98]">
                            {JSON.stringify(log.metadata, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Paginação */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-5 border-t border-[#222630] mt-5">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={page <= 1 || loading}
              className="rounded-lg border-[#222630] hover:bg-[#181b22]"
            >
              Anterior
            </Button>
            <span className="text-xs text-[#8a8f98] font-mono">
              Página {page} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={page >= totalPages || loading}
              className="rounded-lg border-[#222630] hover:bg-[#181b22]"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
