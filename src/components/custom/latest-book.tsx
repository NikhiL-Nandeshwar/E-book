'use client';

import Link from 'next/link';
import { Card, CardContent, } from '@/src/components/ui/card';
import { BookOpen, Search } from 'lucide-react';
import { BookCover } from './book-cover';
import useSWR from 'swr';
import { booksFetcher } from '@/src/lib/fetchers/book.fetcher';
import { Skeleton } from '@/src/components/ui/skeleton';
import { useState } from 'react';
import { Input } from '../ui/input';

export function LatestBooks() {
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

    const [searchTerm, setSearchTerm] = useState('');
    const books = data?.items || []

    const filteredBooks = books.filter((book) =>
        [
            book.title,
            book.authorName,
            book.categoryName,
        ]
            .join(' ')
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
    );

    return (
        <section className="bg-gray-100 border-t border-[#7A2E92]/20 px-10 py-14">
            <div className="mx-auto max-w-7xl rounded-[40px] border border-[#7A2E92]/20 bg-white/60 p-10 backdrop-blur-sm">
                {/* Section Header */}
                <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-lg font-medium text-[#7A2E92]">
                            📚 नवीन पुस्तके
                        </p>

                        <h2 className="mt-1 text-3xl font-bold text-slate-800">
                            अलीकडे प्रकाशित पुस्तके
                        </h2>

                        <p className="mt-2 text-slate-500">
                            बँकिंग, सहकार व प्रशिक्षणाशी संबंधित निवडक पुस्तके
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative min-w-[300px]">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                            <Input
                                placeholder="पुस्तकाचे नाव शोधा..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-13 rounded-xl border-[#7A2E92]/30 bg-white pl-10"
                            />
                        </div>

                        <Link
                            href="/books"
                            className="rounded-xl bg-[#7A2E92] px-5 py-3 font-medium text-white transition hover:bg-[#69267d]"
                        >
                            सर्व पुस्तके पहा →
                        </Link>
                    </div>
                </div>

                {/* Books Grid */}
                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Card
                                key={i}
                                className="overflow-hidden rounded-3xl border-0 bg-white shadow-md"
                            >
                                <Skeleton className="h-80 w-full" />

                                <CardContent className="space-y-4 p-5">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-6 w-full" />
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-32" />

                                    <div className="flex justify-between">
                                        <Skeleton className="h-7 w-20" />
                                        <Skeleton className="h-5 w-12" />
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <div className="py-10 text-center text-slate-500">
                        पुस्तके लोड करण्यात अडचण आली.
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {filteredBooks.length === 0 ? (
                            <div className="col-span-full py-16 text-center">
                                <p className="text-lg font-medium text-slate-600">
                                    कोणतेही पुस्तक आढळले नाही
                                </p>

                                <p className="mt-2 text-slate-500">
                                    दुसरे नाव वापरून शोधण्याचा प्रयत्न करा.
                                </p>
                            </div>
                        ) : (

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
                        )}
                    </div>
                )}


                {/* Mobile Button */}
                <div className="mt-10 text-center md:hidden">
                    <Link
                        href="/books"
                        className="rounded-xl bg-[#7A2E92] px-6 py-3 font-medium text-white hover:bg-[#69267d]"
                    >
                        सर्व पुस्तके पहा →
                    </Link>
                </div>

            </div>
        </section>

    );
}