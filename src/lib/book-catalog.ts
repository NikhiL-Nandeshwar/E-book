export type CatalogBook = {
  bookId: number
  id: string
  slug: string
  title: string
  author: string
  price: number
  image: string
  description: string
  summary: string
  longDescription: string
  genre: string
  rating: number
  pages: number
  format: string
  featured: boolean
  isPurchased?: boolean
}

const STORAGE_KEY = 'bookvault-catalog-cache-v1'

let cache: Record<string, CatalogBook> | null = null

function canUseStorage() {
  return typeof window !== 'undefined'
}

function ensureCache() {
  if (cache) return cache

  if (!canUseStorage()) {
    cache = {}
    return cache
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    cache = raw ? (JSON.parse(raw) as Record<string, CatalogBook>) : {}
  } catch {
    cache = {}
  }

  return cache
}

function persistCache() {
  if (!canUseStorage() || !cache) return
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache))
}

export function upsertCatalogBooks(books: CatalogBook[]) {
  const store = ensureCache()
  for (const book of books) {
    store[book.id] = book
  }
  persistCache()
}

export function getCatalogBookById(id: string) {
  return ensureCache()[id]
}

export function getAllCatalogBooks() {
  return Object.values(ensureCache())
}
