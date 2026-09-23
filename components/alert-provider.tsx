"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAlert, getAlertIcon, getAlertIconBox } from "@/hooks/use-alert"
import { cn } from "@/lib/utils"

export function AlertProvider() {
  const { isOpen, type, title, message, onConfirm, onCancel, confirmText, cancelText, showCancel, destructive, hideAlert } =
    useAlert()

  const Icon = getAlertIcon(type)

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    hideAlert()
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    }
    hideAlert()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && hideAlert()}>
      <AlertDialogContent className="glass-card gap-0 rounded-2xl border-0 p-6 sm:p-7">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
              getAlertIconBox(type, destructive),
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <AlertDialogTitle className="text-left text-lg font-semibold tracking-tight">{title}</AlertDialogTitle>
            {message && (
              <AlertDialogDescription className="text-left text-sm leading-relaxed whitespace-pre-line">
                {message}
              </AlertDialogDescription>
            )}
          </div>
        </div>
        <AlertDialogFooter className="mt-6 flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:space-x-2">
          {showCancel && (
            <AlertDialogCancel onClick={handleCancel} className="mt-0 bg-background/60">
              {cancelText}
            </AlertDialogCancel>
          )}
          <AlertDialogAction
            onClick={handleConfirm}
            className={cn(
              destructive &&
                "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive hover:brightness-110",
            )}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
