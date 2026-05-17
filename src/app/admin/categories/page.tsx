'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FolderKanban, Pencil, Plus, Power, ShieldAlert, Trash2 } from 'lucide-react'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { Textarea } from '@/src/components/ui/textarea'
import { useDemo } from '@/src/components/demo-provider'
import {
  createCategoryApi,
  deleteCategoryApi,
  getAllCategoriesApi,
  type CategoryDetail,
  toggleCategoryApi,
  updateCategoryApi,
} from '@/src/lib/category-api'

type CategoryFormState = {
  categoryName: string
  description: string
  thumbnailUrl: string
  sortOrder: string
  isActive: boolean
}

const emptyForm: CategoryFormState = {
  categoryName: '',
  description: '',
  thumbnailUrl: '',
  sortOrder: '0',
  isActive: true,
}

export default function AdminCategoriesPage() {
  const { user, isHydrated } = useDemo()
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const [categories, setCategories] = useState<CategoryDetail[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryDetail | null>(null)
  const [form, setForm] = useState<CategoryFormState>(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState<CategoryDetail | null>(null)
  const [busyCategoryId, setBusyCategoryId] = useState<number | null>(null)

  const title = useMemo(
    () => (editingCategory ? 'Edit category' : 'Create category'),
    [editingCategory],
  )

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const res = await getAllCategoriesApi()
      if (res.success && res.data) {
        setCategories(res.data)
      } else {
        toast.error(res.message || 'Could not load categories.')
      }
    } catch {
      toast.error('Network error. Could not load categories.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isHydrated || !isAdmin) {
      setIsLoading(false)
      return
    }

    void loadCategories()
  }, [isAdmin, isHydrated])

  const openCreateDialog = () => {
    setEditingCategory(null)
    setForm(emptyForm)
    setIsDialogOpen(true)
  }

  const openEditDialog = (category: CategoryDetail) => {
    setEditingCategory(category)
    setForm({
      categoryName: category.categoryName,
      description: category.description ?? '',
      thumbnailUrl: category.thumbnailUrl ?? '',
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.categoryName.trim()) {
      toast.error('Category name is required.')
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        categoryName: form.categoryName.trim(),
        description: form.description.trim(),
        thumbnailUrl: form.thumbnailUrl.trim(),
        sortOrder: Number(form.sortOrder) || 0,
      }

      const res = editingCategory
        ? await updateCategoryApi({
            categoryId: editingCategory.categoryId,
            isActive: form.isActive,
            ...payload,
          })
        : await createCategoryApi(payload)

      if (res.success) {
        toast.success(res.message || (editingCategory ? 'Category updated.' : 'Category created.'))
        setIsDialogOpen(false)
        setEditingCategory(null)
        setForm(emptyForm)
        await loadCategories()
      } else {
        toast.error(res.message || 'Could not save category.')
      }
    } catch {
      toast.error('Network error. Could not save category.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggle = async (category: CategoryDetail) => {
    setBusyCategoryId(category.categoryId)
    try {
      const res = await toggleCategoryApi(category.categoryId)
      if (res.success) {
        toast.success(res.message || 'Category status updated.')
        await loadCategories()
      } else {
        toast.error(res.message || 'Could not update category status.')
      }
    } catch {
      toast.error('Network error. Could not update category status.')
    } finally {
      setBusyCategoryId(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return

    setBusyCategoryId(deleteTarget.categoryId)
    try {
      const res = await deleteCategoryApi(deleteTarget.categoryId)
      if (res.success) {
        toast.success(res.message || 'Category deleted.')
        setDeleteTarget(null)
        await loadCategories()
      } else {
        toast.error(res.message || 'Could not delete category.')
      }
    } catch {
      toast.error('Network error. Could not delete category.')
    } finally {
      setBusyCategoryId(null)
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
            This page is available only to administrators. Sign in with an admin account to manage categories.
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
                Admin category manager
              </Badge>
              <h1 className="mt-5 font-display text-5xl leading-none sm:text-6xl">
                Add, edit, and control bookstore categories.
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                This screen uses your real category APIs. Admins can create new categories, update metadata, toggle
                active status, and remove categories that are not linked to books.
              </p>
            </div>

            <Button
              className="h-12 rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] px-6 text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
              onClick={openCreateDialog}
            >
              <Plus className="mr-2 size-4" />
              Add category
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Card className="section-shell rounded-[28px] p-6 shadow-none">
            <p className="text-sm font-medium text-muted-foreground">Total categories</p>
            <p className="mt-2 text-3xl font-semibold">{categories.length}</p>
          </Card>
          <Card className="section-shell rounded-[28px] p-6 shadow-none">
            <p className="text-sm font-medium text-muted-foreground">Active categories</p>
            <p className="mt-2 text-3xl font-semibold">{categories.filter((category) => category.isActive).length}</p>
          </Card>
          <Card className="section-shell rounded-[28px] p-6 shadow-none">
            <p className="text-sm font-medium text-muted-foreground">Books mapped</p>
            <p className="mt-2 text-3xl font-semibold">
              {categories.reduce((total, category) => total + category.totalBooks, 0)}
            </p>
          </Card>
        </section>

        <section className="section-shell rounded-[32px] p-5 shadow-none sm:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[color:var(--color-brand)]">
                Category list
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Current categories</h2>
            </div>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading categories...</p>
          ) : categories.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/70 bg-white/70 p-8 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)]">
                <FolderKanban className="size-6" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">No categories yet</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Create your first category to start organizing books in the admin panel.
              </p>
              <Button className="mt-5 rounded-full" onClick={openCreateDialog}>
                <Plus className="mr-2 size-4" />
                Create category
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sort Order</TableHead>
                  <TableHead>Total Books</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => {
                  const isBusy = busyCategoryId === category.categoryId

                  return (
                    <TableRow key={category.categoryId}>
                      <TableCell className="whitespace-normal">
                        <div>
                          <p className="font-semibold">{category.categoryName}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {category.description || 'No description provided.'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            category.isActive
                              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 bg-slate-100 text-slate-600'
                          }
                        >
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>{category.sortOrder}</TableCell>
                      <TableCell>{category.totalBooks}</TableCell>
                      <TableCell>{new Date(category.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => openEditDialog(category)}
                          >
                            <Pencil className="mr-2 size-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full"
                            onClick={() => handleToggle(category)}
                            disabled={isBusy}
                          >
                            <Power className="mr-2 size-3.5" />
                            {category.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-rose-600 hover:text-rose-700"
                            onClick={() => setDeleteTarget(category)}
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
              {editingCategory
                ? 'Update the category details and save your changes.'
                : 'Create a new category for your bookstore catalog.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="categoryName">Category name</Label>
                <Input
                  id="categoryName"
                  value={form.categoryName}
                  onChange={(event) => setForm((current) => ({ ...current, categoryName: event.target.value }))}
                  placeholder="Fiction, Business, Self Help..."
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={form.sortOrder}
                  onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))}
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={form.thumbnailUrl}
                  onChange={(event) => setForm((current) => ({ ...current, thumbnailUrl: event.target.value }))}
                  placeholder="https://example.com/category-image.jpg"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder="Short description for this category"
                  disabled={isSaving}
                  className="min-h-28"
                />
              </div>
            </div>

            {editingCategory ? (
              <label className="flex items-center gap-3 rounded-2xl border border-white/70 bg-slate-50 px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                  disabled={isSaving}
                />
                Keep this category active after saving
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
                {isSaving ? 'Saving...' : editingCategory ? 'Save changes' : 'Create category'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this category?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `This will remove "${deleteTarget.categoryName}" permanently. Categories with books cannot be deleted by the backend.`
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
