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
      <div className="relative">
        <div
          className={cn(
            "animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-border",
            sizeClasses[size],
          )}
        >
          <div className="h-full w-full rounded-full bg-background"></div>
        </div>
        <div
          className={cn(
            "absolute inset-0 animate-spin rounded-full border-2 border-transparent bg-gradient-to-l from-violet-500 to-cyan-500 bg-clip-border opacity-60",
            sizeClasses[size],
          )}
          style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
        >
          <div className="h-full w-full rounded-full bg-background"></div>
        </div>
      </div>
      {text && <p className="text-sm text-muted-foreground animate-pulse">{text}</p>}
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
