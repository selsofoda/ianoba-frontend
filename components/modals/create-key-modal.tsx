"use client"

import { useState } from "react"
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
import { CopyButton } from "@/components/copy-button"
import { api, ApiError } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CreateKeyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  onSuccess: () => void
}

const QUICK_DAYS = [7, 30, 90, 180, 365]

export function CreateKeyModal({ open, onOpenChange, token, onSuccess }: CreateKeyModalProps) {
  const [username, setUsername] = useState("")
  const [days, setDays] = useState("30")
  const [product, setProduct] = useState("")
  const [maxThreads, setMaxThreads] = useState("5")
  const [loading, setLoading] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !days || !product) {
      toast.warning("Preencha todos os campos obrigatórios")
      return
    }

    try {
      setLoading(true)
      const res = await api.createKey(token, {
        username: username.toUpperCase().trim(),
        days: Number(days),
        product: product.toUpperCase().trim(),
        max_threads: Number(maxThreads) || 5
      })

      if (res && res.key) {
        setCreatedKey(res.key)
        toast.success("Key criada com sucesso!")
        onSuccess()
      } else {
        toast.error("Resposta da API não continha a chave gerada")
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar key")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setCreatedKey(null)
    setUsername("")
    setProduct("")
    setDays("30")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Emitir Nova Key</DialogTitle>
          <DialogDescription className="text-xs">
            Crie uma nova key e defina a validade e limites do cliente
          </DialogDescription>
        </DialogHeader>

        {createdKey ? (
          <div className="space-y-4 py-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center">
              <span className="text-xs font-semibold text-emerald-400 block mb-1">Key Gerada com Sucesso</span>
              <p className="text-xs text-muted-foreground">
                Para o usuário <span className="font-bold text-foreground">{username}</span> ({product})
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-muted/30 p-3 flex items-center gap-2">
              <code className="text-xs font-mono truncate flex-1 font-bold">{createdKey}</code>
              <CopyButton value={createdKey} label="Chave" className="h-8 w-8" />
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full rounded-xl">
                Concluir
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Usuário / Identificador *</Label>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Duração (Dias) *</Label>
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

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Máx. Threads *</Label>
                <Input
                  type="number"
                  min={1}
                  max={999}
                  value={maxThreads}
                  onChange={(e) => setMaxThreads(e.target.value)}
                  className="h-10 rounded-xl bg-background/60"
                  required
                />
              </div>
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
                  {d} dias
                </button>
              ))}
            </div>

            <DialogFooter className="pt-3 gap-2">
              <Button type="button" variant="outline" onClick={handleClose} className="rounded-lg border-[#202936] hover:bg-[#161e28] text-sm h-10">
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm h-10 px-4 transition-colors shadow-sm"
              >
                {loading && <Spinner className="h-4 w-4 mr-2" />}
                Emitir Key
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
