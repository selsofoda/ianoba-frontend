"use client"

import { create } from "zustand"
import { AlertCircle, CheckCircle, XCircle, Info } from "lucide-react"

export type AlertType = "success" | "error" | "warning" | "info"

interface AlertState {
  isOpen: boolean
  type: AlertType
  title: string
  message: string
  onConfirm?: () => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  /** Estiliza o botão de confirmação como ação destrutiva (vermelho) */
  destructive?: boolean
}

interface ConfirmOptions {
  destructive?: boolean
  confirmText?: string
  cancelText?: string
}

interface AlertStore extends AlertState {
  showAlert: (alert: Omit<AlertState, "isOpen">) => void
  hideAlert: () => void
  confirm: (title: string, message: string, onConfirm: () => void, options?: ConfirmOptions) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

export const useAlert = create<AlertStore>((set) => ({
  isOpen: false,
  type: "info",
  title: "",
  message: "",
  onConfirm: undefined,
  onCancel: undefined,
  confirmText: "OK",
  cancelText: "Cancelar",
  showCancel: false,
  destructive: false,

  showAlert: (alert) => set({ destructive: false, ...alert, isOpen: true }),

  hideAlert: () =>
    set({
      isOpen: false,
      onConfirm: undefined,
      onCancel: undefined,
      destructive: false,
    }),

  confirm: (title, message, onConfirm, options) =>
    set({
      isOpen: true,
      type: "warning",
      title,
      message,
      onConfirm,
      confirmText: options?.confirmText ?? "Confirmar",
      cancelText: options?.cancelText ?? "Cancelar",
      showCancel: true,
      destructive: options?.destructive ?? false,
    }),

  success: (title, message = "") =>
    set({
      isOpen: true,
      type: "success",
      title,
      message,
      confirmText: "OK",
      showCancel: false,
    }),

  error: (title, message = "") =>
    set({
      isOpen: true,
      type: "error",
      title,
      message,
      confirmText: "OK",
      showCancel: false,
    }),

  warning: (title, message = "") =>
    set({
      isOpen: true,
      type: "warning",
      title,
      message,
      confirmText: "OK",
      showCancel: false,
    }),

  info: (title, message = "") =>
    set({
      isOpen: true,
      type: "info",
      title,
      message,
      confirmText: "OK",
      showCancel: false,
    }),
}))

export const getAlertIcon = (type: AlertType) => {
  switch (type) {
    case "success":
      return CheckCircle
    case "error":
      return XCircle
    case "warning":
      return AlertCircle
    case "info":
    default:
      return Info
  }
}

export const getAlertColor = (type: AlertType) => {
  switch (type) {
    case "success":
      return "text-green-600"
    case "error":
      return "text-red-600"
    case "warning":
      return "text-yellow-600"
    case "info":
    default:
      return "text-blue-600"
  }
}

/** Classes Tailwind para o quadrado colorido do ícone no dialog */
export const getAlertIconBox = (type: AlertType, destructive?: boolean) => {
  if (destructive) {
    return "bg-destructive/15 text-destructive"
  }
  switch (type) {
    case "success":
      return "bg-primary/15 text-primary"
    case "error":
      return "bg-destructive/15 text-destructive"
    case "warning":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400"
    case "info":
    default:
      return "bg-secondary/15 text-secondary"
  }
}
