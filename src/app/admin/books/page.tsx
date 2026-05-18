'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { BookOpenText, Pencil, Plus, Sparkles, Power, ShieldAlert, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/src/components/header'
import { SiteFooter } from '@/src/components/site-footer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/alert-dialog'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Textarea } from '@/src/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { useDemo } from '@/src/components/demo-provider'
import { getCategoryDropdownApi } from '@/src/lib/category-api'
import { getAuthorDropdownApi } from '@/src/lib/author-api'
import {
  adminGetAllBooksApi,
  adminBookDetailApi,
  createBookApi,
  deleteBookApi,
  featureBookApi,
  getBookAssetUrl,
  toggleBookApi,
  toCatalogBookFromDetail,
  type BookAdminDetailData,
  type BookListItemData,
  updateBookApi,
} from '@/src/lib/book-api'
import { upsertCatalogBooks } from '@/src/lib/book-catalog'

type DropdownItem = {
  id: number
  name: string
}

type BookFormState = {
  categoryId: string
  authorId: string
  title: string
  description: string
  language: string
  totalPages: string
  publishedYear: string
  isbn: string
  price: string
  isFeatured: boolean
  isActive: boolean
  tags: string
  coverFile: File | null
  pdfFile: File | null
}

const emptyForm: BookFormState = {
  categoryId: '',
  authorId: '',
  title: '',
  description: '',
  language: 'English',
  totalPages: '0',
  publishedYear: '',
  isbn: '',
  price: '0',
  isFeatured: false,
  isActive: true,
  tags: '',
  coverFile: null,
  pdfFile: null,
}

export default function AdminBooksPage() {
  const { user, isHydrated } = useDemo()
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const [books, setBooks] = useState<BookListItemData[]>([])
  const [categories, setCategories] = useState<DropdownItem[]>([])
  const [authors, setAuthors] = useState<DropdownItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingBookId, setEditingBookId] = useState<number | null>(null)
  const [form, setForm] = useState<BookFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<BookListItemData | null>(null)
  const [busyBookId, setBusyBookId] = useState<number | null>(null)

  const dialogTitle = useMemo(
    () => (editingBookId ? 'Edit book' : 'Create book'),
    [editingBookId],
  )

  const loadBooks = async () => {
    setIsLoading(true)
    try {
      const res = await adminGetAllBooksApi({ page: 1, pageSize: 50 })
      if (res.success && res.data) {
        setBooks(res.data.items)
      } else {
        toast.error(res.message || 'Could not load books.')
      }
    } catch {
      toast.error('Network error. Could not load books.')
    } finally {
      setIsLoading(false)
    }
  }

  const loadLookups = async () => {
    const [categoryRes, authorRes] = await Promise.allSettled([
      getCategoryDropdownApi(),
      getAuthorDropdownApi(),
    ])

    if (categoryRes.status === 'fulfilled' && categoryRes.value.success && categoryRes.value.data) {
      setCategories(categoryRes.value.data.map((item) => ({ id: item.categoryId, name: item.categoryName })))
    } else {
      toast.error('Could not load categories. Please verify the Category API is available.')
    }

    if (authorRes.status === 'fulfilled' && authorRes.value.success && authorRes.value.data) {
      setAuthors(authorRes.value.data.map((item) => ({ id: item.authorId, name: item.authorName })))
    } else {
      setAuthors([])
      toast.info('Author dropdown is unavailable right now. You can still create a book without selecting an author.')
    }
  }

  useEffect(() => {
    if (!isHydrated || !isAdmin) {
      setIsLoading(false)
      return
    }

    void Promise.all([loadBooks(), loadLookups()])
  }, [isAdmin, isHydrated])

  const mapAdminDetailToForm = (book: BookAdminDetailData): BookFormState => ({
    categoryId: String(book.categoryId),
    authorId: book.authorId ? String(book.authorId) : '',
    title: book.title,
    description: book.description ?? '',
    language: book.language ?? 'English',
    totalPages: String(book.totalPages ?? 0),
    publishedYear: book.publishedYear ? String(book.publishedYear) : '',
    isbn: book.isbn ?? '',
    price: String(book.price ?? 0),
    isFeatured: book.isFeatured,
    isActive: book.isActive,
    tags: book.tags.join(', '),
    coverFile: null,
    pdfFile: null,
  })

  const openCreateDialog = () => {
    setEditingBookId(null)
    setForm(emptyForm)
    setIsDialogOpen(true)
  }

  const openEditDialog = async (bookId: number) => {
    try {
      const res = await adminBookDetailApi(bookId)
      if (!res.success || !res.data) {
        toast.error(res.message || 'Could not load book details.')
        return
      }

      setEditingBookId(bookId)
      setForm(mapAdminDetailToForm(res.data))
      setIsDialogOpen(true)
    } catch {
      toast.error('Network error. Could not load book details.')
    }
  }

  const getTags = () =>
    form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

  const handleCreate = async () => {
    if (!form.pdfFile) {
      toast.error('PDF file is required.')
      return
    }

    const res = await createBookApi({
      categoryId: Number(form.categoryId),
      authorId: form.authorId ? Number(form.authorId) : undefined,
      title: form.title.trim(),
      description: form.description.trim(),
      language: form.language.trim(),
      totalPages: Number(form.totalPages) || 0,
      publishedYear: form.publishedYear ? Number(form.publishedYear) : undefined,
      isbn: form.isbn.trim(),
      price: Number(form.price) || 0,
      isFeatured: form.isFeatured,
      tagsRaw: getTags().join(', '),
      pdfFile: form.pdfFile,
      coverFile: form.coverFile,
    })

    if (!res.success || !res.data) {
      toast.error(res.message || 'Could not create book.')
      return
    }

    upsertCatalogBooks([toCatalogBookFromDetail(res.data)])
    toast.success('Book created successfully.')
    setIsDialogOpen(false)
    setForm(emptyForm)
    await loadBooks()
  }

  const handleUpdate = async () => {
    if (!editingBookId) return

    const res = await updateBookApi({
      bookId: editingBookId,
      categoryId: Number(form.categoryId),
      authorId: form.authorId ? Number(form.authorId) : null,
      title: form.title.trim(),
      description: form.description.trim(),
      language: form.language.trim(),
      totalPages: Number(form.totalPages) || 0,
      publishedYear: form.publishedYear ? Number(form.publishedYear) : null,
      isbn: form.isbn.trim(),
      price: Number(form.price) || 0,
      isFeatured: form.isFeatured,
      isActive: form.isActive,
      tagsRaw: getTags().join(', '),
      pdfFile: form.pdfFile,
      coverFile: form.coverFile,
    })

    if (!res.success || !res.data) {
      toast.error(res.message || 'Could not update book.')
      return
    }

    upsertCatalogBooks([toCatalogBookFromDetail(res.data)])
    toast.success('Book updated successfully.')
    setIsDialogOpen(false)
    await loadBooks()
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.title.trim()) {
      toast.error('Title is required.')
      return
    }

    if (!form.categoryId) {
      toast.error('Category is required.')
      return
    }

    setIsSaving(true)
    try {
      if (editingBookId) {
        await handleUpdate()
      } else {
        await handleCreate()
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not save book.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (book: BookListItemData) => {
    setBusyBookId(book.bookId)
    try {
      const res = await toggleBookApi(book.bookId)
      if (res.success) {
        toast.success(res.message || 'Book status updated.')
        await loadBooks()
      } else {
        toast.error(res.message || 'Could not update book status.')
      }
    } catch {
      toast.error('Network error. Could not update book status.')
    } finally {
      setBusyBookId(null)
    }
  }

  const handleFeature = async (book: BookListItemData) => {
    setBusyBookId(book.bookId)
    try {
      const res = await featureBookApi(book.bookId)
      if (res.success) {
        toast.success(res.message || 'Book feature status updated.')
        await loadBooks()
      } else {
        toast.error(res.message || 'Could not update feature status.')
      }
    } catch {
      toast.error('Network error. Could not update feature status.')
    } finally {
      setBusyBookId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setBusyBookId(deleteTarget.bookId)
    try {
      const res = await deleteBookApi(deleteTarget.bookId)
      if (res.success) {
        toast.success(res.message || 'Book deleted.')
        setDeleteTarget(null)
        await loadBooks()
      } else {
        toast.error(res.message || 'Could not delete book.')
      }
    } catch {
      toast.error('Network error. Could not delete book.')
    } finally {
      setBusyBookId(null)
    }
  }

  const renderUnauthorized = () => (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <Card className="section-shell rounded-[32px] p-8 text-center shadow-none">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-rose-100 text-rose-700">
            <ShieldAlert className="size-8" />
          </div>
          <h1 className="mt-5 text-3xl font-semibold">Admin access required</h1>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            This page is available only to administrators. Sign in with an admin account to manage books.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/">
              <Button variant="outline" className="rounded-full">Back to home</Button>
            </Link>
            <Link href="/login">
              <Button className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white">
                Sign in
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      <SiteFooter />
    </main>
  )

  if (!isHydrated) {
    return (
      <main className="min-h-screen">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Card className="section-shell rounded-[32px] p-8 shadow-none">
            <p className="text-sm text-muted-foreground">Loading admin workspace...</p>
          </Card>
        </div>
        <SiteFooter />
      </main>
    )
  }

  if (!isAdmin) return renderUnauthorized()

  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="section-shell overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
                Admin book manager
              </Badge>
              <h1 className="mt-5 font-display text-5xl leading-none sm:text-6xl">
                Add, edit, and publish bookstore books.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                Create books with PDF, cover image, preview file, metadata, tags, featured status, and active status
                using your real backend Book APIs.
              </p>
            </div>

            <Button
              className="h-12 rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] px-6 text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
              onClick={openCreateDialog}
            >
              <Plus className="mr-2 size-4" />
              Add book
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="section-shell rounded-[28px] p-6 shadow-none">
            <p className="text-sm font-medium text-muted-foreground">Visible books</p>
            <p className="mt-2 text-3xl font-semibold">{books.length}</p>
          </Card>
          <Card className="section-shell rounded-[28px] p-6 shadow-none">
            <p className="text-sm font-medium text-muted-foreground">Featured books</p>
            <p className="mt-2 text-3xl font-semibold">{books.filter((book) => book.isFeatured).length}</p>
          </Card>
          <Card className="section-shell rounded-[28px] p-6 shadow-none">
            <p className="text-sm font-medium text-muted-foreground">Categories available</p>
            <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
          </Card>
        </section>

        <section className="section-shell rounded-[32px] p-5 shadow-none sm:p-8">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-brand)]">
              Book list
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Current active books</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading books...</p>
          ) : books.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/70 bg-white/70 p-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)]">
                <BookOpenText className="size-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">No books yet</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create your first book and it will appear in the public bookstore with its cover image.
              </p>
              <Button className="mt-5 rounded-full" onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                Create book
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Book</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {books.map((book) => {
                  const isBusy = busyBookId === book.bookId
                  return (
                    <TableRow key={book.bookId}>
                      <TableCell className="whitespace-normal">
                        <div className="flex items-center gap-3">
                          <div className="h-16 w-12 overflow-hidden rounded-xl bg-slate-100">
                            <img
                              src={getBookAssetUrl(book.coverImageUrl) ?? 'https://placehold.co/300x450/e8edf7/16213f?text=Book'}
                              alt={book.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold">{book.title}</p>
                            <p className="text-xs text-muted-foreground">{book.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{book.authorName ?? 'Unknown'}</TableCell>
                      <TableCell>{book.categoryName}</TableCell>
                      <TableCell>Rs. {book.finalPrice ?? book.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={book.isFeatured ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-100 text-slate-600'}
                        >
                          {book.isFeatured ? 'Featured' : 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEditDialog(book.bookId)}>
                            <Pencil className="mr-2 size-3.5" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => handleFeature(book)} disabled={isBusy}>
                            <Sparkles className="mr-2 size-3.5" />
                            {book.isFeatured ? 'Unfeature' : 'Feature'}
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full" onClick={() => handleToggle(book)} disabled={isBusy}>
                            <Power className="mr-2 size-3.5" />
                            Toggle
                          </Button>
                          <Button variant="outline" size="sm" className="rounded-full text-rose-600 hover:text-rose-700" onClick={() => setDeleteTarget(book)} disabled={isBusy}>
                            <Trash2 className="mr-2 size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </section>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              {editingBookId ? 'Update the book and its uploaded assets.' : 'Create a new book with PDF, cover, and optional preview.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Input id="language" value={form.language} onChange={(event) => setForm((current) => ({ ...current, language: event.target.value }))} disabled={isSaving} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoryId">Category</Label>
                <select id="categoryId" value={form.categoryId} onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" disabled={isSaving}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorId">Author</Label>
                <select id="authorId" value={form.authorId} onChange={(event) => setForm((current) => ({ ...current, authorId: event.target.value }))} className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm" disabled={isSaving}>
                  <option value="">{authors.length > 0 ? 'Select author' : 'No author API available'}</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="min-h-28" disabled={isSaving} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" type="number" step="0.01" value={form.price} onChange={(event) => setForm((current) => ({ ...current, price: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalPages">Total Pages</Label>
                <Input id="totalPages" type="number" value={form.totalPages} onChange={(event) => setForm((current) => ({ ...current, totalPages: event.target.value }))} disabled={isSaving} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="publishedYear">Published Year</Label>
                <Input id="publishedYear" type="number" value={form.publishedYear} onChange={(event) => setForm((current) => ({ ...current, publishedYear: event.target.value }))} disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="isbn">ISBN</Label>
                <Input id="isbn" value={form.isbn} onChange={(event) => setForm((current) => ({ ...current, isbn: event.target.value }))} disabled={isSaving} />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="fiction, bestseller, pdf" disabled={isSaving} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverFile">Cover file</Label>
                <Input id="coverFile" type="file" accept="image/*" onChange={(event) => setForm((current) => ({ ...current, coverFile: event.target.files?.[0] ?? null }))} disabled={isSaving} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pdfFile">Book PDF {editingBookId ? '(optional replacement)' : ''}</Label>
                <Input id="pdfFile" type="file" accept="application/pdf" onChange={(event) => setForm((current) => ({ ...current, pdfFile: event.target.files?.[0] ?? null }))} disabled={isSaving} />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-2xl border border-white/70 bg-slate-50 px-4 py-3 text-sm">
                <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm((current) => ({ ...current, isFeatured: event.target.checked }))} disabled={isSaving} />
                Mark this book as featured
              </label>
              {editingBookId ? (
                <label className="flex items-center gap-3 rounded-2xl border border-white/70 bg-slate-50 px-4 py-3 text-sm">
                  <input type="checkbox" checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} disabled={isSaving} />
                  Keep this book active after saving
                </label>
              ) : null}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingBookId ? 'Save changes' : 'Create book'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this book?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget ? `This will remove "${deleteTarget.title}" permanently. Books that have been purchased cannot be deleted by the backend.` : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-rose-600 text-white hover:bg-rose-700" onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SiteFooter />
    </main>
  )
}
