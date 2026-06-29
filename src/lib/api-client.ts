/**
 * Centralized fetch wrapper for the BookVault REST API.
 * The browser relies on cookie-based auth, so every request includes credentials.
 */

const DEFAULT_API_BASE_URL = 'https://kopbnkassobook.runasp.net/restapi/v1.0'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
export const ASSET_BASE_URL =
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ??
  new URL(API_BASE_URL).origin

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  console.warn(
    `[api-client] NEXT_PUBLIC_API_BASE_URL is not set. Falling back to ${DEFAULT_API_BASE_URL}`,
  )
}

function buildApiUrl(path: string) {
  return `${API_BASE_URL.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`
}

export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T | null
  statusCode: number
  errors: string[] | Record<string, string[]> | string | null
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
        .flatMap((value) => (Array.isArray(value) ? value : []))
        .filter((value): value is string => typeof value === 'string')

      return {
        success: false,
        message: messages[0] ?? 'Validation failed.',
        data: null,
        statusCode: fallbackStatusCode,
        errors: errors as ApiResponse<T>['errors'],
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
      errors: null,
    }
  }

  return {
    success: false,
    message: 'Unexpected server response. Please try again.',
    data: null,
    statusCode: fallbackStatusCode,
    errors: null,
  }
}

export class ApiError extends Error {
  statusCode: number
  errors: ApiResponse<unknown>['errors']

  constructor(
    message: string,
    statusCode: number,
    errors: ApiResponse<unknown>['errors'] = null,
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errors = errors
  }
}

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown
}

function buildHeaders(headers: HeadersInit | undefined, hasBody: boolean, isFormData: boolean) {
  const resolvedHeaders: Record<string, string> = {
    Accept: 'application/json',
  }

  if (!isFormData && hasBody) {
    resolvedHeaders['Content-Type'] = 'application/json'
  }

  if (headers) {
    new Headers(headers).forEach((value, key) => {
      resolvedHeaders[key] = value
    })
  }

  return resolvedHeaders
}

export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const { body, headers, ...requestOptions } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const hasBody = body !== undefined

  const response = await fetch(buildApiUrl(path), {
    ...requestOptions,
    credentials: 'include',
    headers: buildHeaders(headers, hasBody, isFormData),
    body: isFormData
      ? body
      : hasBody
        ? JSON.stringify(body)
        : undefined,
  })

  let payload: ApiResponse<T> | null = null

  try {
    payload = normalizeApiResponse<T>(await response.json(), response.status)
  } catch {
    payload = null
  }

  if (!response.ok || !payload?.success) {
    throw new ApiError(
      payload?.message || 'Request failed. Please try again.',
      payload?.statusCode || response.status,
      payload?.errors ?? null,
    )
  }

  return payload
}

export async function apiRawFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { body, headers, ...requestOptions } = options
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  const hasBody = body !== undefined

  const response = await fetch(buildApiUrl(path), {
    ...requestOptions,
    credentials: 'include',
    headers: buildHeaders(headers, hasBody, isFormData),
    body: isFormData
      ? body
      : hasBody
        ? JSON.stringify(body)
        : undefined,
  })

  return response.json().catch(() => null) as Promise<T>
}
