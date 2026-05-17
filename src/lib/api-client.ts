/**
 * Centralised fetch wrapper for the BookVault REST API.
 * – Reads NEXT_PUBLIC_API_BASE_URL from .env.local
 * – Attaches Bearer token (stored in localStorage as 'bv_access_token')
 * – Forwards HttpOnly refresh-token cookie automatically (credentials: 'include')
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
export const ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ??
  (API_BASE_URL ? new URL(API_BASE_URL).origin : '')

if (!API_BASE_URL) {
  console.warn('[api-client] NEXT_PUBLIC_API_BASE_URL is not set in .env.local')
}

/** Matches ApiResponse<T> returned by every backend endpoint */
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T | null
  statusCode: number
}

function normalizeApiResponse<T>(payload: unknown, fallbackStatusCode: number): ApiResponse<T> {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'message' in payload &&
    'statusCode' in payload
  ) {
    return payload as ApiResponse<T>
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const errors = record.errors

    if (errors && typeof errors === 'object') {
      const messages = Object.values(errors as Record<string, unknown[]>)
        .flatMap((value) => Array.isArray(value) ? value : [])
        .filter((value): value is string => typeof value === 'string')

      return {
        success: false,
        message: messages[0] ?? 'Validation failed.',
        data: null,
        statusCode: fallbackStatusCode,
      }
    }

    const message =
      (typeof record.message === 'string' && record.message) ||
      (typeof record.title === 'string' && record.title) ||
      (typeof record.Message === 'string' && record.Message) ||
      'Request failed.'

    return {
      success: false,
      message,
      data: null,
      statusCode: fallbackStatusCode,
    }
  }

  return {
    success: false,
    message: 'Unexpected server response. Please try again.',
    data: null,
    statusCode: fallbackStatusCode,
  }
}

// ── Token helpers ────────────────────────────────────────────────────────────

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('bv_access_token')
}

export function saveAccessToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('bv_access_token', token)
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('bv_access_token')
}

let refreshPromise: Promise<boolean> | null = null

async function tryRefreshToken(): Promise<boolean> {
  if (!API_BASE_URL) return false

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await fetch(`${API_BASE_URL}/Auth/RefreshToken`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      const json: ApiResponse<{ accessToken: string } | null> = await response.json().catch(() => ({
        success: false,
        message: 'Unable to refresh session.',
        data: null,
        statusCode: response.status,
      }))

      if (response.ok && json.success && json.data?.accessToken) {
        saveAccessToken(json.data.accessToken)
        return true
      }

      clearAccessToken()
      return false
    })().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise
}

function buildHeaders(options: RequestInit, token: string | null) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> | undefined),
  }

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  return headers
}

// ── Core fetch wrapper ───────────────────────────────────────────────────────

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  hasRetried = false,
): Promise<ApiResponse<T>> {
  const token = getAccessToken()
  const headers = buildHeaders(options, token)

  const response = await fetch(`${API_BASE_URL}/${path}`, {
    ...options,
    headers,
    credentials: 'include', // sends & receives the HttpOnly refreshToken cookie
  })

  // The backend always returns JSON even on error codes
  const rawPayload = await response.json().catch(() => null)
  const json = normalizeApiResponse<T>(rawPayload, response.status)

  if (
    !hasRetried &&
    response.status === 401 &&
    path !== 'Auth/Login' &&
    path !== 'Auth/RefreshToken'
  ) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      return apiFetch<T>(path, options, true)
    }
  }

  return json
}

export async function apiRawFetch<T>(
  path: string,
  options: RequestInit = {},
  hasRetried = false,
): Promise<T> {
  const token = getAccessToken()
  const headers = buildHeaders(options, token)

  const response = await fetch(`${API_BASE_URL}/${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (
    !hasRetried &&
    response.status === 401 &&
    path !== 'Auth/Login' &&
    path !== 'Auth/RefreshToken'
  ) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      return apiRawFetch<T>(path, options, true)
    }
  }

  return response.json()
}
