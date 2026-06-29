import { apiFetch, apiRawFetch, type ApiResponse } from '@/src/lib/api-client'

export type { ApiResponse }

export function apiRequest<T>(path: string, options: RequestInit = {}) {
  return apiFetch<T>(path, options)
}

export function apiRawRequest<T>(path: string, options: RequestInit = {}) {
  return apiRawFetch<T>(path, options)
}
