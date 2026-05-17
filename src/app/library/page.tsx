'use client'

import Link from 'next/link'
import { BookOpen, LockKeyhole, ShieldCheck } from 'lucide-react'

import { Header } from '@/src/components/header'
import { SiteFooter } from '@/src/components/site-footer'
import { useDemo } from '@/src/components/demo-provider'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/src/components/ui/empty'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'

export default function LibraryPage() {
  const { user, purchasedBooks, isHydrated } = useDemo()
  const visibleUser = isHydrated ? user : null
  const visiblePurchasedBooks = isHydrated ? purchasedBooks : []

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
        <section className="section-shell px-5 py-6 sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--color-brand)]">My library</p>
          <h1 className="mt-3 font-display text-5xl leading-none sm:text-6xl">Your purchased reading collection.</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Showcase owned ebooks in a clean, premium layout with direct access into the secure PDF reading interface.
          </p>
        </section>

        {!visibleUser ? (
          <section className="section-shell p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
                  Demo authentication required
                </Badge>
                <h2 className="mt-4 font-display text-4xl leading-none sm:text-5xl">Login to open your digital shelf.</h2>
                <p className="mt-4 text-base leading-7 text-muted-foreground">
                  Once logged in, the library will display purchased books and enable the protected reading experience.
                </p>
                <Link href="/login" className="mt-6 inline-block">
                  <Button className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white">
                    Login to Continue
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
                  <BookOpen className="size-5 text-[color:var(--color-brand)]" />
                  <p className="mt-4 text-lg font-semibold">Owned titles</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Books appear here after a demo purchase.</p>
                </Card>
                <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
                  <ShieldCheck className="size-5 text-[color:var(--color-brand)]" />
                  <p className="mt-4 text-lg font-semibold">Protected reader</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Download and sharing controls stay disabled.</p>
                </Card>
                <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
                  <LockKeyhole className="size-5 text-[color:var(--color-brand)]" />
                  <p className="mt-4 text-lg font-semibold">Static only</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">No backend or API is required for this prototype.</p>
                </Card>
              </div>
            </div>
          </section>
        ) : visiblePurchasedBooks.length === 0 ? (
          <section className="section-shell p-5 sm:p-8">
            <Empty className="border-0 bg-transparent p-6 sm:p-10">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <BookOpen />
                </EmptyMedia>
                <EmptyTitle>No books in your library yet</EmptyTitle>
                <EmptyDescription>
                  Complete a demo purchase and your titles will appear here instantly.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Link href="/books">
                  <Button className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white">
                    Explore Books
                  </Button>
                </Link>
              </EmptyContent>
            </Empty>
          </section>
        ) : (
          <section className="section-shell p-5 sm:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[color:var(--color-brand)]">
                  Purchased titles
                </p>
                <h2 className="mt-2 text-2xl font-semibold">{visiblePurchasedBooks.length} books ready to read</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {visiblePurchasedBooks.map((book) => (
                <Card key={book.id} className="overflow-hidden rounded-[28px] border-white/70 bg-white/90 shadow-none">
                  <div className="aspect-[4/5] overflow-hidden bg-[linear-gradient(180deg,#f7ead6,#e4ebf7)] p-3">
                    <img
                      src={book.image}
                      alt={book.title}
                      className="h-full w-full rounded-[22px] object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="space-y-4 p-5">
                    <div>
                      <h3 className="line-clamp-2 text-lg font-semibold">{book.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{book.author}</p>
                    </div>
                    <Link href={`/read/${book.id}`}>
                      <Button className="w-full rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white">
                        <BookOpen className="mr-2 size-4" />
                        Read Book
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      <SiteFooter />
    </main>
  )
}
