'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Book } from '@/src/types/api.types';
import { getBooks } from '@/src/actions/api/books.actions';
import { Card, CardContent, } from '@/src/components/ui/card';
import { BookOpen } from 'lucide-react';
import { BookCover } from './book-cover';
import useSWR from 'swr';
import { latestBooksFetcher } from '@/src/lib/fetchers/book.fetcher';
import { Skeleton } from '@/src/components/ui/skeleton';

export function LatestBooks() {
    const {
        data: books = [],
        isLoading,
        error,
    } = useSWR('latest-books', latestBooksFetcher, {
        revalidateOnFocus: false,
    });

    return (
        <section className="bg-gradient-to-r from-transparent via-[#7A2E92]/20 to-transparent px-10 py-14">
            <div className="mx-auto max-w-7xl rounded-[40px] border border-white/70 bg-white/60 p-10 backdrop-blur-sm">
                {/* Section Header */}
                <div className="mb-10 flex items-center justify-between">
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

                    <Link
                        href="/books"
                        className="hidden rounded-xl bg-[#7A2E92] px-5 py-3 font-medium text-white transition hover:bg-[#69267d] md:flex md:items-center"
                    >
                        सर्व पुस्तके पहा →
                    </Link>
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
                            {books.map((book) => (
                                <Link key={book.bookId} href={`/books/${book.slug}`}>
                                    <Card className="group overflow-hidden rounded-3xl border-0 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl">
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
                            ))}
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