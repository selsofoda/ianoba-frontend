"use client"

import { Badge } from "@/components/ui/badge"
import { getKeyStatus } from "@/lib/format"
import { cn } from "@/lib/utils"

interface KeyStatusBadgeProps {
  expireAt: string | Date
  className?: string
}

/**
 * Badge visual do status da key (Ativa / Expira em Xd / Expirada),
 * calculado a partir da data de expiração.
 */
export function KeyStatusBadge({ expireAt, className }: KeyStatusBadgeProps) {
  const info = getKeyStatus(expireAt)

  return (
    <Badge variant="outline" className={cn(info.className, "whitespace-nowrap", className)}>
      {info.label}
    </Badge>
  )
}