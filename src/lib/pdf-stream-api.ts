import { API_BASE_URL, apiRawFetch, type ApiResponse } from './api-client'

export interface PdfReadTokenPayload {
  token?: string | null
  expiresAt?: string | null
  totalPages?: number | null
  Token?: string | null
  ExpiresAt?: string | null
  TotalPages?: number | null
}

export interface PdfReadTokenResult {
  success: boolean
  token: string | null
  expiresAt: string | null
  totalPages: number | null
  message: string
}

function normalizePdfReadTokenPayload(payload: PdfReadTokenPayload | null | undefined): PdfReadTokenResult {
  const token = payload?.token ?? payload?.Token ?? null
  const expiresAt = payload?.expiresAt ?? payload?.ExpiresAt ?? null
  const totalPages = payload?.totalPages ?? payload?.TotalPages ?? null

  return {
    success: Boolean(token),
    token,
    expiresAt,
    totalPages,
    message: token ? 'Reader token created.' : 'Could not open this book for reading.',
  }
}

function isApiResponse<T>(payload: unknown): payload is ApiResponse<T> {
  return Boolean(
    payload &&
      typeof payload === 'object' &&
      'success' in payload &&
      'message' in payload &&
      'statusCode' in payload,
  )
}

export async function requestPdfReadTokenApi(bookId: number): Promise<PdfReadTokenResult> {
  const response = await apiRawFetch<ApiResponse<PdfReadTokenPayload> | PdfReadTokenPayload>(
    `PdfStream/RequestToken?bookId=${bookId}`,
  )

  if (isApiResponse<PdfReadTokenPayload>(response)) {
    const normalized = normalizePdfReadTokenPayload(response.data)
    return {
      ...normalized,
      success: response.success && normalized.success,
      message: response.message || normalized.message,
    }
  }

  return normalizePdfReadTokenPayload(response)
}

export const getPdfReadUrl = (token: string) =>
  `${API_BASE_URL}/PdfStream/Read?token=${encodeURIComponent(token)}`
