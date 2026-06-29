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
  getCurrentUserApi,
  loginApi,
  logoutApi,
  mapUserProfileToAuthUser,
  type AuthUser,
  type LoginResponseData,
} from '@/src/lib/auth-api'
import {
  getAllCatalogBooks,
  getCatalogBookById,
  type CatalogBook,
} from '@/src/lib/book-catalog'

export type AuthContextValue = {
  user: AuthUser | null
  cartIds: string[]
  purchasedIds: string[]
  isHydrated: boolean
  cartCount: number
  cartBooks: CatalogBook[]
  purchasedBooks: CatalogBook[]
  totalAmount: number
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; user?: AuthUser | null }>
  setUserFromApi: (data: LoginResponseData) => void
  logout: () => Promise<void>
  addToCart: (bookId: string) => boolean
  removeFromCart: (bookId: string) => void
  buyNow: (bookId: string) => boolean
  checkout: () => boolean
  markPurchased: (bookId: string) => void
}

const STORAGE_KEY = 'bookvault-state-v3'
const defaultPurchasedIds: string[] = []
const AuthContext = createContext<AuthContextValue | null>(null)

function mapLoginResponseToAuthUser(data: LoginResponseData): AuthUser {
  return {
    userId: data.userId,
    fullName: data.fullName,
    name: data.fullName,
    email: data.email,
    mobile: data.mobile,
    role: data.role,
    profilePicUrl: data.profilePicUrl,
    isEmailVerified: data.isEmailVerified,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [cartIds, setCartIds] = useState<string[]>([])
  const [purchasedIds, setPurchasedIds] = useState<string[]>(defaultPurchasedIds)
  const [isHydrated, setIsHydrated] = useState(false)

  const syncCurrentUser = async () => {
    try {
      const res = await getCurrentUserApi()

      if (!res.success || !res.data) {
        startTransition(() => setUser(null))
        return null
      }

      const profile = mapUserProfileToAuthUser(res.data)
      startTransition(() => setUser(profile))
      return profile
    } catch {
      startTransition(() => setUser(null))
      return null
    }
  }

  useEffect(() => {
    let cancelled = false

    const boot = async () => {
      try {
        const raw = window.localStorage.getItem(STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw) as {
            cartIds?: string[]
            purchasedIds?: string[]
          }

          if (!cancelled) {
            setCartIds(parsed.cartIds ?? [])
            setPurchasedIds(parsed.purchasedIds?.length ? parsed.purchasedIds : defaultPurchasedIds)
          }
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY)
      }

      await syncCurrentUser()

      if (!cancelled) {
        setIsHydrated(true)
      }
    }

    void boot()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ cartIds, purchasedIds }),
    )
  }, [cartIds, isHydrated, purchasedIds])

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

  const setUserFromApi = (data: LoginResponseData) => {
    const authUser = mapLoginResponseToAuthUser(data)
    startTransition(() => setUser(authUser))
  }

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; message: string; user?: AuthUser | null }> => {
    try {
      const res = await loginApi({ email, password })

      if (!res.success) {
        return {
          success: false,
          message: res.message || 'Login failed. Please try again.',
        }
      }

      const profile = await syncCurrentUser()

      if (profile) {
        toast.success('Welcome back! You are now signed in.')
        return {
          success: true,
          message: res.message || 'Signed in successfully.',
          user: profile,
        }
      }

      if (res.data) {
        const fallbackUser = mapLoginResponseToAuthUser(res.data)
        setUserFromApi(res.data)
        toast.success('Welcome back! You are now signed in.')
        return {
          success: true,
          message: res.message || 'Signed in successfully.',
          user: fallbackUser,
        }
      }

      return {
        success: false,
        message: 'Login succeeded but the session could not be loaded.',
      }
    } catch {
      return {
        success: false,
        message: 'Network error. Check your connection and try again.',
      }
    }
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // Ignore network errors on logout; the client state is still cleared.
    }

    startTransition(() => {
      setUser(null)
      setCartIds([])
    })
    toast.success('You have been signed out.')
  }

  const addToCart = (bookId: string) => {
    const book = getCatalogBookById(bookId)
    if (!book) return false
    if (!user) {
      toast.error('Please sign in to add books to your cart.')
      return false
    }
    if (purchasedIds.includes(bookId)) {
      toast.info('This title is already in your library.')
      return false
    }
    if (cartIds.includes(bookId)) {
      toast.info('This book is already in your cart.')
      return false
    }
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
    if (!user) {
      toast.error('Please sign in to continue with purchase.')
      return false
    }
    if (purchasedIds.includes(bookId)) {
      toast.info('This title is already in your library.')
      return true
    }
    setPurchasedIds((prev) => [...new Set([...prev, bookId])])
    setCartIds((prev) => prev.filter((id) => id !== bookId))
    toast.success(`"${book.title}" has been added to your library.`)
    return true
  }

  const checkout = () => {
    if (!user) {
      toast.error('Please sign in to proceed to checkout.')
      return false
    }
    if (cartIds.length === 0) {
      toast.error('Your cart is empty.')
      return false
    }
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
    <AuthContext.Provider
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
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export { AuthProvider as DemoProvider, useAuth as useDemo }
