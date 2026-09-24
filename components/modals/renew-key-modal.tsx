"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { api, ApiError } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface RenewKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  initialData?: {
    key?: string
    username?: string
    product?: string
  } | null
  onSuccess: () => void
}

const QUICK_DAYS = [7, 30, 90, 180, 365]

export function RenewKeyModal({
  open,
  onOpenChange,
  token,
  initialData,
  onSuccess
}: RenewKeyModalProps) {
  const [username, setUsername] = useState("")
  const [product, setProduct] = useState("")
  const [days, setDays] = useState("30")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      if (initialData.username) setUsername(initialData.username)
      if (initialData.product) setProduct(initialData.product)
    }
  }, [initialData, open])

  const handleRenew = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !product || !days) {
      toast.warning("Preencha todos os campos obrigatórios")
      return
    }

    try {
      setLoading(true)
      const res = await api.renewKey(token, {
        username: username.toUpperCase().trim(),
        product: product.toUpperCase().trim(),
        days: Number(days)
      })

      if (res && res.error) {
        toast.error(res.error)
      } else {
        toast.success(`Key renovada em +${days} dias!`)
        onSuccess()
        onOpenChange(false)
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao renovar key")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Renovar Key</DialogTitle>
          <DialogDescription className="text-xs">
            Adicione mais dias de validade à key do usuário
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRenew} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Usuário *</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              placeholder="Ex: FULANO"
              className="h-10 rounded-xl bg-background/60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Produto *</Label>
            <Input
              value={product}
              onChange={(e) => setProduct(e.target.value.toUpperCase())}
              placeholder="Ex: CADASTRO"
              className="h-10 rounded-xl bg-background/60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Dias a Adicionar *</Label>
            <Input
              type="number"
              min={1}
              max={3650}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="h-10 rounded-xl bg-background/60"
              required
            />
          </div>

          {/* Quick days pills */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {QUICK_DAYS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(String(d))}
                className={cn(
                  "px-2.5 py-1 text-[11px] rounded-lg border transition-colors",
                  days === String(d)
                    ? "bg-violet-600 text-white border-violet-500 font-semibold"
                    : "bg-[#161e28] border-[#202936] text-[#8896a8] hover:text-[#e2e8f0]"
                )}
              >
                +{d} dias
              </button>
            ))}
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg border-[#202936] hover:bg-[#161e28] text-sm h-10">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm h-10 px-4 transition-colors shadow-sm"
            >
              {loading && <Spinner className="h-4 w-4 mr-2" />}
              Confirmar Renovação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
