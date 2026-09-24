"use client"

import { useMemo } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts"
import {
  KeyRound,
  Shield,
  Zap,
  Activity,
  Laptop,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  Clock,
  Layers
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDateTime } from "@/lib/format"

interface AnalyticsViewProps {
  stats: {
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
    recentLogs: Array<{
      _id: string
      action: string
      type: 'success' | 'warning' | 'error' | 'info'
      message: string
      username?: string
      product?: string
      key?: string
      hwid?: string
      ip?: string
      createdAt: string
    }>
    topProducts: Array<{ name: string; count: number }>
  }
  onNavigateToLicenses: () => void
  onNavigateToLogs: () => void
  onOpenCreateKey?: () => void
}

export function AnalyticsView({
  stats,
  onNavigateToLicenses,
  onNavigateToLogs,
  onOpenCreateKey
}: AnalyticsViewProps) {
  const { summary, activityChart, recentLogs, topProducts } = stats

  const successRate = useMemo(() => {
    const totalCalls = summary.totalStarts + summary.totalActivations + summary.totalBlocked
    if (totalCalls === 0) return 100
    const successful = summary.totalStarts + summary.totalActivations
    return Math.round((successful / totalCalls) * 1000) / 10
  }, [summary])

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-[#262a35] bg-[#111318] p-2.5 shadow-xl">
          <p className="text-[11px] font-mono text-[#8a8f98] mb-1.5">{label}</p>
          <div className="space-y-1 text-xs">
            {payload.map((entry: any, index: number) => (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4 font-mono">
                <span className="text-[#8a8f98]">{entry.name}:</span>
                <span className="font-semibold text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Título da Página - Tipografia Elegante e Limpa estilo Picnic */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-3 border-b border-[#1c1f27]">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-sans">
            Visão Geral
          </h1>
          <p className="text-sm text-[#8a8f98] mt-1">
            Status operacional de keys, conexões ativas e histórico de telemetria
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={onNavigateToLogs}
            variant="outline"
            size="sm"
            className="rounded-lg h-9 text-sm px-3.5 border-[#262a35] bg-[#14171f] text-[#ededed] hover:bg-[#1a1d27]"
          >
            Auditoria
          </Button>
          <Button
            onClick={onNavigateToLicenses}
            size="sm"
            className="rounded-lg h-9 text-sm px-4 bg-[#14171f] border border-[#262a35] text-[#ededed] hover:bg-[#1a1d27] font-medium transition-colors"
          >
            Gerenciar Keys
          </Button>
        </div>
      </div>

      {/* 4 Métricas Principais - Fontes ampliadas e 3 cores de destaque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 - Keys (Emerald) */}
        <div className="rounded-xl border border-[#222630] bg-[#111318] p-5">
          <div className="flex items-center justify-between text-[#8a8f98]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8a8f98]">Keys Ativas</span>
            <KeyRound className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">{summary.activeKeys}</span>
            <span className="text-sm text-[#8a8f98] font-mono">/ {summary.totalKeys} total</span>
          </div>
          <div className="mt-2 text-xs text-[#8a8f98] font-mono">
            {summary.expiringKeys > 0 ? `${summary.expiringKeys} expirando em 7 dias` : "Nenhuma expirando em breve"}
          </div>
        </div>

        {/* Card 2 - Sessões (Emerald) */}
        <div className="rounded-xl border border-[#222630] bg-[#111318] p-5">
          <div className="flex items-center justify-between text-[#8a8f98]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8a8f98]">Sessões Iniciadas</span>
            <Zap className="h-4.5 w-4.5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">{summary.totalStarts}</span>
            <span className="text-sm text-[#8a8f98]">execuções</span>
          </div>
          <div className="mt-2 text-xs text-[#8a8f98] font-mono">
            {successRate}% taxa de sucesso
          </div>
        </div>

        {/* Card 3 - Vínculos (Blue) */}
        <div className="rounded-xl border border-[#222630] bg-[#111318] p-5">
          <div className="flex items-center justify-between text-[#8a8f98]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8a8f98]">Primeiro Vínculo</span>
            <Laptop className="h-4.5 w-4.5 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">{summary.totalActivations}</span>
            <span className="text-sm text-[#8a8f98]">dispositivos</span>
          </div>
          <div className="mt-2 text-xs text-[#8a8f98] font-mono">
            {summary.unboundKeys} pendente(s) de ativação
          </div>
        </div>

        {/* Card 4 - Bloqueios (Rose) */}
        <div className="rounded-xl border border-[#222630] bg-[#111318] p-5">
          <div className="flex items-center justify-between text-[#8a8f98]">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8a8f98]">Bloqueios</span>
            <Shield className="h-4.5 w-4.5 text-rose-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white font-mono">{summary.totalBlocked}</span>
            <span className="text-sm text-[#8a8f98]">tentativas</span>
          </div>
          <div className="mt-2 text-xs text-[#8a8f98] font-mono">
            HWID: {summary.blockedHwid} · Expiradas: {summary.blockedExpired}
          </div>
        </div>
      </div>

      {/* Grid Principal: Gráfico e Feed Recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico Linear/Sóbrio */}
        <div className="lg:col-span-2 rounded-xl border border-[#222630] bg-[#111318] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold tracking-tight text-white">Atividade do Sentinela</h2>
              <p className="text-xs text-[#8a8f98]">Volume de requisições de autenticação por período</p>
            </div>
            <div className="flex items-center gap-3.5 text-xs font-mono text-[#8a8f98]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Iniciou
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                Ativou
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Bloqueado
              </span>
            </div>
          </div>

          <div className="h-[270px] w-full">
            {activityChart && activityChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#222630" />
                  <XAxis dataKey="date" stroke="#525866" className="text-xs font-mono" />
                  <YAxis allowDecimals={false} stroke="#525866" className="text-xs font-mono" />
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="iniciou"
                    name="Iniciou"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="#10b981"
                    fillOpacity={0.08}
                  />
                  <Area
                    type="monotone"
                    dataKey="ativou"
                    name="Ativou"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fill="#06b6d4"
                    fillOpacity={0.08}
                  />
                  <Area
                    type="monotone"
                    dataKey="bloqueado"
                    name="Bloqueado"
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                    fill="#f43f5e"
                    fillOpacity={0.05}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#8a8f98] gap-1">
                <Activity className="h-5 w-5 opacity-40" />
                <p className="text-sm">Aguardando telemetria de chamadas</p>
              </div>
            )}
          </div>

          {/* Produtos Registrados */}
          <div className="mt-5 pt-4 border-t border-[#222630]">
            <span className="text-[11px] font-medium text-[#8a8f98] uppercase tracking-wider block mb-2">
              Chaves por Produto
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {topProducts.length > 0 ? (
                topProducts.map((p) => (
                  <div key={p.name} className="rounded-lg bg-[#14171f] p-3 border border-[#222630]">
                    <span className="text-sm font-semibold text-white block truncate">{p.name}</span>
                    <span className="text-xs text-[#8a8f98] font-mono mt-0.5 block">{p.count} ativa(s)</span>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-xs text-[#8a8f98]">Nenhum produto cadastrado.</div>
              )}
            </div>
          </div>
        </div>

        {/* Feed Lateral - Estilo Sóbrio e Compacto */}
        <div className="rounded-xl border border-[#222630] bg-[#111318] p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold tracking-tight text-white">Últimos Eventos</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateToLogs}
                className="h-7 text-xs text-[#8a8f98] hover:text-white p-0"
              >
                Ver todos
                <ArrowUpRight className="h-3.5 w-3.5 ml-0.5" />
              </Button>
            </div>

            <div className="space-y-2">
              {recentLogs && recentLogs.length > 0 ? (
                recentLogs.slice(0, 5).map((log) => {
                  const isBlocked = log.action.startsWith("BLOQUEADO_")
                  const isSuccess = log.action === "INICIOU" || log.action === "ATIVOU"

                  return (
                    <div
                      key={log._id}
                      className="rounded-lg p-3 border border-[#222630] bg-[#14171f] hover:border-[#323644] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white truncate">
                          {log.username || "SISTEMA"}
                        </span>
                        <span className={cn(
                          "text-xs font-mono px-2 py-0.5 rounded border",
                          isBlocked
                            ? "bg-rose-950/40 border-rose-800/60 text-rose-400 font-medium"
                            : isSuccess
                            ? "bg-emerald-950/40 border-emerald-800/60 text-emerald-400 font-medium"
                            : "bg-[#181b22] border-[#2a2e3a] text-[#8a8f98]"
                        )}>
                          {log.action}
                        </span>
                      </div>

                      <p className="text-xs text-[#8a8f98] mt-1.5 line-clamp-1">
                        {log.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-xs text-[#555a66] font-mono pt-1.5 border-t border-[#1c1f27]">
                        <span className="truncate max-w-[130px]">{log.hwid || "sem hardware"}</span>
                        <span>{formatDateTime(log.createdAt)}</span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className="py-8 text-center text-sm text-[#8a8f98]">
                  Nenhum evento registrado ainda.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#222630]">
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToLicenses}
              className="w-full text-sm h-9 rounded-lg border-[#262a35] bg-[#14171f] text-[#ededed] hover:bg-[#1a1d27]"
            >
              Gerenciar Keys
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
