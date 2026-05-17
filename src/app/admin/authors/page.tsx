'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Pencil, Plus, Power, ShieldAlert, Trash2, UsersRound } from 'lucide-react'
import { toast } from 'sonner'

import { Header } from '@/components/header'
import { SiteFooter } from '@/components/site-footer'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { useDemo } from '@/components/demo-provider'
import {
  createAuthorApi,
  deleteAuthorApi,
  getAllAuthorsApi,
  type AuthorDetail,
  toggleAuthorApi,
  updateAuthorApi,
} from '@/lib/author-api'

type AuthorFormState = {
  authorName: string
  bio: string
  photoUrl: string
  isActive: boolean
}

const emptyForm: AuthorFormState = {
  authorName: '',
  bio: '',
  photoUrl: '',
  isActive: true,
}

export default function AdminAuthorsPage() {
  const { user, isHydrated } = useDemo()
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const [authors, setAuthors] = useState<AuthorDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingAuthor, setEditingAuthor] = useState<AuthorDetail | null>(null)
  const [form, setForm] = useState<AuthorFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<AuthorDetail | null>(null)
  const [busyAuthorId, setBusyAuthorId] = useState<number | null>(null)

  const title = useMemo(
    () => (editingAuthor ? 'Edit author' : 'Create author'),
    [editingAuthor],
  )

  const loadAuthors = async () => {
    setIsLoading(true)
    try {
      const res = await getAllAuthorsApi()
      if (res.success && res.data) {
        setAuthors(res.data)
      } else {
        toast.error(res.message || 'Could not load authors.')
      }
    } catch {
      toast.error('Network error. Could not load authors.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isHydrated || !isAdmin) {
      setIsLoading(false)
      return
    }

    void loadAuthors()
  }, [isAdmin, isHydrated])

  const openCreateDialog = () => {
    setEditingAuthor(null)
    setForm(emptyForm)
    setIsDialogOpen(true)
  }

  const openEditDialog = (author: AuthorDetail) => {
    setEditingAuthor(author)
    setForm({
      authorName: author.authorName,
      bio: author.bio ?? '',
      photoUrl: author.photoUrl ?? '',
      isActive: author.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.authorName.trim()) {
      toast.error('Author name is required.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        authorName: form.authorName.trim(),
        bio: form.bio.trim(),
        photoUrl: form.photoUrl.trim(),
      }

      const res = editingAuthor
        ? await updateAuthorApi({
            authorId: editingAuthor.authorId,
            isActive: form.isActive,
            ...payload,
          })
        : await createAuthorApi(payload)

      if (res.success) {
        toast.success(res.message || (editingAuthor ? 'Author updated.' : 'Author created.'))
        setIsDialogOpen(false)
        setEditingAuthor(null)
        setForm(emptyForm)
        await loadAuthors()
      } else {
        toast.error(res.message || 'Could not save author.')
      }
    } catch {
      toast.error('Network error. Could not save author.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (author: AuthorDetail) => {
    setBusyAuthorId(author.authorId)
    try {
      const res = await toggleAuthorApi(author.authorId)
      if (res.success) {
        toast.success(res.message || 'Author status updated.')
        await loadAuthors()
      } else {
        toast.error(res.message || 'Could not update author status.')
      }
    } catch {
      toast.error('Network error. Could not update author status.')
    } finally {
      setBusyAuthorId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setBusyAuthorId(deleteTarget.authorId)
    try {
      const res = await deleteAuthorApi(deleteTarget.authorId)
      if (res.success) {
        toast.success(res.message || 'Author deleted.')
        setDeleteTarget(null)
        await loadAuthors()
      } else {
        toast.error(res.message || 'Could not delete author.')
      }
    } catch {
      toast.error('Network error. Could not delete author.')
    } finally {
      setBusyAuthorId(null)
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
            This page is available only to administrators. Sign in with an admin account to manage authors.
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

  if (!isAdmin) {
    return renderUnauthorized()
  }

  return (
    <main className="min-h-screen">
      <Header />

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section className="section-shell overflow-hidden px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
                Admin author manager
              </Badge>
              <h1 className="mt-5 font-display text-5xl leading-none sm:text-6xl">
                Add, edit, and control bookstore authors.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                This screen uses your real author APIs. Admins can create authors, update their details, toggle active
                status, and delete authors who do not have books mapped to them.
              </p>
            </div>

            <Button
              className="h-12 rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] px-6 text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
              onClick={openCreateDialog}
            >
              <Plus className="mr-2 size-4" />
              Add author
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="section-shell rounded-[28px] p-6 shadow-none">
            <p className="text-sm font-medium text-muted-foreground">Total authors</p>
            <p className="mt-2 text-3xl font-semibold">{authors.length}</p>
          </Card>
          <Card className="section-shell rounded-[28px] p-6 shadow-none">
            <p className="text-sm font-medium text-muted-foreground">Active authors</p>
            <p className="mt-2 text-3xl font-semibold">{authors.filter((author) => author.isActive).length}</p>
          </Card>
          <Card className="section-shell rounded-[28px] p-6 shadow-none">
            <p className="text-sm font-medium text-muted-foreground">Books mapped</p>
            <p className="mt-2 text-3xl font-semibold">
              {authors.reduce((total, author) => total + author.totalBooks, 0)}
            </p>
          </Card>
        </section>

        <section className="section-shell rounded-[32px] p-5 shadow-none sm:p-8">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-brand)]">
              Author list
            </p>
            <h2 className="mt-2 text-2xl font-semibold">Current authors</h2>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading authors...</p>
          ) : authors.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/70 bg-white/70 p-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)]">
                <UsersRound className="size-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">No authors yet</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create your first author to start organizing books in the admin panel.
              </p>
              <Button className="mt-5 rounded-full" onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                Create author
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total Books</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authors.map((author) => {
                  const isBusy = busyAuthorId === author.authorId

                  return (
                    <TableRow key={author.authorId}>
                      <TableCell className="whitespace-normal">
                        <div>
                          <p className="font-semibold">{author.authorName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {author.bio || 'No biography provided.'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            author.isActive
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-slate-100 text-slate-600'
                          }
                        >
                          {author.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{author.totalBooks}</TableCell>
                      <TableCell>{new Date(author.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => openEditDialog(author)}
                          >
                            <Pencil className="mr-2 size-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleToggle(author)}
                            disabled={isBusy}
                          >
                            <Power className="mr-2 size-3.5" />
                            {author.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-rose-600 hover:text-rose-700"
                            onClick={() => setDeleteTarget(author)}
                            disabled={isBusy}
                          >
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
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {editingAuthor
                ? 'Update the author details and save your changes.'
                : 'Create a new author for your bookstore catalog.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="authorName">Author name</Label>
                <Input
                  id="authorName"
                  value={form.authorName}
                  onChange={(event) => setForm((current) => ({ ...current, authorName: event.target.value }))}
                  placeholder="James Clear, Madeline Miller..."
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="photoUrl">Photo URL</Label>
                <Input
                  id="photoUrl"
                  value={form.photoUrl}
                  onChange={(event) => setForm((current) => ({ ...current, photoUrl: event.target.value }))}
                  placeholder="https://example.com/author-image.jpg"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="bio">Biography</Label>
                <Textarea
                  id="bio"
                  value={form.bio}
                  onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
                  placeholder="Short biography for this author"
                  disabled={isSaving}
                  className="min-h-28"
                />
              </div>
            </div>

            {editingAuthor ? (
              <label className="flex items-center gap-3 rounded-2xl border border-white/70 bg-slate-50 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  disabled={isSaving}
                />
                Keep this author active after saving
              </label>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : editingAuthor ? 'Save changes' : 'Create author'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this author?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will remove "${deleteTarget.authorName}" permanently. Authors with books cannot be deleted by the backend.`
                : 'This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-full bg-rose-600 text-white hover:bg-rose-700"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SiteFooter />
    </main>
  )
}
