"use client"

import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { CopyButton } from "@/components/copy-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { api, ApiError } from "@/lib/api"
import { useAlert } from "@/hooks/use-alert"
import { toast } from "sonner"
import { copyToClipboard } from "@/lib/format"
import { cn } from "@/lib/utils"

const QUICK_DAYS = [7, 30, 90, 180, 365]

export default function CreateKeyPage() {
  const router = useRouter()
  const { token } = useAuth()
  const alert = useAlert()
  const [username, setUsername] = useState("")
  const [days, setDays] = useState("")
  const [product, setProduct] = useState("")
  const [maxThreads, setMaxThreads] = useState("999")
  const [loading, setLoading] = useState(false)
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [keyCopied, setKeyCopied] = useState(false)

  const daysNumber = Number.parseInt(days, 10)
  const daysInvalid = days !== "" && (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 3650)

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !days || !product || !maxThreads) {
      alert.warning("Campos Obrigatórios", "Preencha todos os campos obrigatórios.")
      return
    }

    if (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 3650) {
      alert.warning("Duração inválida", "Informe uma duração entre 1 e 3650 dias.")
      return
    }

    if (!token) {
      alert.error("Erro de Autenticação", "Token de autenticação não encontrado.")
      return
    }

    try {
      setLoading(true)

      const response = await api.createKey(token, {
        username,
        days: daysNumber,
        product,
        max_threads: Number.parseInt(maxThreads, 10),
      })

      if (response.key) {
        // Mostra a key em um dialog com botão de copiar antes de voltar ao dashboard
        setCreatedKey(response.key)
      } else {
        alert.error("Erro na Criação", "Resposta da API não contém a key criada.")
      }
    } catch (error) {
      if (error instanceof ApiError) {
        alert.error("Erro ao Criar Key", error.message)
      } else {
        alert.error("Erro Inesperado", "Não foi possível criar a key.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCopyCreatedKey = async () => {
    if (!createdKey) return
    const ok = await copyToClipboard(createdKey)
    if (ok) {
      setKeyCopied(true)
      setTimeout(() => setKeyCopied(false), 2000)
      toast.success("Key copiada para a área de transferência")
    } else {
      toast.error("Não foi possível copiar a key")
    }
  }

  const handleGoToDashboard = () => {
    setCreatedKey(null)
    router.push("/dashboard")
  }

  return (
    <AuthGuard>
      <div className="app-bg min-h-screen">
        <AppHeader title="Criar Nova Key" showNav={false} />

        <main className="container mx-auto px-4 py-8">
          <Card className="glass-card max-w-2xl mx-auto border-0">
            <CardHeader>
              <CardTitle>Informações da Nova Key</CardTitle>
              <CardDescription>
                Preencha os dados abaixo para criar uma nova key. Campos com * são obrigatórios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateKey} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Usuário *</Label>
                    <Input
                      id="username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toUpperCase())}
                      placeholder="Ex: FULANO"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product">Produto *</Label>
                    <Input
                      id="product"
                      type="text"
                      value={product}
                      onChange={(e) => setProduct(e.target.value.toUpperCase())}
                      placeholder="Ex: CADASTRO"
                      autoComplete="off"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="days">Duração em dias *</Label>
                    <Input
                      id="days"
                      type="number"
                      min={1}
                      max={3650}
                      value={days}
                      onChange={(e) => setDays(e.target.value)}
                      placeholder="Ex: 30"
                      aria-invalid={daysInvalid}
                      required
                    />
                    {/* Atalhos de duração para evitar digitação */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {QUICK_DAYS.map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDays(String(d))}
                          className={cn(
                            "px-3 py-1 text-xs rounded-full border transition-colors hover:bg-accent hover:text-accent-foreground",
                            days === String(d) &&
                              "bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground",
                          )}
                        >
                          {d} dias
                        </button>
                      ))}
                    </div>
                    {daysInvalid && <p className="text-xs text-destructive">Informe um valor entre 1 e 3650 dias.</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxThreads">Máximo de Threads *</Label>
                    <Input
                      id="maxThreads"
                      type="number"
                      min={1}
                      value={maxThreads}
                      onChange={(e) => setMaxThreads(e.target.value)}
                      placeholder="Ex: 999"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Criando...
                      </>
                    ) : (
                      "Criar Key"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>

        {/* Dialog de sucesso: permite copiar a key criada antes de voltar */}
        <AlertDialog open={Boolean(createdKey)} onOpenChange={(open) => !open && handleGoToDashboard()}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Key criada com sucesso!</AlertDialogTitle>
              <AlertDialogDescription>
                Usuário: <span className="font-medium text-foreground">{username}</span>
                <br />
                Produto: <span className="font-medium text-foreground">{product}</span>
                <br />
                Duração: <span className="font-medium text-foreground">{days} dias</span>
                <br />
                Máx. threads: <span className="font-medium text-foreground">{maxThreads}</span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2">
              <code className="flex-1 break-all font-mono text-sm">{createdKey}</code>
              <CopyButton value={createdKey ?? ""} label="Key" className="h-8 w-8" />
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={handleGoToDashboard}>Ir para o dashboard</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  )
}
