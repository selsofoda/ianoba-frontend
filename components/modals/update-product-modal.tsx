"use client"

import { useState, useEffect, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Upload, CheckCircle2, FileCode } from "lucide-react"
import { api, ApiError } from "@/lib/api"
import { toast } from "sonner"
import type { ProductData } from "@/components/products-view"

interface UpdateProductModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  token: string
  product?: ProductData | null
  onSuccess: () => void
}

export function UpdateProductModal({
  open,
  onOpenChange,
  token,
  product,
  onSuccess
}: UpdateProductModalProps) {
  const [name, setName] = useState("")
  const [version, setVersion] = useState("")
  const [changelog, setChangelog] = useState("")
  const [url, setUrl] = useState("")
  const [isUrlManual, setIsUrlManual] = useState(false)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const buildAutoUrl = (pName: string, pVersion: string) => {
    if (!pName.trim()) return ""
    const cleanName = pName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
    const cleanVer = pVersion.trim() ? `-v${pVersion.trim()}` : ""
    const base = process.env.NEXT_PUBLIC_DOWNLOAD_BASE || "https://ianobacloud.com/files"
    return `${base}/${cleanName}${cleanVer}.exe`
  }

  useEffect(() => {
    if (product) {
      setName(product.name || "")
      setVersion(product.version || "")
      setChangelog(product.changelog || "")
      setUrl(product.url || "")
      setIsUrlManual(Boolean(product.url))
    } else {
      setName("")
      setVersion("1.0.0")
      setChangelog("")
      setUrl("")
      setIsUrlManual(false)
    }
    setUploadedFileName(null)
  }, [product, open])

  const handleNameChange = (val: string) => {
    const upper = val.toUpperCase()
    setName(upper)
    if (!isUrlManual) {
      setUrl(buildAutoUrl(upper, version))
    }
  }

  const handleVersionChange = (val: string) => {
    setVersion(val)
    if (!isUrlManual) {
      setUrl(buildAutoUrl(name, val))
    }
  }

  const handleResetAutoUrl = () => {
    setIsUrlManual(false)
    setUrl(buildAutoUrl(name, version))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploading(true)
      const res = await api.uploadExecutable(token, file)
      if (res && res.url) {
        setUrl(res.url)
        setIsUrlManual(true)
        setUploadedFileName(file.name)
        toast.success(`Upload de "${file.name}" realizado com sucesso!`)
      } else {
        toast.error("Erro ao receber URL do upload")
      }
    } catch (err: any) {
      toast.error(err.message || "Falha no upload do executável")
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !version || !changelog) {
      toast.warning("Nome, versão e changelog são obrigatórios")
      return
    }

    try {
      setLoading(true)
      await api.updateProduct(token, {
        product: name.toUpperCase().trim(),
        version: version.trim(),
        changelog: changelog.trim(),
        url: url.trim() || undefined
      })

      toast.success(`Produto ${name.toUpperCase()} atualizado para v${version}!`)
      onSuccess()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar produto")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-border/60 bg-background/95 backdrop-blur-2xl max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {product ? `Atualizar ${product.name}` : "Novo Produto"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Lance uma nova versão, faça upload do .exe ou cadastre novo produto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Nome do Produto *</Label>
            <Input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ex: CADASTRO"
              disabled={Boolean(product)}
              className="h-10 rounded-xl bg-background/60"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Versão *</Label>
            <Input
              value={version}
              onChange={(e) => handleVersionChange(e.target.value)}
              placeholder="Ex: 1.0.5"
              className="h-10 rounded-xl bg-background/60 font-mono"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Changelog das Mudanças *</Label>
            <Textarea
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              placeholder="Ex: - Corrigido erro de inicialização&#10;- Melhorada velocidade de verificação"
              rows={3}
              className="rounded-xl bg-background/60 text-xs"
              required
            />
          </div>

          {/* Upload de Executável (.exe) */}
          <div className="space-y-2 pt-1 border-t border-border/40">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Binário / Executável (.exe)</Label>
              {uploadedFileName && (
                <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {uploadedFileName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".exe,.zip,.rar,.tar.gz,.bin"
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full rounded-lg h-10 border-dashed border-[#222630] bg-[#14171f] hover:border-violet-500/60 hover:text-white text-sm transition-colors"
              >
                {uploading ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Enviando executável...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2 text-violet-400" />
                    Fazer Upload de novo .exe
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">URL de Download do Executável</Label>
              {isUrlManual && (
                <button
                  type="button"
                  onClick={handleResetAutoUrl}
                  className="text-[11px] text-violet-400 hover:text-violet-300 hover:underline"
                >
                  Restaurar automático
                </button>
              )}
            </div>
            <Input
              value={url}
              onChange={(e) => {
                setUrl(e.target.value)
                setIsUrlManual(true)
              }}
              placeholder="https://ianobacloud.com/files/app.exe"
              className="h-10 rounded-lg bg-[#090a0d] border-[#222630] font-mono text-sm text-[#ededed]"
            />
            <p className="text-[11px] text-muted-foreground">
              {isUrlManual ? "URL manual/personalizada definida." : "Preenchida automaticamente pelo nome e versão."}
            </p>
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-lg border-[#222630] hover:bg-[#181b22] text-sm h-10">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || uploading}
              className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm h-10 px-4 transition-colors shadow-sm"
            >
              {loading && <Spinner className="h-4 w-4 mr-2" />}
              Salvar Atualização
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
