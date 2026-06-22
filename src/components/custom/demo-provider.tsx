'use client'

import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { toast } from 'sonner'

import {
  getMeApi,
  loginApi,
  logoutApi,
  type LoginResponseData,
} from '@/src/lib/auth-api'
import {
  getAllCatalogBooks,
  getCatalogBookById,
  type CatalogBook,
} from '@/src/lib/book-catalog'
import { clearAccessToken, getAccessToken, saveAccessToken } from '@/src/lib/api-client'

// ── User shape (comes from real API) ────────────────────────────────────────

export type AuthUser = {
  userId: number
  name: string   // fullName from API
  email: string
  mobile: string
  role: string
}

// ── Context type ─────────────────────────────────────────────────────────────

type DemoContextValue = {
  user: AuthUser | null
  cartIds: string[]
  purchasedIds: string[]
  isHydrated: boolean
  cartCount: number
  cartBooks: CatalogBook[]
  purchasedBooks: CatalogBook[]
  totalAmount: number
  /** Sign in via real API. Returns { success, message } so the page can react. */
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  /** Set user from external login result (e.g. after OTP verify) */
  setUserFromApi: (data: LoginResponseData) => void
  logout: () => Promise<void>
  addToCart: (bookId: string) => boolean
  removeFromCart: (bookId: string) => void
  buyNow: (bookId: string) => boolean
  checkout: () => boolean
  markPurchased: (bookId: string) => void
}

// ── Constants ─────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'bookvault-state-v3'
const defaultPurchasedIds: string[] = []
const DemoContext = createContext<DemoContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function DemoProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [cartIds, setCartIds] = useState<string[]>([])
  const [purchasedIds, setPurchasedIds] = useState<string[]>(defaultPurchasedIds)
  const [isHydrated, setIsHydrated] = useState(false)

  // Rehydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as {
          user: AuthUser | null
          cartIds: string[]
          purchasedIds: string[]
        }
        setUser(parsed.user ?? null)
        setCartIds(parsed.cartIds ?? [])
        setPurchasedIds(parsed.purchasedIds?.length ? parsed.purchasedIds : defaultPurchasedIds)
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // Persist to localStorage whenever state changes
  useEffect(() => {
    if (!isHydrated) return
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, cartIds, purchasedIds }),
    )
  }, [cartIds, isHydrated, purchasedIds, user])

  useEffect(() => {
    if (!isHydrated) return

    const token = getAccessToken()
    if (!token) {
      if (user) {
        startTransition(() => setUser(null))
      }
      return
    }

    let cancelled = false

    const syncUser = async () => {
      try {
        const res = await getMeApi()
        if (!res.success || !res.data) {
          clearAccessToken()
          if (!cancelled) {
            startTransition(() => setUser(null))
          }
          return
        }

        const profile = res.data
        if (!cancelled) {
          startTransition(() =>
            setUser({
              userId: profile.userId,
              name: profile.fullName,
              email: profile.email,
              mobile: profile.mobile,
              role: profile.role,
            }),
          )
        }
      } catch {
        clearAccessToken()
        if (!cancelled) {
          startTransition(() => setUser(null))
        }
      }
    }

    void syncUser()

    return () => {
      cancelled = true
    }
  }, [isHydrated])

  // ── Derived ────────────────────────────────────────────────────────────────

  const cartBooks = useMemo(
    () => cartIds.map((id) => getCatalogBookById(id)).filter((b): b is CatalogBook => Boolean(b)),
    [cartIds],
  )
  const purchasedBooks = useMemo(
    () => getAllCatalogBooks().filter((b) => purchasedIds.includes(b.id) || b.isPurchased),
    [purchasedIds],
  )
  const totalAmount = useMemo(
    () => cartBooks.reduce((sum, b) => sum + b.price, 0),
    [cartBooks],
  )

  // ── Auth helpers ───────────────────────────────────────────────────────────

  const setUserFromApi = (data: LoginResponseData) => {
    saveAccessToken(data.accessToken)
    const authUser: AuthUser = {
      userId: data.userId,
      name: data.fullName,
      email: data.email,
      mobile: data.mobile,
      role: data.role,
    }
    startTransition(() => setUser(authUser))
  }

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await loginApi({ email, password })
      if (res.success && res.data) {
        setUserFromApi(res.data)
        toast.success('Welcome back! You are now signed in.')
        return { success: true, message: res.message }
      }
      return { success: false, message: res.message || 'Login failed. Please try again.' }
    } catch {
      return { success: false, message: 'Network error. Check your connection and try again.' }
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore network errors on logout — always clear local state
    }
    clearAccessToken()
    startTransition(() => {
      setUser(null)
      setCartIds([])
    })
    toast.success('You have been signed out.')
  }

  // ── Cart / purchase helpers (client-side demo) ─────────────────────────────

  const addToCart = (bookId: string) => {
    const book = getCatalogBookById(bookId)
    if (!book) return false
    if (!user) { toast.error('Please sign in to add books to your cart.'); return false }
    if (purchasedIds.includes(bookId)) { toast.info('This title is already in your library.'); return false }
    if (cartIds.includes(bookId)) { toast.info('This book is already in your cart.'); return false }
    setCartIds((prev) => [...prev, bookId])
    toast.success(`Added "${book.title}" to your cart.`)
    return true
  }

  const removeFromCart = (bookId: string) => {
    const book = getCatalogBookById(bookId)
    setCartIds((prev) => prev.filter((id) => id !== bookId))
    toast.success(book ? `Removed "${book.title}" from cart.` : 'Removed from cart.')
  }

  const buyNow = (bookId: string) => {
    const book = getCatalogBookById(bookId)
    if (!book) return false
    if (!user) { toast.error('Please sign in to continue with purchase.'); return false }
    if (purchasedIds.includes(bookId)) { toast.info('This title is already in your library.'); return true }
    setPurchasedIds((prev) => [...new Set([...prev, bookId])])
    setCartIds((prev) => prev.filter((id) => id !== bookId))
    toast.success(`"${book.title}" has been added to your library.`)
    return true
  }

  const checkout = () => {
    if (!user) { toast.error('Please sign in to proceed to checkout.'); return false }
    if (cartIds.length === 0) { toast.error('Your cart is empty.'); return false }
    setPurchasedIds((prev) => [...new Set([...prev, ...cartIds])])
    setCartIds([])
    toast.success('Purchase completed! Your library has been updated.')
    return true
  }

  const markPurchased = (bookId: string) => {
    setPurchasedIds((prev) => [...new Set([...prev, bookId])])
    setCartIds((prev) => prev.filter((id) => id !== bookId))
  }

  return (
    <DemoContext.Provider
      value={{
        user,
        cartIds,
        purchasedIds,
        isHydrated,
        cartCount: cartIds.length,
        cartBooks,
        purchasedBooks,
        totalAmount,
        login,
        setUserFromApi,
        logout,
        addToCart,
        removeFromCart,
        buyNow,
        checkout,
        markPurchased,
      }}
    >
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const context = useContext(DemoContext)
  if (!context) throw new Error('useDemo must be used within DemoProvider')
  return context
}
