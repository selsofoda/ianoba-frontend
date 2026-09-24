"use client"

import type React from "react"
import { AuthGuard } from "@/components/auth-guard"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useAlert } from "@/hooks/use-alert"
import { api, ApiError } from "@/lib/api"
import { cn } from "@/lib/utils"

const QUICK_DAYS = [7, 30, 90, 180, 365]

export default function RenewKeyPage() {
  const router = useRouter()
  const { token } = useAuth()
  const alert = useAlert()
  const [username, setUsername] = useState("")
  const [days, setDays] = useState("")
  const [product, setProduct] = useState("")
  const [loading, setLoading] = useState(false)

  const daysNumber = Number.parseInt(days, 10)
  const daysInvalid = days !== "" && (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 3650)

  const handleRenewKey = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username || !days || !product) {
      alert.warning("Campos Obrigatórios", "Preencha todos os campos obrigatórios.")
      return
    }

    if (isNaN(daysNumber) || daysNumber < 1 || daysNumber > 3650) {
      alert.warning("Duração inválida", "Informe uma quantidade de dias entre 1 e 3650.")
      return
    }

    alert.confirm("Confirmar Renovação", `Deseja adicionar ${days} dias para o usuário "${username}" (${product})?`, async () => {
      try {
        setLoading(true)

        const response = await api.renewKey(token!, {
          username,
          days: daysNumber,
          product,
        })

        if (response.error) {
          if (response.error.includes("Nenhuma key encontrada")) {
            alert.error(
              "Usuário Não Encontrado",
              `Não foi encontrada nenhuma key ativa para o usuário "${username}" com o produto "${product}".\n\nVerifique se:\n• O nome do usuário está correto\n• O produto está correto\n• O usuário possui uma key ativa`,
            )
          } else {
            alert.error("Erro na Renovação", response.error)
          }
        } else {
          alert.success("Key Renovada!", `Usuário: ${username}\nProduto: ${product}\nDias adicionados: ${days}`)
          router.push("/dashboard")
        }
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 404) {
            alert.error(
              "Usuário Não Encontrado",
              `Não foi encontrada nenhuma key para o usuário "${username}" com o produto "${product}".\n\nVerifique se os dados estão corretos e se o usuário possui uma key ativa no sistema.`,
            )
          } else if (error.message?.includes("Nenhuma key encontrada")) {
            alert.error(
              "Key Não Encontrada",
              `O usuário "${username}" não possui keys ativas para o produto "${product}".\n\nVerifique se:\n• O nome do usuário está correto\n• O produto está correto\n• A key não expirou`,
            )
          } else {
            alert.error("Erro Inesperado", error.message || "Não foi possível renovar a key.")
          }
        } else {
          alert.error("Erro Inesperado", "Não foi possível renovar a key.")
        }
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <AuthGuard>
      <div className="app-bg min-h-screen">
        <AppHeader title="Renovar Key" showNav={false} />

        <main className="container mx-auto px-4 py-8">
          <Card className="glass-card max-w-2xl mx-auto border-0">
            <CardHeader>
              <CardTitle>Renovar Key Existente</CardTitle>
              <CardDescription>
                Informe o usuário e o produto para adicionar mais dias à key existente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRenewKey} className="space-y-4">
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
                    placeholder="Ex: LIGADOR"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="days">Quantidade de dias para renovar *</Label>
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

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Renovando...
                      </>
                    ) : (
                      "Renovar Key"
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                    Voltar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    </AuthGuard>
  )
}
