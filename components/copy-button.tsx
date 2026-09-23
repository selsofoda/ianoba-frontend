"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/format"
import { cn } from "@/lib/utils"

interface CopyButtonProps {
  /** Texto que será copiado (key ou hwid) */
  value: string
  /** Rótulo usado no toast, ex.: "Key" ou "HWID" */
  label?: string
  className?: string
  title?: string
}

/**
 * Botão de copiar com feedback: toast de confirmação e
 * ícone que muda para um check temporariamente.
 * Usa fallback para contextos sem Clipboard API.
 */
export function CopyButton({ value, label = "Key", className, title }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const ok = await copyToClipboard(value)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success(`${label} copiada para a área de transferência`)
    } else {
      toast.error(`Não foi possível copiar a ${label.toLowerCase()}`)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      title={title ?? `Copiar ${label.toLowerCase()}`}
      aria-label={title ?? `Copiar ${label.toLowerCase()}`}
      className={cn("h-6 w-6 p-0 shrink-0", className)}
      onClick={(e) => {
        e.stopPropagation()
        handleCopy()
      }}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
    </Button>
  )
}