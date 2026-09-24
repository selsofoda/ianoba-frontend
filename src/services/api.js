// src/services/api.js

/**
 * fetchWithAuth - função auxiliar para requisições usando token JWT.
 * @param {string} token - token JWT do usuário
 * @param {string} endpoint - ex: "/keys", "/reset_hwid?key=abc"
 * @param {object} options - objeto do fetch (method, headers, body, etc.)
 */
export async function fetchWithAuth(token, endpoint, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"
  const url = `${baseUrl}${endpoint}`

  // Garante que o objeto "headers" exista
  const headers = options.headers || {}

  // Se houver token, adiciona no Authorization
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  // Faz o fetch
  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Se quiser tratar status 401 / 403 etc.:
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token")
      window.location.href = "/login"
    }
    return
  }

  // Retorna json (ou erro).
  const data = await response.json()
  return data
}
