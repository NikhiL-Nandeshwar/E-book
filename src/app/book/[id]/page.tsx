'use client'

import {
  ArrowLeft,
  BookOpen,
  CreditCard,
  Lock,
  ShoppingBag,
  Sparkles,
  Star,
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Header } from '@/src/components/custom/header'
import { SiteFooter } from '@/src/components/custom/site-footer'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { getBookBySlugApi, toCatalogBookFromDetail } from '@/src/lib/book-api'
import { findLocalBookBySlug } from '@/src/lib/local-books'
import { upsertCatalogBooks, type CatalogBook } from '@/src/lib/book-catalog'
import { createOrderApi, verifyPaymentApi } from '@/src/lib/order-api'
import { useDemo } from '@/src/components/custom/demo-provider'

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void }
  }
}

type RazorpaySuccessResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type RazorpayOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: RazorpaySuccessResponse) => void | Promise<void>
  modal?: {
    ondismiss?: () => void
  }
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  theme?: {
    color?: string
  }
}

const detailHighlights = [
  { label: 'Instant access', value: 'Available after purchase', icon: BookOpen },
  { label: 'Reader security', value: 'Download and share disabled', icon: Lock },
  { label: 'Checkout style', value: 'Secure Razorpay checkout', icon: CreditCard },
]

async function loadRazorpayScript() {
  if (typeof window === 'undefined') return false
  if (window.Razorpay) return true

  return new Promise<boolean>((resolve) => {
    const existing = document.querySelector('script[data-razorpay-checkout="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(true), { once: true })
      existing.addEventListener('error', () => resolve(false), { once: true })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.dataset.razorpayCheckout = 'true'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export default function BookDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user, addToCart, markPurchased, purchasedIds } = useDemo()
  const [book, setBook] = useState<CatalogBook | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPaying, setIsPaying] = useState(false)

  const bookId = params.id as string

  useEffect(() => {
    const localBook = findLocalBookBySlug(bookId)
    if (localBook) {
      setBook(localBook)
      upsertCatalogBooks([localBook])
      setIsLoading(false)
      return
    }

    const loadBook = async () => {
      try {
        const res = await getBookBySlugApi(bookId)
        if (res.success && res.data) {
          const normalized = toCatalogBookFromDetail(res.data)
          upsertCatalogBooks([normalized])
          setBook(normalized)
        } else {
          toast.error(res.message || 'Could not load this book.')
        }
      } catch {
        toast.error('Network error. Could not load this book.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadBook()
  }, [bookId])

  if (isLoading) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="section-shell p-10">
            <p className="text-muted-foreground">Loading book details...</p>
          </div>
        </div>
        <SiteFooter />
      </main>
    )
  }

  if (!book) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="section-shell p-10">
            <h1 className="font-display text-5xl">Book not found</h1>
            <p className="mt-3 text-muted-foreground">This demo title could not be loaded.</p>
            <Link href="/books">
              <Button className="mt-6 rounded-full">Back to catalog</Button>
            </Link>
          </div>
        </div>
        <SiteFooter />
      </main>
    )
  }

  const isPurchased = purchasedIds.includes(book.id) || Boolean(book.isPurchased)

  const handleAddToCart = () => {
    const added = addToCart(book.id)
    if (!added && !user) {
      router.push('/login')
    }
  }

  const handleBuyNow = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    if (isPurchased) {
      router.push('/library')
      return
    }

    setIsPaying(true)

    try {
      const orderRes = await createOrderApi({ bookId: book.bookId })
      if (!orderRes.success || !orderRes.data) {
        toast.error(orderRes.message || 'Could not start payment.')
        setIsPaying(false)
        return
      }

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded || !window.Razorpay) {
        toast.error('Could not load Razorpay checkout.')
        setIsPaying(false)
        return
      }

      const order = orderRes.data
      const razorpay = new window.Razorpay({
        key: order.razorpayKeyId,
        amount: order.amountInPaise,
        currency: order.currency,
        name: 'Bookvalute',
        description: `Purchase ${order.bookTitle}`,
        order_id: order.razorpayOrderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.mobile,
        },
        theme: {
          color: '#1d4ed8',
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false)
          },
        },
        handler: async (response) => {
          const verifyRes = await verifyPaymentApi({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          })

          if (!verifyRes.success || !verifyRes.data) {
            toast.error(verifyRes.message || 'Payment verification failed.')
            setIsPaying(false)
            return
          }

          markPurchased(book.id)
          setBook((current) => (current ? { ...current, isPurchased: true } : current))
          toast.success(verifyRes.message || 'Payment successful! Book added to your library.')
          setIsPaying(false)
          router.push('/library')
        },
      })

      razorpay.open()
    } catch {
      toast.error('Network error. Could not start payment.')
      setIsPaying(false)
    }
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:space-y-10">
        <Link
          href="/books"
          className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/80 px-4 py-2 text-sm font-medium text-foreground shadow-sm"
        >
          <ArrowLeft className="size-4" />
          Back to books
        </Link>

        <section className="section-shell overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <div className="rounded-[32px] bg-[linear-gradient(180deg,#f7ead6,#e4ebf7)] p-5">
                <div className="overflow-hidden rounded-[28px] bg-white">
                  <img
                    src={book.image}
                    alt={book.title}
                    className="aspect-[4/5] w-full object-contain shadow-[0_30px_60px_rgba(15,23,42,0.18)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {detailHighlights.map((item) => (
                  <div key={item.label} className="rounded-3xl border border-white/70 bg-white/85 p-4">
                    <item.icon className="size-4 text-[color:var(--color-brand)]" />
                    <p className="mt-3 text-sm font-medium">{item.label}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-3 py-1 text-[color:var(--color-brand-strong)]">
                  {book.genre}
                </Badge>
                <Badge variant="outline" className="rounded-full bg-white px-3 py-1">
                  <Star className="mr-1 size-3.5 fill-current text-amber-500" />
                  {book.rating.toFixed(1)} rating
                </Badge>
                {isPurchased ? (
                  <Badge variant="outline" className="rounded-full border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">
                    Already in your library
                  </Badge>
                ) : null}
              </div>

              <div>
                <h1 className="font-display text-5xl leading-none sm:text-6xl">{book.title}</h1>
                <p className="mt-3 text-xl text-muted-foreground">{book.author}</p>
              </div>

              <div className="grid gap-4 rounded-[28px] border border-white/70 bg-white/85 p-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Price</p>
                  <p className="mt-2 text-3xl font-semibold">Rs. {book.price}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Format</p>
                  <p className="mt-2 text-lg font-semibold">{book.format}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Length</p>
                  <p className="mt-2 text-lg font-semibold">{book.pages} pages</p>
                </div>
              </div>

              <p className="text-base leading-8 text-muted-foreground sm:text-lg">{book.summary}</p>

              <div className="flex flex-col gap-3 sm:flex-row">
                {isPurchased ? (
                  <Link href={`/read/${book.id}`} className="flex-1">
                    <Button className="h-12 w-full rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]">
                      <BookOpen className="mr-2 size-4" />
                      Read Book
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Button
                      className="h-12 flex-1 rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
                      onClick={() => { void handleBuyNow() }}
                      disabled={isPaying}
                    >
                      {isPaying ? 'Opening payment...' : 'Buy Now'}
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 flex-1 rounded-full bg-white/80"
                      onClick={handleAddToCart}
                      disabled={isPaying}
                    >
                      <ShoppingBag className="mr-2 size-4" />
                      Add to Cart
                    </Button>
                  </>
                )}
              </div>

              <Card className="rounded-[28px] border-white/70 bg-white/85 p-6 shadow-none">
                <div className="flex items-center gap-2 text-[color:var(--color-brand)]">
                  <Sparkles className="size-4" />
                  <p className="text-sm font-semibold uppercase tracking-[0.22em]">About this title</p>
                </div>
                <p className="mt-4 text-sm leading-7 text-muted-foreground sm:text-base">{book.longDescription}</p>
              </Card>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </main>
  )
}
