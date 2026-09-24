"use client"

import { useState } from "react"
import { Box, Plus, RefreshCw, ExternalLink, GitBranch, FileText, CheckCircle2, Trash2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CopyButton } from "@/components/copy-button"
import { cn } from "@/lib/utils"

export interface ProductData {
  _id: string
  name: string
  version: string
  changelog: string
  url: string
  updatedAt?: string
}

interface ProductsViewProps {
  products: ProductData[]
  loading: boolean
  onOpenUpdateModal: (product?: ProductData) => void
  onDeleteProduct: (productName: string) => void
  onRefresh: () => void
}

export function ProductsView({
  products,
  loading,
  onOpenUpdateModal,
  onDeleteProduct,
  onRefresh
}: ProductsViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 border border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5 text-emerald-400" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">Produtos & Versões</h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gerencie as versões, downloads de executáveis (.exe) e ciclo de vida dos produtos
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="rounded-lg h-9 text-sm px-3.5 border-[#222630] hover:bg-[#181b22]"
            >
              <RefreshCw className={cn("h-4 w-4 mr-1.5", loading && "animate-spin text-white")} />
              Atualizar
            </Button>
            <Button
              onClick={() => onOpenUpdateModal()}
              size="sm"
              className="rounded-lg h-9 px-4 text-sm font-medium bg-violet-600 hover:bg-violet-500 text-white shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Novo / Atualizar Produto
            </Button>
          </div>
        </div>
      </div>

      {/* Grid de Produtos */}
      {products.length === 0 ? (
        <div className="rounded-xl p-16 text-center text-muted-foreground space-y-3 border border-[#222630] bg-[#111318]">
          <Box className="h-10 w-10 mx-auto opacity-30" />
          <p className="text-sm font-medium">Nenhum produto cadastrado no momento.</p>
          <Button
            onClick={() => onOpenUpdateModal()}
            size="sm"
            className="rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium text-sm h-9 px-4"
          >
            Cadastrar Primeiro Produto
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((prod) => (
            <div
              key={prod._id || prod.name}
              className="rounded-xl p-5 border border-[#222630] bg-[#111318] hover:border-[#3b404d] transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-lg bg-[#181b22] border border-[#222630] flex items-center justify-center text-emerald-400">
                      <Box className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white uppercase tracking-tight">{prod.name}</h3>
                      <span className="text-xs text-[#8a8f98] font-mono">
                        v{prod.version}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 text-xs font-mono font-medium px-2 py-0.5 rounded">
                    Ativo
                  </Badge>
                </div>

                {/* Changelog */}
                <div className="mt-4 rounded-lg bg-[#090a0d] p-3.5 border border-[#222630] text-xs space-y-1.5">
                  <span className="text-[11px] font-semibold text-[#8a8f98] flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Changelog da Versão:
                  </span>
                  <p className="text-[#ededed] leading-relaxed font-sans whitespace-pre-wrap line-clamp-3">
                    {prod.changelog || "Sem changelog informado."}
                  </p>
                </div>

                {/* URL de Download */}
                {prod.url && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="text-[#8a8f98]">Download:</span>
                    <a
                      href={prod.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:underline truncate flex-1 font-mono text-xs"
                    >
                      {prod.url}
                    </a>
                    <CopyButton value={prod.url} label="URL" className="h-6 w-6" />
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-[#222630] flex items-center gap-2">
                <Button
                  onClick={() => onOpenUpdateModal(prod)}
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-lg text-sm h-9 border-[#222630] hover:bg-[#181b22]"
                >
                  <GitBranch className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                  Atualizar
                </Button>
                <Button
                  onClick={() => onDeleteProduct(prod.name)}
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 rounded-lg text-[#8a8f98] hover:text-rose-400 hover:bg-rose-950/20"
                  title="Excluir produto"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
