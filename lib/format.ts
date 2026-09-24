import { differenceInCalendarDays, format } from "date-fns"
import { ptBR } from "date-fns/locale"

export type KeyStatus = "expired" | "expiring" | "active" | "unknown"

export interface KeyStatusInfo {
  status: KeyStatus
  label: string
  /** Classes Tailwind para o Badge conforme o status */
  className: string
  /** Quantidade de dias restantes (negativo = expirada) */
  daysLeft: number
}

/**
 * Calcula o status de uma key a partir da data de expiração.
 * - Expirada: data já passou
 * - Expirando: vence em 7 dias ou menos
 * - Ativa: vence em mais de 7 dias
 */
export function getKeyStatus(expireAt: string | Date): KeyStatusInfo {
  const date = new Date(expireAt)
  if (isNaN(date.getTime())) {
    return { status: "unknown", label: "Data inválida", className: "bg-muted text-muted-foreground border-transparent", daysLeft: 0 }
  }

  const daysLeft = differenceInCalendarDays(date, new Date())

  if (daysLeft < 0) {
    return { status: "expired", label: "Expirada", className: "bg-rose-500/15 text-rose-400 border-rose-500/30 font-medium", daysLeft }
  }
  if (daysLeft <= 7) {
    return {
      status: "expiring",
      label: daysLeft === 0 ? "Expira hoje" : `Expira em ${daysLeft}d`,
      className: "bg-amber-500/15 text-amber-400 border-amber-500/30 font-medium",
      daysLeft,
    }
  }
  return { status: "active", label: "Ativa", className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-medium", daysLeft }
}

/** Formata data/hora no padrão brasileiro, ex.: 22/09/2026 14:30 */
export function formatDateTime(value: string | Date): string {
  const date = new Date(value)
  if (isNaN(date.getTime())) return "—"
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR })
}

/** Formata apenas a data no padrão brasileiro */
export function formatDate(value: string | Date): string {
  const date = new Date(value)
  if (isNaN(date.getTime())) return "—"
  return format(date, "dd/MM/yyyy", { locale: ptBR })
}

/** Texto amigável de expiração, ex.: "vence em 12 dias" / "expirou há 3 dias" */
export function getExpirationText(expireAt: string | Date): string {
  const { status, daysLeft } = getKeyStatus(expireAt)
  switch (status) {
    case "expired":
      return `expirou há ${Math.abs(daysLeft)} ${Math.abs(daysLeft) === 1 ? "dia" : "dias"}`
    case "expiring":
      if (daysLeft === 0) return "vence hoje"
      return `vence em ${daysLeft} ${daysLeft === 1 ? "dia" : "dias"}`
    case "active":
      return `vence em ${daysLeft} dias`
    default:
      return ""
  }
}

/**
 * Copia texto para a área de transferência com fallback para navegadores
 * sem Clipboard API (ou em contextos não seguros como http://).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // Fallback legado
    const textarea = document.createElement("textarea")
    textarea.value = text
    textarea.style.position = "fixed"
    textarea.style.opacity = "0"
    document.body.appendChild(textarea)
    textarea.select()
    const ok = document.execCommand("copy")
    document.body.removeChild(textarea)
    return ok
  } catch {
    return false
  }
}