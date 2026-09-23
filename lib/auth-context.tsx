"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AuthContextType {
  token: string | null
  login: (token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token")
      setToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const login = (newToken: string) => {
    setToken(newToken)
    if (typeof window !== "undefined") {
      localStorage.setItem("token", newToken)
    }
  }

  const logout = () => {
    setToken(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
    }
  }

  return <AuthContext.Provider value={{ token, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
