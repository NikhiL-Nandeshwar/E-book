'use client'

import Link from 'next/link'
import { ArrowRight, BookMarked, FolderKanban, Library, PenSquare, ShieldCheck, Smartphone, UsersRound } from 'lucide-react'

import { BookCard } from '@/src/components/book-card'
import { ChatbotWidget } from '@/src/components/chatbot-widget'
import { Header } from '@/src/components/header'
import { SiteFooter } from '@/src/components/site-footer'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { getFeaturedLocalBooks } from '@/src/lib/local-books'
import { type CatalogBook } from '@/src/lib/book-catalog'
import { useDemo } from '@/src/components/demo-provider'

const featuredBooks: CatalogBook[] = getFeaturedLocalBooks()

const highlights = [
  {
    title: 'Employee-Centric Reading Experience',
    description: 'A clean and simple interface that works seamlessly on mobile, tablet, and desktop.',
    icon: Smartphone,
  },
  {
    title: 'Secure Internal Access',
    description: 'A secure reading experience for internal use with controlled access and restricted actions.',
    icon: ShieldCheck,
  },
  {
    title: 'Department-Wise Knowledge Resources',
    description: 'Curated books related to training, policies, operations, services, and skill development.',
    icon: Library,
  },
]

export default function Home() {
  const { user, purchasedBooks, cartCount, isHydrated } = useDemo()
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const featuredCount = featuredBooks.length
  const libraryCount = isHydrated ? purchasedBooks.length : 0
  const currentCartCount = isHydrated ? cartCount : 0

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:space-y-12 lg:py-8">
        <section className="section-shell overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
                Internal digital library for bank employees
              </Badge>

              <div className="space-y-4">
                <h1 className="text-3xl font-[400] leading-tight tracking-tight font-display text-foreground sm:text-4xl lg:text-[54px]">
                  A digital book platform created for the study, reference and continuous learning of bank employees.
                </h1>
                <p className="max-w-2xl text-base leading-6 text-slate-600 sm:text-lg">
                  BookVault presents your online book management system like a polished Kindle-style experience:
                  immersive covers, elegant product pages, secure reading, and a mobile-first interface clients can
                  approve with confidence.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row">
                <Link href="/books">
                  <Button className="h-12 rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] px-7 text-white shadow-lg shadow-[color:var(--color-brand-soft)]">
                    View Book Collection
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3">
                <div className="dashboard-metric rounded-3xl border border-white/70 p-4">
                  <p className="text-2xl font-semibold text-foreground">{featuredBooks.length}+</p>
                  <p className="text-sm text-muted-foreground">Featured Books</p>
                </div>

                <div className="dashboard-metric rounded-3xl border border-white/70 p-4">
                  <p className="text-2xl font-semibold text-foreground">{purchasedBooks.length}</p>
                  <p className="text-sm text-muted-foreground">My Library</p>
                </div>

                <div className="dashboard-metric rounded-3xl border border-white/70 p-4">
                  <p className="text-2xl font-semibold text-foreground">{cartCount}</p>
                  <p className="text-sm text-muted-foreground">Selected Books</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-4 top-8 hidden h-24 w-24 rounded-full bg-[color:var(--color-brand-soft)] blur-3xl sm:block" />
              <div className="absolute -right-4 bottom-10 hidden h-28 w-28 rounded-full bg-amber-200/60 blur-3xl sm:block" />

              <div className="section-shell relative overflow-hidden bg-app-shell p-4 sm:p-6">
                <div className="rounded-[28px] border border-white/70 bg-[#16213f] p-4 text-white shadow-2xl shadow-slate-900/20 sm:p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-300">BookVault Reader</p>
                      <p className="mt-1 text-lg font-semibold">Today's recommended reading</p>
                    </div>
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10">
                      <BookMarked className="size-6 text-amber-300" />
                    </div>
                  </div>
                  <div className="grid grid-cols-[200px_1fr] gap-3 rounded-[28px] bg-slate-950/10 p-4">

                    <div className="relative flex h-56 w-full max-w-[180px] shrink-0 items-center justify-center overflow-hidden rounded-[22px] bg-transparent shadow-lg shadow-black/10 lg:h-64">
                      <img
                        src={featuredBooks[0]?.image || '/images/covers/legal_banking_acts.webp'}
                        alt={featuredBooks[0]?.title || 'Featured book'}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="flex flex-col justify-center space-y-4 py-2">

                      <Badge className="w-fit rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-slate-100 backdrop-blur">
                        {featuredBooks[0]?.genre ?? 'Featured'}
                      </Badge>

                      <div className="space-y-1">
                        <p className="text-[28px] font-semibold leading-tight text-white">
                          {featuredBooks[0]?.title}
                        </p>

                        <p className="text-sm font-medium text-slate-300">
                          by {featuredBooks[0]?.author}
                        </p>
                      </div>

                      <p className="max-w-[420px] text-[15px] leading-7 text-slate-300">
                        {featuredBooks[0]?.summary}
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/8 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Curated Collection
                      </p>

                      <p className="mt-1 text-lg font-normal text-white">
                        40+ Topics
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/8 px-4 py-3">
                      <p className="text-xs uppercase tracking-wide text-slate-400">
                        Reading Access
                      </p>

                      <p className="mt-1 text-lg font-normal text-white">
                        Read Anywhere
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <div key={item.title} className="section-shell p-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)]">
                <item.icon className="size-5" />
              </div>
              <h2 className="mt-4 text-xl font-bold">{item.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </section>

        {isAdmin ? (
          <section className="section-shell p-5 sm:p-8">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--color-brand)]">
                  Admin workspace
                </p>
                <h2 className="mt-2 font-display text-4xl leading-none sm:text-5xl">
                  Manage your bookstore data from one place.
                </h2>
              </div>
              <p className="max-w-xl text-sm leading-6 text-muted-foreground">
                These tools appear only for administrators. Categories, authors, and books are now available from the
                same admin workspace.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Link href="/admin/categories" className="group block">
                <div className="h-full rounded-[28px] border border-white/70 bg-white/85 p-6 transition-transform duration-200 group-hover:-translate-y-1">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)]">
                    <FolderKanban className="size-5" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold">Manage Categories</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Add, edit, activate, deactivate, and delete categories with your real backend API.
                  </p>
                  <div className="mt-5 inline-flex items-center text-sm font-semibold text-[color:var(--color-brand)]">
                    Open categories
                    <ArrowRight className="ml-2 size-4" />
                  </div>
                </div>
              </Link>

              <Link href="/admin/authors" className="group block">
                <div className="h-full rounded-[28px] border border-white/70 bg-white/85 p-6 transition-transform duration-200 group-hover:-translate-y-1">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)]">
                    <UsersRound className="size-5" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold">Manage Authors</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Add, edit, activate, deactivate, and delete authors with your real backend API.
                  </p>
                  <div className="mt-5 inline-flex items-center text-sm font-semibold text-[color:var(--color-brand)]">
                    Open authors
                    <ArrowRight className="ml-2 size-4" />
                  </div>
                </div>
              </Link>

              <Link href="/admin/books" className="group block">
                <div className="h-full rounded-[28px] border border-dashed border-white/70 bg-white/65 p-6 transition-transform duration-200 group-hover:-translate-y-1">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <PenSquare className="size-5" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold">Manage Books</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Navigation is ready for book CRUD. Wire the Book API next and this page becomes the full manager.
                  </p>
                  <div className="mt-5 inline-flex items-center text-sm font-semibold text-slate-500">
                    Open books
                    <ArrowRight className="ml-2 size-4" />
                  </div>
                </div>
              </Link>
            </div>
          </section>
        ) : null}

        <section className="section-shell p-5 sm:p-8">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--color-brand)]">
                Featured collection
              </p>
              <h2 className="mt-2 text-4xl leading-none sm:text-5xl font-display">Useful reference books for employees</h2>
            </div>
            <p className="max-w-xl leading-6 text-muted-foreground">
              Training, guidelines, professional skills, and books useful in daily work are available in one place.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featuredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </section>

        <section className="section-shell trust-panel overflow-hidden px-6 py-8 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--color-brand)]">
                Internal Knowledge Management
              </p>
              <h2 className="mt-3 font-display text-4xl sm:text-5xl">
                A unified digital platform connecting reading, references, and employee development.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
                Employees can discover essential books, save selected titles to their personal library,
                and continue learning through a secure reader experience.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[28px] border border-white/70 bg-white/80 p-5">
                <p className="text-sm font-medium text-muted-foreground">
                  Easy Access Control
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Employee login and personalized library
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/80 p-5">
                <p className="text-sm font-medium text-muted-foreground">
                  Category-Based Collection
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Curated books for skills, policies, and knowledge growth
                </p>
              </div>

              <div className="rounded-[28px] border border-white/70 bg-white/80 p-5">
                <p className="text-sm font-medium text-muted-foreground">
                  Secure Reading
                </p>
                <p className="mt-2 text-lg font-semibold">
                  Protected PDF-style reader with controlled access
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
      <ChatbotWidget />
    </main>
  )
}
