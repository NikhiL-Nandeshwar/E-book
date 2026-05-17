import { apiFetch, type ApiResponse } from './api-client'

export interface AuthorDetail {
  authorId: number
  authorName: string
  bio: string | null
  photoUrl: string | null
  isActive: boolean
  totalBooks: number
  createdAt: string
}

export interface AuthorDropdownItem {
  authorId: number
  authorName: string
}

export interface CreateAuthorPayload {
  authorName: string
  bio: string
  photoUrl: string
}

export interface UpdateAuthorPayload extends CreateAuthorPayload {
  authorId: number
  isActive: boolean
}

export const getAllAuthorsApi = (): Promise<ApiResponse<AuthorDetail[]>> =>
  apiFetch<AuthorDetail[]>('Author/GetAll')

export const getAuthorDropdownApi = (): Promise<ApiResponse<AuthorDropdownItem[]>> =>
  apiFetch<AuthorDropdownItem[]>('Author/Dropdown/dropdown')

export const getAuthorByIdApi = (id: number): Promise<ApiResponse<AuthorDetail>> =>
  apiFetch<AuthorDetail>(`Author/GetById/${id}`)

export const createAuthorApi = (
  payload: CreateAuthorPayload,
): Promise<ApiResponse<AuthorDetail>> =>
  apiFetch<AuthorDetail>('Author/Create', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateAuthorApi = (
  payload: UpdateAuthorPayload,
): Promise<ApiResponse<AuthorDetail>> =>
  apiFetch<AuthorDetail>('Author/Update', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const toggleAuthorApi = (id: number): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>(`Author/Toggle/${id}/toggle`, {
    method: 'PATCH',
  })

export const deleteAuthorApi = (id: number): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>(`Author/Delete/${id}`, {
    method: 'DELETE',
  })
