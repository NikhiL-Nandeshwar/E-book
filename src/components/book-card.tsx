import Link from 'next/link'
import { BookOpen, Sparkles, Star } from 'lucide-react'

import { useDemo } from '@/src/components/demo-provider'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import type { CatalogBook } from '@/src/lib/book-catalog'

interface BookCardProps {
  book: CatalogBook
}

export function BookCard({ book }: BookCardProps) {
  const { purchasedIds, isHydrated } = useDemo()

  const isPurchased = isHydrated && purchasedIds.includes(book.id)

  return (
    <Card className="group overflow-hidden rounded-[24px] border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_80px_rgba(15,23,42,0.14)]">
      <div className="relative overflow-hidden">
        <Link href={`/book/${book.slug}`} className="block">
          <div className="relative flex h-52 items-center justify-center overflow-hidden rounded-[20px] bg-[linear-gradient(180deg,#f8efe5,#e8edf7)] sm:h-64 lg:h-72">
            <img
              src={book.image || '/images/covers/placeholder.svg'}
              alt={book.title}
              className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
      </div>

      <CardContent className="space-y-3 p-3.5 sm:space-y-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <Badge className="rounded-full bg-black/65 px-2.5 py-1 text-[10px] text-white backdrop-blur sm:px-3 sm:text-xs">
            {book.genre}
          </Badge>
          <div className="hidden items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-sm sm:flex">
            <Star className="size-3.5 fill-current text-amber-500" />
            {book.rating.toFixed(1)}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href={`/book/${book.slug}`}>
                <h3 className="line-clamp-2 text-[15px] font-semibold tracking-tight text-foreground transition-colors group-hover:text-[color:var(--color-brand)] sm:text-lg">
                  {book.title}
                </h3>
              </Link>
              <p className="mt-1 hidden text-sm text-yellow-800 sm:block">{book.author} · {book.genre}</p>
            </div>
            {isPurchased ? (
              <Badge variant="outline" className="hidden rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 sm:inline-flex">
                Owned
              </Badge>
            ) : null}
          </div>

          <p className="hidden line-clamp-2 text-sm leading-6 text-muted-foreground sm:block">
            {book.summary}
          </p>
        </div>

        <div className="hidden items-center justify-between text-sm text-muted-foreground sm:flex">
          <span>{book.pages} pages</span>
          <span>{book.format}</span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">Price</p>
            <p className="text-xl font-semibold text-foreground sm:text-2xl">Rs. {book.price}</p>
          </div>
          {book.featured ? (
            <Badge className="hidden rounded-full bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)] sm:inline-flex">
              <Sparkles className="mr-1 size-3.5" />
              Featured
            </Badge>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-2">
          <Link href={`/book/${book.slug}`} className="block">
            <Button variant="outline" className="h-11 w-full rounded-2xl bg-transparent">
              <BookOpen className="mr-2 size-4" />
              Buy Now
            </Button>
          </Link>
          {isPurchased ? (
            <p className="text-center text-xs font-medium text-emerald-700 sm:hidden">Already in your library</p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
