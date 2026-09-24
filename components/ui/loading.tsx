import { cn } from "@/lib/utils"

interface LoadingProps {
  size?: "sm" | "md" | "lg"
  className?: string
  text?: string
}

export function Loading({ size = "md", className, text }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-[#222630] border-t-white",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-xs text-muted-foreground font-mono">{text}</p>}
    </div>
  )
}

export function LoadingButton({ children, isLoading, ...props }: any) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loading size="sm" />
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  )
}
