'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Search } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { localBooks } from '@/src/lib/local-books'
import { type CatalogBook } from '@/src/lib/book-catalog'
import { Input } from '@/src/components/ui/input'
import useSWR from 'swr'
import { booksFetcher } from '@/src/lib/fetchers/book.fetcher'
import { Card, CardContent } from '@/src/components/ui/card'
import { BookCover } from '@/src/components/custom/book-cover'


const staticBooks: CatalogBook[] = localBooks

export default function BooksPage() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const {
    data,
    isLoading,
    error,
  } = useSWR(
    ['books', page],
    ([_, currentPage]) => booksFetcher(currentPage),
    {
      revalidateOnFocus: false,
    }
  )

  const books = data?.items || []



  const filteredBooks = books.filter((book) =>
    [
      book.title,
      book.authorName,
      book.categoryName,
    ]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  )

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:space-y-10">
        <section className="section-shell px-6 py-8 sm:px-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <Badge className="rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[#7A2E92]">
                📚 ई-पुस्तक संग्रह
              </Badge>

              <h1 className="mt-5 text-3xl font-semibold text-[#7A2E92]">
                सर्व उपलब्ध पुस्तके
              </h1>

              <p className="mt-4 text-lg leading-8 text-slate-600">
                बँकिंग, सहकार, लेखापरीक्षण, कायदे व प्रशिक्षणाशी संबंधित
                उपयुक्त पुस्तके, अभ्यास साहित्य व संदर्भ ग्रंथ.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-3xl border bg-white p-5">
                <p className="text-sm text-slate-500">
                  उपलब्ध पुस्तके
                </p>

                <p className="mt-1 text-3xl font-bold text-[#7A2E92]">
                  {books.length}
                </p>
              </div>

              {/* <div className="rounded-3xl border bg-white p-5">
                <p className="text-sm text-slate-500">
                  स्वरूप
                </p>

                <p className="mt-1 text-2xl font-bold text-[#7A2E92]">
                  PDF
                </p>
              </div> */}
            </div>
          </div>
        </section>

        <section className="section-shell p-5 sm:p-8">
          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                पुस्तक शोधा
              </h2>

              <p className="mt-2 text-slate-500">
                पुस्तकाचे नाव, लेखक किंवा विभागानुसार शोधा
              </p>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="पुस्तकाचे नाव शोधा..."
                className="h-12 rounded-full pl-11 border-[#7A2E92]/30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <Link key={book.bookId} href={`/books/${book.slug}`}>
                  <Card className="group overflow-hidden rounded-3xl border-[#7A2E92]/20 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">

                    <div className="relative h-80 overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200">
                      <BookCover
                        src={book.coverImageUrl}
                        alt={book.title}
                      />

                      {book.isFeatured && (
                        <div className="absolute left-3 top-3 rounded-full bg-[#7A2E92] px-3 py-1 text-xs font-medium text-white">
                          लोकप्रिय
                        </div>
                      )}
                    </div>

                    <CardContent className="space-y-3 p-5">
                      <div className="text-sm font-medium text-[#7A2E92]">
                        {book.categoryName}
                      </div>

                      <h3 className="line-clamp-2 min-h-[56px] text-lg font-bold text-slate-800">
                        {book.title}
                      </h3>

                      <div className="text-sm text-slate-500">
                        {book.authorName}
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <div className="text-xl font-bold text-[#7A2E92]">
                          ₹{book.price.toLocaleString('en-IN')}
                        </div>

                        <div className="flex items-center gap-1 text-sm text-slate-500">
                          <BookOpen className="h-4 w-4" />
                          पहा
                        </div>
                      </div>
                    </CardContent>

                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="text-7xl">📚</div>

                <h3 className="mt-4 text-2xl font-semibold text-slate-700">
                  कोणतेही पुस्तक आढळले नाही
                </h3>

                <p className="mt-2 text-slate-500">
                  दुसरे नाव किंवा लेखक शोधण्याचा प्रयत्न करा.
                </p>
              </div>
            )}
          </div>
          <div className="mt-12 flex items-center justify-center gap-2">

            <Button
              variant="outline"
              disabled={!data?.hasPrevious}
              onClick={() => setPage((p) => p - 1)}
            >
              ← मागील
            </Button>

            {Array.from(
              { length: data?.totalPages ?? 0 },
              (_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? 'default' : 'outline'}
                  className={
                    page === i + 1
                      ? 'bg-[#7A2E92] hover:bg-[#69267d]'
                      : ''
                  }
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </Button>
              )
            )}

            <Button
              variant="outline"
              disabled={!data?.hasNext}
              onClick={() => setPage((p) => p + 1)}
            >
              पुढील →
            </Button>

          </div>
        </section>
      </div>
    </main>
  )
}
