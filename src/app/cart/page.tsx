'use client'

import Link from 'next/link'
import { ArrowRight, CreditCard, ShoppingBag, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Header } from '@/src/components/custom/header'
import { SiteFooter } from '@/src/components/custom/site-footer'
import { useDemo } from '@/src/components/custom/demo-provider'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/src/components/ui/empty'
import { Button } from '@/src/components/ui/button'

export default function CartPage() {
  const router = useRouter()
  const { user, cartBooks, removeFromCart, totalAmount, checkout } = useDemo()

  const taxAmount = totalAmount * 0.08
  const finalAmount = totalAmount + taxAmount

  const handleCheckout = () => {
    const done = checkout()
    if (!done && !user) {
      router.push('/login')
      return
    }

    if (done) {
      router.push('/library')
    }
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="section-shell px-5 py-6 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--color-brand)]">Shopping cart</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Review your selected books.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            A simple checkout demo for client review. Everything is static, but the UI mimics a clean ecommerce
            purchasing flow.
          </p>
        </section>

        {cartBooks.length === 0 ? (
          <section className="section-shell p-5 sm:p-8">
            <Empty className="border-0 bg-transparent p-6 sm:p-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBag />
                </EmptyMedia>
                <EmptyTitle>Your cart is empty</EmptyTitle>
                <EmptyDescription>
                  Start exploring the bookstore and add a few titles to see the full buying journey.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link href="/books">
                  <Button className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white">
                    Browse Books
                  </Button>
                </Link>
              </EmptyContent>
            </Empty>
          </section>
        ) : (
          <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="section-shell p-5 sm:p-8">
              <div className="space-y-4">
                {cartBooks.map((book) => (
                  <div
                    key={book.id}
                    className="flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    <img src={book.image} alt={book.title} className="h-32 w-24 rounded-[20px] object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand)]">
                        {book.genre}
                      </p>
                      <h2 className="mt-2 text-xl font-semibold">{book.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{book.description}</p>
                    </div>
                    <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                      <p className="text-2xl font-semibold">${book.price.toFixed(2)}</p>
                      <Button
                        variant="ghost"
                        className="rounded-full text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(book.id)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="section-shell h-fit p-5 sm:p-8 lg:sticky lg:top-24">
              <div className="rounded-[28px] border border-[color:var(--color-brand-soft)] bg-[linear-gradient(180deg,rgba(38,70,168,0.08),rgba(255,255,255,0.8))] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand)]">
                  Order summary
                </p>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Estimated tax</span>
                    <span className="font-semibold">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="font-semibold">Instant</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-semibold">Total</span>
                      <span className="text-3xl font-semibold">${finalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <Button
                  className="mt-6 h-12 w-full rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
                  onClick={handleCheckout}
                >
                  <CreditCard className="mr-2 size-4" />
                  Proceed to Checkout
                </Button>

                {!user ? (
                  <p className="mt-3 text-sm text-muted-foreground">Login is required to complete this demo checkout.</p>
                ) : null}

                <Link href="/books" className="mt-3 block">
                  <Button variant="outline" className="h-12 w-full rounded-full bg-white/80">
                    Continue Shopping
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>
            </aside>
          </section>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
