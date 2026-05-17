import { API_BASE_URL, apiFetch, type ApiResponse } from './api-client'
import type { CatalogBook } from './book-catalog'

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
}

export interface BookListItemData {
  bookId: number
  title: string
  slug: string
  authorName: string | null
  categoryName: string
  coverImageUrl: string | null
  language: string | null
  price: number
  discountPercent: number
  finalPrice: number
  averageRating: number
  totalReviews: number
  totalPurchases: number
  isFeatured: boolean
  isOwned: boolean | null
  isWishlisted: boolean | null
}

export interface BookDetailData {
  bookId: number
  title: string
  slug: string
  categoryId: number
  categoryName: string
  authorId: number | null
  authorName: string | null
  authorBio: string | null
  authorPhotoUrl: string | null
  description: string | null
  language: string | null
  totalPages: number
  publishedYear: number | null
  isbn: string | null
  price: number
  discountPercent: number
  finalPrice: number
  coverImageUrl: string | null
  previewPages: number | null
  averageRating: number
  totalReviews: number
  totalPurchases: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  tags: string[]
  isOwned?: boolean | null
  isWishlisted?: boolean | null
}

export interface BookAdminDetailData extends BookDetailData {
  pdfStorageKey: string | null
  previewStorageKey: string | null
  pdfSizeKb: number | null
  createdBy: number
}

export interface BookSearchPayload {
  query?: string
  categoryId?: number
  authorId?: number
  language?: string
  isFeatured?: boolean
  isFree?: boolean
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  page?: number
  pageSize?: number
}

export interface CreateBookPayload {
  categoryId: number
  authorId?: number
  title: string
  description: string
  language: string
  totalPages?: number
  publishedYear?: number
  isbn: string
  price: number
  isFeatured: boolean
  tagsRaw: string
  pdfFile: File
  coverFile?: File | null
}

export interface UpdateBookPayload {
  bookId: number
  categoryId: number
  authorId?: number | null
  title: string
  description: string
  language: string
  totalPages?: number
  publishedYear?: number | null
  isbn: string
  price: number
  isFeatured: boolean
  isActive: boolean
  tagsRaw: string
  newPdfFile?: File | null
  newCoverFile?: File | null
}

function toQueryString(params: Record<string, string | number | boolean | undefined>) {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.set(key, String(value))
    }
  })
  return query.toString()
}

export function toCatalogBookFromList(book: BookListItemData): CatalogBook {
  return {
    bookId: book.bookId,
    id: book.slug,
    slug: book.slug,
    title: book.title,
    author: book.authorName ?? 'Unknown author',
    price: book.finalPrice ?? book.price,
    image: getBookAssetUrl(book.coverImageUrl) ?? '/images/covers/placeholder.svg',
    description: book.categoryName,
    summary: `${book.categoryName} · ${book.language ?? 'Digital book'}`,
    longDescription: `${book.title} by ${book.authorName ?? 'Unknown author'}`,
    genre: book.categoryName,
    rating: book.averageRating ?? 0,
    pages: 0,
    format: 'PDF',
    featured: book.isFeatured,
    isPurchased: Boolean(book.isOwned),
  }
}

export function toCatalogBookFromDetail(book: BookDetailData): CatalogBook {
  return {
    bookId: book.bookId,
    id: book.slug,
    slug: book.slug,
    title: book.title,
    author: book.authorName ?? 'Unknown author',
    price: book.finalPrice ?? book.price,
    image: getBookAssetUrl(book.coverImageUrl) ?? '/images/covers/placeholder.svg',
    description: book.description ?? book.categoryName,
    summary: book.description ?? `${book.categoryName} book`,
    longDescription: book.description ?? `${book.title} by ${book.authorName ?? 'Unknown author'}`,
    genre: book.categoryName,
    rating: book.averageRating ?? 0,
    pages: book.totalPages ?? 0,
    format: 'PDF',
    featured: book.isFeatured,
    isPurchased: Boolean(book.isOwned),
  }
}

export const searchBooksApi = (
  payload: BookSearchPayload = {},
): Promise<ApiResponse<PagedResult<BookListItemData>>> =>
  apiFetch<PagedResult<BookListItemData>>(`Book/GetAll?${toQueryString({
    Query: payload.query,
    CategoryId: payload.categoryId,
    AuthorId: payload.authorId,
    Language: payload.language,
    IsFeatured: payload.isFeatured,
    IsFree: payload.isFree,
    MinPrice: payload.minPrice,
    MaxPrice: payload.maxPrice,
    SortBy: payload.sortBy,
    Page: payload.page ?? 1,
    PageSize: payload.pageSize ?? 12,
  })}`)

export const trendingBooksApi = (): Promise<ApiResponse<BookListItemData[]>> =>
  apiFetch<BookListItemData[]>('Book/Trending')

export const adminGetAllBooksApi = (
  payload: BookSearchPayload = {},
): Promise<ApiResponse<PagedResult<BookListItemData>>> =>
  apiFetch<PagedResult<BookListItemData>>(`Book/AdminGetAll?${toQueryString({
    Query: payload.query,
    CategoryId: payload.categoryId,
    AuthorId: payload.authorId,
    Page: payload.page ?? 1,
    PageSize: payload.pageSize ?? 50,
  })}`)

export const getBookBySlugApi = (slug: string): Promise<ApiResponse<BookDetailData>> =>
  apiFetch<BookDetailData>(`Book/GetBySlug?slug=${encodeURIComponent(slug)}`)

export const relatedBooksApi = (id: number): Promise<ApiResponse<BookListItemData[]>> =>
  apiFetch<BookListItemData[]>(`Book/Related?id=${id}`)

export const adminBookDetailApi = (id: number): Promise<ApiResponse<BookAdminDetailData>> =>
  apiFetch<BookAdminDetailData>(`Book/AdminDetail?id=${id}`)

export async function createBookApi(payload: CreateBookPayload) {
  const form = new FormData()
  form.append('CategoryId', String(payload.categoryId))
  if (payload.authorId) form.append('AuthorId', String(payload.authorId))
  form.append('Title', payload.title)
  form.append('Description', payload.description)
  form.append('Language', payload.language)
  if (payload.totalPages !== undefined) form.append('TotalPages', String(payload.totalPages))
  if (payload.publishedYear) form.append('PublishedYear', String(payload.publishedYear))
  form.append('Isbn', payload.isbn)
  form.append('Price', String(payload.price))
  form.append('IsFeatured', String(payload.isFeatured))
  form.append('TagsRaw', payload.tagsRaw)
  form.append('PdfFile', payload.pdfFile)
  if (payload.coverFile) form.append('CoverFile', payload.coverFile)

  return apiFetch<BookAdminDetailData>('Book/Create', {
    method: 'POST',
    body: form,
  })
}

export async function updateBookApi(
  payload: UpdateBookPayload,
): Promise<ApiResponse<BookAdminDetailData>> {
  const form = new FormData()
  form.append('BookId', String(payload.bookId))
  form.append('CategoryId', String(payload.categoryId))
  if (payload.authorId) form.append('AuthorId', String(payload.authorId))
  form.append('Title', payload.title)
  form.append('Description', payload.description)
  form.append('Language', payload.language)
  if (payload.totalPages !== undefined) form.append('TotalPages', String(payload.totalPages))
  if (payload.publishedYear) form.append('PublishedYear', String(payload.publishedYear))
  form.append('Isbn', payload.isbn)
  form.append('Price', String(payload.price))
  form.append('IsFeatured', String(payload.isFeatured))
  form.append('IsActive', String(payload.isActive))
  form.append('TagsRaw', payload.tagsRaw)
  if (payload.newPdfFile) form.append('NewPdfFile', payload.newPdfFile)
  if (payload.newCoverFile) form.append('NewCoverFile', payload.newCoverFile)

  return apiFetch<BookAdminDetailData>('Book/Update', {
    method: 'PUT',
    body: form,
  })
}

export const toggleBookApi = (id: number): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>(`Book/Toggle?id=${id}`, {
    method: 'PATCH',
  })

export const featureBookApi = (id: number): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>(`Book/Feature?id=${id}`, {
    method: 'PATCH',
  })

export const deleteBookApi = (id: number): Promise<ApiResponse<boolean>> =>
  apiFetch<boolean>(`Book/Delete?id=${id}`, {
    method: 'DELETE',
  })

export const getBookAssetUrl = (storageKey: string | null | undefined) => {
  if (!storageKey) return null
  if (/^https?:\/\//i.test(storageKey)) return storageKey
  // If the key points to a public local image (e.g. /images/covers/...), return as-is
  if (storageKey.startsWith('/images/') || storageKey.startsWith('images/')) {
    return storageKey.startsWith('/') ? storageKey : `/${storageKey}`
  }
  if (storageKey.startsWith('BookCovers/')) {
    return `${API_BASE_URL}/File/Cover?key=${encodeURIComponent(storageKey)}`
  }

  return `${API_BASE_URL}/${storageKey.startsWith('/') ? storageKey.slice(1) : storageKey}`
}
