"use client"

import type React from "react"
import { ArrowRight } from "lucide-react"
import { KeyRound } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { Spinner } from "@/components/ui/spinner"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { api, ApiError } from "@/lib/api"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAlert } from "@/hooks/use-alert"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const alert = useAlert()
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await api.login(user, pass)

      if (response.token) {
        login(response.token)
        router.push("/dashboard")
      } else {
        alert.error("Erro de Login", "Retorno de login não contém token.")
      }
    } catch (error) {
      if (error instanceof ApiError) {
        // Mensagens mais claras para erros comuns
        if (error.status === 401 || error.status === 403) {
          alert.error("Credenciais inválidas", "Usuário ou senha incorretos. Verifique e tente novamente.")
        } else if (error.status === 0) {
          alert.error("Sem conexão", "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.")
        } else {
          alert.error("Erro de Login", error.message)
        }
      } else {
        alert.error("Erro de Login", "Ocorreu um erro inesperado. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-bg min-h-screen flex items-center justify-center p-4">
      {/* Glows decorativos de fundo */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-secondary/20 blur-[120px]" />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md border border-[#222630] bg-[#111318] shadow-2xl rounded-2xl">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#161e28] border border-[#202936] text-[#e2e8f0]">
            <KeyRound className="h-6 w-6" />
          </div>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user" className="text-xs text-[#8a8f98]">Usuário</Label>
              <Input
                id="user"
                name="username"
                type="text"
                placeholder="Digite seu usuário"
                autoComplete="username"
                autoFocus
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="h-10 bg-[#090a0d] border-[#222630] text-sm text-[#ededed] rounded-lg"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs text-[#8a8f98]">Senha</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Digite sua senha"
                autoComplete="current-password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="h-10 bg-[#090a0d] border-[#222630] text-sm text-[#ededed] rounded-lg"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition-colors shadow-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
