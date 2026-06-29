'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { BookOpen, ChevronLeft, ChevronRight, Lock, Maximize, Minimize, Minus, Plus, RefreshCw, X } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/src/components/custom/demo-provider'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { getBookBySlugApi, toCatalogBookFromDetail } from '@/src/lib/book-api'
import { getCatalogBookById, type CatalogBook, upsertCatalogBooks } from '@/src/lib/book-catalog'
import { getPdfReadUrl, requestPdfReadTokenApi } from '@/src/lib/pdf-stream-api'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
// import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

declare global {
  interface Window {
    pdfjsLib?: {
      getDocument: (source: { data: Uint8Array }) => { promise: Promise<PDFDocumentProxy> }
      GlobalWorkerOptions: { workerSrc: string }
    }
  }
}


export default function PDFReaderPage() {
  const params = useParams()
  const { purchasedIds } = useAuth()
  const [book, setBook] = useState<CatalogBook | null>(null)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [pageCount, setPageCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [zoom, setZoom] = useState(1.1)
  const [isLoadingBook, setIsLoadingBook] = useState(true)
  const [isLoadingReader, setIsLoadingReader] = useState(false)
  const [isRenderingPage, setIsRenderingPage] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [readerError, setReaderError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const viewerShellRef = useRef<HTMLDivElement | null>(null)
  const pdfDocumentRef = useRef<PDFDocumentProxy | null>(null)

  const bookId = params.id as string
  const hasAccess = book && (purchasedIds.includes(book.id) || book.isPurchased)

  useEffect(() => {
    const cached = getCatalogBookById(bookId)
    if (cached) {
      setBook(cached)
      setIsLoadingBook(false)
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
        setIsLoadingBook(false)
      }
    }

    void loadBook()
  }, [bookId])

  useEffect(() => {
    if (!book || !hasAccess) return

    let cancelled = false

    const loadReader = async () => {
      setIsLoadingReader(true)
      setReaderError(null)

      try {
        const response = await requestPdfReadTokenApi(book.bookId)

        if (!response.success || !response.token || !pdfjsLib) {
          if (!cancelled) {
            setReaderError(response.message || 'Could not open this book for reading.')
          }
          return
        }

        const pdfResponse = await fetch(getPdfReadUrl(response.token), {
          credentials: 'include',
        })

        if (!pdfResponse.ok) {
          throw new Error('Could not fetch protected PDF.')
        }

        const pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer())
        const pdfDocument = await pdfjsLib.getDocument({ data: pdfBytes }).promise

        if (!cancelled) {
          pdfDocumentRef.current = pdfDocument
          setPageCount(pdfDocument.numPages)
          setCurrentPage(1)
          setTotalPages(response.totalPages ?? pdfDocument.numPages ?? book.pages ?? null)
        }
      } catch (error) {
        if (!cancelled) {
          setReaderError(error instanceof Error ? error.message : 'Could not open this book for reading.')
        }
      } finally {
        if (!cancelled) {
          setIsLoadingReader(false)
        }
      }
    }

    void loadReader()

    return () => {
      cancelled = true
      pdfDocumentRef.current = null
    }
  }, [book, hasAccess])

  useEffect(() => {
    if (!pageCount) return
    setCurrentPage((current) => Math.min(current, pageCount))
  }, [pageCount])

  useEffect(() => {
    const pdfDocument = pdfDocumentRef.current
    const canvas = canvasRef.current
    if (!pdfDocument || !canvas) return

    let cancelled = false

    const renderPage = async () => {
      setIsRenderingPage(true)

      try {
        const page = await pdfDocument.getPage(currentPage)
        const viewport = page.getViewport({ scale: zoom })
        const context = canvas.getContext('2d')

        if (!context) {
          throw new Error('Could not prepare the reader canvas.')
        }

        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = `${viewport.width}px`
        canvas.style.height = `${viewport.height}px`

        await page.render({
          canvasContext: context,
          viewport,
          canvas,
        }).promise
      } catch (error) {
        if (!cancelled) {
          setReaderError(error instanceof Error ? error.message : 'Could not render this page.')
        }
      } finally {
        if (!cancelled) {
          setIsRenderingPage(false)
        }
      }
    }

    void renderPage()

    return () => {
      cancelled = true
    }
  }, [currentPage, zoom, pageCount])

  useEffect(() => {
    const blockUnsafeActions = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      const usesModifier = event.ctrlKey || event.metaKey

      if (
        (usesModifier && (key === 'p' || key === 's' || key === 'u')) ||
        key === 'printscreen'
      ) {
        event.preventDefault()
        toast.error('This protected reader does not allow print, save, or source actions.')
      }
    }

    const blockContextMenu = (event: MouseEvent) => {
      event.preventDefault()
    }

    window.addEventListener('keydown', blockUnsafeActions)
    window.addEventListener('contextmenu', blockContextMenu)

    return () => {
      window.removeEventListener('keydown', blockUnsafeActions)
      window.removeEventListener('contextmenu', blockContextMenu)
    }
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === viewerShellRef.current)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    const viewerShell = viewerShellRef.current
    if (!viewerShell) return

    try {
      if (document.fullscreenElement === viewerShell) {
        await document.exitFullscreen()
      } else {
        await viewerShell.requestFullscreen()
      }
    } catch {
      toast.error('Fullscreen mode is not available on this device.')
    }
  }

  const retryReader = async () => {
    if (!book) return

    setReaderError(null)
    setIsLoadingReader(true)

    try {
      const response = await requestPdfReadTokenApi(book.bookId)

      if (!response.success || !response.token || !pdfjsLib) {
        setReaderError(response.message || 'Could not open this book for reading.')
        return
      }

      const pdfResponse = await fetch(getPdfReadUrl(response.token), {
        credentials: 'include',
      })

      if (!pdfResponse.ok) {
        throw new Error('Could not fetch protected PDF.')
      }

      const pdfBytes = new Uint8Array(await pdfResponse.arrayBuffer())
      const pdfDocument = await pdfjsLib.getDocument({ data: pdfBytes }).promise

      pdfDocumentRef.current = pdfDocument
      setPageCount(pdfDocument.numPages)
      setCurrentPage(1)
      setTotalPages(response.totalPages ?? pdfDocument.numPages ?? book.pages ?? null)
    } catch (error) {
      setReaderError(error instanceof Error ? error.message : 'Could not open this book for reading.')
    } finally {
      setIsLoadingReader(false)
    }
  }

  if (isLoadingBook) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-xl rounded-[32px] border-white/70 bg-white/90 p-8 text-center shadow-none">
          <p className="text-muted-foreground">Loading your book...</p>
        </Card>
      </main>
    )
  }

  if (!book || !hasAccess) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-8">
        <Card className="w-full max-w-xl rounded-[32px] border-white/70 bg-white/90 p-8 text-center shadow-none">
          <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)]">
            <BookOpen className="size-7" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold">Reader access unavailable</h1>
          <p className="mt-3 text-muted-foreground">
            This book can only be opened after purchase from your library.
          </p>
          <Link href="/library">
            <Button className="mt-6 rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white">
              Go to My Library
            </Button>
          </Link>
        </Card>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#0f172a] text-white">
      {!isFullscreen ? (
        <header className="border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Link href="/library">
                <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10 hover:text-white">
                  <X className="size-5" />
                  <span className="sr-only">Close reader</span>
                </Button>
              </Link>
              <div className="min-w-0">
                <p className="truncate text-base font-semibold">{book.title}</p>
                <p className="truncate text-sm text-slate-300">{book.author}</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <p>Protected reading session</p>
              <p>Viewing only</p>
            </div>
          </div>
        </header>
      ) : null}

      {!isFullscreen ? (
        <div className="border-b border-amber-300/15 bg-amber-300/10 px-4 py-3 text-amber-50">
          <div className="mx-auto flex max-w-7xl items-start gap-3">
            <Lock className="mt-0.5 size-4 text-amber-300" />
            <div>
              <p className="text-sm font-semibold">This book is secured. Download and sharing are disabled.</p>
              <p className="text-xs text-amber-100/80">Rendered inside a protected viewer without browser PDF toolbar actions.</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`${isFullscreen ? 'flex-1 p-0' : 'flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-10'}`}>
        <div className={`mx-auto ${isFullscreen ? 'max-w-none' : 'grid max-w-7xl gap-6 lg:grid-cols-[240px_1fr]'}`}>
          {!isFullscreen ? (
            <aside className="rounded-[28px] border border-white/10 bg-white/5 p-4 lg:rounded-[32px] lg:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">Book info</p>
              <div className="mt-4 flex items-start gap-4 lg:mt-5 lg:block">
                <div className="w-24 shrink-0 rounded-[20px] bg-white/5 p-2 lg:w-auto lg:rounded-[24px] lg:p-3">
                  <img src={book.image} alt={book.title} className="aspect-[4/5] w-full rounded-[18px] object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white lg:hidden">{book.title}</p>
                  <p className="truncate text-xs text-slate-400 lg:hidden">{book.author}</p>
                  <div className="mt-3 space-y-3 text-sm text-slate-300 lg:mt-4">
                    <div className="flex items-center justify-between">
                      <span>Total pages</span>
                      <span className="font-semibold text-white">{totalPages ?? pageCount ?? book.pages}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Format</span>
                      <span className="font-semibold text-white">{book.format}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Access</span>
                      <span className="font-semibold text-emerald-300">Purchased</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}

          <section className="flex min-h-[70vh] items-center justify-center">
            {isLoadingReader ? (
              <div className="w-full max-w-4xl rounded-[34px] bg-[#eef2f8] p-10 text-center text-slate-900 shadow-[0_40px_120px_rgba(15,23,42,0.4)]">
                <p className="text-lg font-medium">Opening secure reader...</p>
                <p className="mt-2 text-sm text-slate-600">Preparing protected pages for reading.</p>
              </div>
            ) : readerError ? (
              <Card className="w-full max-w-2xl rounded-[32px] border-white/70 bg-white/95 p-8 text-center text-slate-900 shadow-none">
                <h2 className="text-2xl font-semibold">Could not open reader</h2>
                <p className="mt-3 text-muted-foreground">{readerError}</p>
                <div className="mt-6 flex justify-center">
                  <Button
                    className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white"
                    onClick={() => { void retryReader() }}
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Try Again
                  </Button>
                </div>
              </Card>
            ) : pageCount > 0 ? (
              <div
                ref={viewerShellRef}
                className={`w-full overflow-hidden bg-[#1e293b] shadow-[0_40px_120px_rgba(15,23,42,0.4)] ${isFullscreen ? 'h-screen rounded-none' : 'rounded-[28px] sm:rounded-[34px]'}`}
              >
                <div className={`border-b border-white/10 bg-slate-900/90 ${isFullscreen ? 'px-3 py-3 sm:px-4' : 'px-3 py-3 sm:px-4 sm:py-4'}`}>
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 lg:hidden">
                        <p className="truncate text-sm font-semibold text-white">{book.title}</p>
                        <p className="truncate text-xs text-slate-400">Page {currentPage} of {pageCount}</p>
                      </div>
                      <div className="flex items-center gap-2 lg:hidden">
                        {!isFullscreen ? (
                          <Link href="/library">
                            <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10 hover:text-white">
                              <X className="size-4" />
                            </Button>
                          </Link>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full text-white hover:bg-white/10 hover:text-white"
                          onClick={() => { void toggleFullscreen() }}
                        >
                          {isFullscreen ? <Minimize className="size-4" /> : <Maximize className="size-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                        disabled={currentPage === 1 || isRenderingPage}
                      >
                        <ChevronLeft className="size-4" />
                      </Button>
                      <div className="rounded-full bg-white/10 px-3 py-2 text-sm text-white sm:px-4">
                        Page {currentPage} / {pageCount}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                        disabled={currentPage === pageCount || isRenderingPage}
                      >
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setZoom((value) => Math.max(0.8, Number((value - 0.1).toFixed(1))))}
                        disabled={isRenderingPage}
                      >
                        <Minus className="size-4" />
                      </Button>
                      <div className="rounded-full bg-white/10 px-4 py-2 text-sm text-white">
                        {Math.round(zoom * 100)}%
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-white hover:bg-white/10 hover:text-white"
                        onClick={() => setZoom((value) => Math.min(2, Number((value + 0.1).toFixed(1))))}
                        disabled={isRenderingPage}
                      >
                        <Plus className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        className="rounded-full text-white hover:bg-white/10 hover:text-white"
                        onClick={() => { void toggleFullscreen() }}
                      >
                        {isFullscreen ? <Minimize className="mr-2 size-4" /> : <Maximize className="mr-2 size-4" />}
                        {isFullscreen ? 'Exit full screen' : 'Full screen'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className={`grid gap-0 ${isFullscreen ? 'h-[calc(100vh-72px)] lg:grid-cols-[190px_1fr]' : 'lg:grid-cols-[180px_1fr]'}`}>
                  <aside className="border-b border-white/10 bg-slate-950/70 p-3 sm:p-4 lg:border-b-0 lg:border-r">
                    <div className={`${isFullscreen ? 'max-h-[180px] lg:max-h-[calc(100vh-104px)]' : 'max-h-[140px] lg:max-h-[75vh]'} overflow-y-auto pr-1`}>
                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-1">
                        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
                          <button
                            key={page}
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            className={`rounded-2xl border px-3 py-4 text-sm transition-colors ${page === currentPage
                              ? 'border-amber-300 bg-amber-300/15 text-amber-100'
                              : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                              }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    </div>
                  </aside>

                  <div className={`relative flex items-start justify-center overflow-auto bg-[#e5e7eb] ${isFullscreen ? 'h-full p-2 sm:p-4' : 'min-h-[62vh] p-3 sm:min-h-[75vh] sm:p-6'}`}>
                    {isRenderingPage ? (
                      <div className="absolute inset-x-0 top-4 mx-auto w-fit rounded-full bg-slate-950/85 px-4 py-2 text-sm text-white">
                        Rendering page...
                      </div>
                    ) : null}
                    <div
                      className="max-w-full select-none"
                      onDragStart={(event) => event.preventDefault()}
                    >
                      <canvas
                        ref={canvasRef}
                        className="mx-auto block max-w-full rounded-[22px] bg-white shadow-[0_30px_70px_rgba(15,23,42,0.2)]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </main>
  )
}
