import { apiFetch, type ApiResponse } from './api-client'

export interface CategoryDetail {
  categoryId: number
  categoryName: string
  description: string | null
  thumbnailUrl: string | null
  sortOrder: number
  isActive: boolean
  totalBooks: number
  createdAt: string
}

export interface CategoryDropdownItem {
  categoryId: number
  categoryName: string
}

export interface CreateCategoryPayload {
  categoryName: string
  description: string
  thumbnailUrl: string
  sortOrder: number
}

export interface UpdateCategoryPayload extends CreateCategoryPayload {
  categoryId: number
  isActive: boolean
}

export const getAllCategoriesApi = (): Promise<ApiResponse<CategoryDetail[]>> =>
  apiFetch<CategoryDetail[]>('Category/GetAll')

export const getCategoryDropdownApi = (): Promise<ApiResponse<CategoryDropdownItem[]>> =>
  apiFetch<CategoryDropdownItem[]>('Category/Dropdown')

export const getCategoryByIdApi = (id: number): Promise<ApiResponse<CategoryDetail>> =>
  apiFetch<CategoryDetail>(`Category/GetById?id=${id}`)

export const createCategoryApi = (
  payload: CreateCategoryPayload,
): Promise<ApiResponse<CategoryDetail>> =>
  apiFetch<CategoryDetail>('Category/Create', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

export const updateCategoryApi = (
  payload: UpdateCategoryPayload,
): Promise<ApiResponse<CategoryDetail>> =>
  apiFetch<CategoryDetail>('Category/Update', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

export const toggleCategoryApi = (id: number): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>(`Category/Toggle?id=${id}`, {
    method: 'PATCH',
  })

export const deleteCategoryApi = (id: number): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>(`Category/Delete?id=${id}`, {
    method: 'DELETE',
  })
