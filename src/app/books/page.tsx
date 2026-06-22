'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Compass, Search, Sparkles } from 'lucide-react'

import { BookCard } from '@/src/components/custom/book-card'
import { Header } from '@/src/components/custom/header'
import { SiteFooter } from '@/src/components/custom/site-footer'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { localBooks } from '@/src/lib/local-books'
import { type CatalogBook } from '@/src/lib/book-catalog'


const staticBooks: CatalogBook[] = localBooks

export default function BooksPage() {
  const [query, setQuery] = useState('')

  const filteredBooks = useMemo(
    () =>
      staticBooks.filter((book) => {
        const searchTerm = query.trim().toLowerCase()
        if (!searchTerm) return true
        return [book.title, book.author, book.genre, book.description]
          .some((value) => value.toLowerCase().includes(searchTerm))
      }),
    [query],
  )

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:space-y-10">
        <section className="section-shell px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
                Curated ebook catalog
              </Badge>
              <h1 className="mt-4 font-display text-5xl leading-none sm:text-6xl">Browse every title in the store.</h1>
              <p className="mt-4 text-base leading-7 text-muted-foreground sm:text-lg">
                A curated digital collection for training, daily operations, service quality, skill development, and organizational context.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:w-auto">
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4">
                <p className="text-sm text-muted-foreground">Available Books</p>
                <p className="mt-1 text-2xl font-semibold">{staticBooks.length}</p>
              </div>
              <div className="rounded-3xl border border-white/70 bg-white/80 p-4">
                <p className="text-sm text-muted-foreground">Formats</p>
                <p className="mt-1 text-2xl font-semibold">EPUB / PDF</p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full bg-white px-3 py-1">
                  <Sparkles className="mr-1 size-3.5" />
                  Featured visuals
                </Badge>
                <Badge variant="outline" className="rounded-full bg-white px-3 py-1">
                  <Compass className="mr-1 size-3.5" />
                  Quick Search
                </Badge>
              </div>
              <div className="relative w-full sm:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by title or author"
                  className="h-11 w-full rounded-full border border-white/70 bg-white px-10 text-sm outline-none"
                />
              </div>
            </div>
            <Link href="/cart">
              <Button variant="outline" className="rounded-full bg-white/70">
                View Cart
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => <BookCard key={book.id} book={book} />)
            ) : (
              <p className="text-sm text-muted-foreground">No books found for your search.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
