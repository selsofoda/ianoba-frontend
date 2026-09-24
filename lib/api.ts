const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"

export type ApiResponse<T = any> = {
  success?: boolean
  error?: string
  message?: string
  data?: T
  token?: string
  key?: string
} & (T extends object ? T : Record<string, any>)

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const baseUrl = API_BASE_URL.replace(/\/+$/, "") // Remove barras finais da base URL
  const cleanEndpoint = endpoint.replace(/^\/+/, "") // Remove barras iniciais do endpoint
  const url = `${baseUrl}/${cleanEndpoint}`

  const defaultHeaders: Record<string, string> = {}

  // Só adiciona Content-Type se houver body na requisição e não for FormData
  if (options.body && !(typeof FormData !== "undefined" && options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json"
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, config)

    let data: any
    const contentType = response.headers.get("content-type")

    if (contentType && contentType.includes("application/json")) {
      data = await response.json()
    } else {
      // Se não for JSON, pega o texto da resposta
      const textResponse = await response.text()

      // Para 404, cria uma mensagem de erro mais específica
      if (response.status === 404) {
        throw new ApiError(404, `Endpoint não encontrado: ${endpoint}. Verifique se a API suporta esta funcionalidade.`)
      }

      data = { error: `Resposta não-JSON recebida: ${textResponse}` }
    }

    if (!response.ok) {
      throw new ApiError(response.status, data.error || `HTTP ${response.status}`)
    }

    return data
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    // Erros de rede/conexão
    throw new ApiError(0, "Erro de conexão com o servidor")
  }
}

export const api = {
  // Authentication
  login: async (user: string, pass: string) => {
    return apiRequest<{ token: string }>("/login", {
      method: "POST",
      body: JSON.stringify({ user, pass }),
    })
  },

  // Keys management
  createKey: async (
    token: string,
    data: {
      username: string
      days: number
      product: string
      hwid?: string
      max_threads?: number
    },
  ) => {
    return apiRequest<{ key: string }>("/create_key", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: data.username,
        days: data.days,
        product: data.product,
        max_threads: data.max_threads || 999,
      }),
    })
  },

  renewKey: async (
    token: string,
    data: {
      username: string
      days: number
      product: string
    },
  ) => {
    return apiRequest("/renew_key", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        username: data.username,
        days: data.days,
        product: data.product,
      }),
    })
  },

  // List keys
  listKeys: async (
    token: string,
    filters?: {
      username?: string
      product?: string
    },
  ) => {
    const params = new URLSearchParams()
    if (filters?.username) params.append("username", filters.username)
    if (filters?.product) params.append("product", filters.product)

    const queryString = params.toString()
    const endpoint = queryString ? `/keys?${queryString}` : "/keys"

    return apiRequest<any[]>(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Reset HWID
  resetHwid: async (token: string, keyId: string) => {
    const params = new URLSearchParams()
    params.append("key", keyId)

    return apiRequest(`reset_hwid?${params.toString()}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Delete key
  deleteKey: async (token: string, keyId: string) => {
    const params = new URLSearchParams()
    params.append("key", keyId)

    return apiRequest(`delete_key?${params.toString()}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Telemetria & Dashboard Stats
  getStats: async (token: string) => {
    return apiRequest<{
      summary: {
        totalKeys: number
        activeKeys: number
        expiringKeys: number
        expiredKeys: number
        unboundKeys: number
        totalStarts: number
        totalActivations: number
        totalBlocked: number
        blockedHwid: number
        blockedExpired: number
        blockedInvalidKey: number
        totalProducts: number
      }
      activityChart: Array<{ date: string; iniciou: number; ativou: number; bloqueado: number }>
      recentLogs: Array<{
        _id: string
        action: string
        type: 'success' | 'warning' | 'error' | 'info'
        message: string
        username?: string
        product?: string
        key?: string
        hwid?: string
        ip?: string
        metadata?: Record<string, any>
        createdAt: string
      }>
      topProducts: Array<{ name: string; count: number }>
    }>("/stats", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Central de Logs
  getLogs: async (
    token: string,
    filters?: {
      page?: number
      limit?: number
      action?: string
      type?: string
      product?: string
      username?: string
      search?: string
    }
  ) => {
    const params = new URLSearchParams()
    if (filters?.page) params.append("page", String(filters.page))
    if (filters?.limit) params.append("limit", String(filters.limit))
    if (filters?.action && filters.action !== "ALL") params.append("action", filters.action)
    if (filters?.type && filters.type !== "ALL") params.append("type", filters.type)
    if (filters?.product && filters.product !== "ALL") params.append("product", filters.product)
    if (filters?.username) params.append("username", filters.username)
    if (filters?.search) params.append("search", filters.search)

    const queryString = params.toString()
    const endpoint = queryString ? `/logs?${queryString}` : "/logs"

    return apiRequest<{
      logs: Array<{
        _id: string
        action: string
        type: 'success' | 'warning' | 'error' | 'info'
        message: string
        username?: string
        product?: string
        key?: string
        hwid?: string
        ip?: string
        userAgent?: string
        metadata?: Record<string, any>
        createdAt: string
      }>
      total: number
      page: number
      limit: number
      totalPages: number
    }>(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  // Gerenciamento de Produtos
  listProducts: async (token: string) => {
    return apiRequest<Array<{
      _id: string
      name: string
      version: string
      changelog: string
      url: string
      updatedAt?: string
    }>>("/products", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  updateProduct: async (
    token: string,
    data: {
      product: string
      version: string
      changelog: string
      url?: string
    }
  ) => {
    return apiRequest("/update", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    })
  },

  deleteProduct: async (token: string, product: string) => {
    const params = new URLSearchParams()
    params.append("product", product)

    return apiRequest(`/delete_product?${params.toString()}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
  },

  uploadExecutable: async (token: string, file: File) => {
    const formData = new FormData()
    formData.append("file", file)

    return apiRequest<{
      success: boolean
      filename: string
      url: string
      size: number
    }>("/upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
  },
}

