'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  ChevronDown,
  LayoutDashboard,
  FolderKanban,
  PenSquare,
  BookOpen,
  BookOpenText,
  Library,
  LogOut,
  Menu,
  ShoppingBag,
  UserRound,
  UsersRound,
} from 'lucide-react'

import { useDemo } from '@/src/components/demo-provider'
import { ThemeToggle } from '@/src/components/theme-toggle'
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/src/components/ui/sheet'
import { cn } from '@/src/lib/utils'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/books', label: 'Books' },
]

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, cartCount, logout, isHydrated } = useDemo()
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false)
  const visibleUser = isHydrated ? user : null
  const visibleCartCount = isHydrated ? cartCount : 0

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]">
            <BookOpen className="size-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold uppercase tracking-[0.25em] text-[color:var(--color-brand)]">
              BookVault
            </p>
            <p className="truncate text-sm text-muted-foreground">
              Internal Reading and Knowledge Resource Center
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-border/70 bg-white/70 p-1 md:flex">
          {navItems.map((item) => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[color:var(--color-brand)] text-white shadow-sm hover:bg-[color:var(--color-brand)]'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {visibleUser ? (
            <>
              {isAdmin ? (
                <div
                  onMouseEnter={() => setIsAdminMenuOpen(true)}
                  onMouseLeave={() => setIsAdminMenuOpen(false)}
                >
                  <DropdownMenu open={isAdminMenuOpen} onOpenChange={setIsAdminMenuOpen}>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="gap-2 rounded-full bg-white/80">
                        <LayoutDashboard className="size-4" />
                        Admin
                        <ChevronDown className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56 rounded-2xl p-2">
                      <DropdownMenuLabel>Admin tools</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin/categories" className="cursor-pointer rounded-xl">
                          <FolderKanban className="size-4" />
                          Categories
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/authors" className="cursor-pointer rounded-xl">
                          <UsersRound className="size-4" />
                          Authors
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/admin/books" className="cursor-pointer rounded-xl">
                          <BookOpenText className="size-4" />
                          Books
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ) : null}
              <Link href="/library">
                <Button variant="ghost" className="gap-2 rounded-full">
                  <Library className="size-4" />
                  My Library
                </Button>
              </Link>
              <Link href="/cart">
                <Button variant="outline" className="relative gap-2 rounded-full bg-white/80">
                  <ShoppingBag className="size-4" />
                  Cart
                  {visibleCartCount > 0 ? (
                    <span className="flex min-w-5 items-center justify-center rounded-full bg-[color:var(--color-brand)] px-1.5 py-0.5 text-xs font-semibold text-white">
                      {visibleCartCount}
                    </span>
                  ) : null}
                </Button>
              </Link>
              <div className="flex items-center gap-3 rounded-full border border-border/70 bg-white/80 px-2 py-1.5">
                <Avatar className="size-9 border border-border">
                  <AvatarFallback className="bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]">
                    {visibleUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-28">
                  <p className="truncate text-sm font-semibold">{visibleUser.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{visibleUser.email}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleLogout}>
                <LogOut className="size-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/register">
                <Button variant="ghost" className="rounded-full text-muted-foreground">
                  Register
                </Button>
              </Link>
              <Link href="/login">
                <Button className="rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)] hover:opacity-95">
                  Sign in
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          {visibleUser ? (
            <Link href="/cart">
              <Button variant="outline" size="icon" className="relative rounded-full bg-white/80">
                <ShoppingBag className="size-4" />
                {visibleCartCount > 0 ? (
                  <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full bg-[color:var(--color-brand)] px-1 text-[10px] font-semibold text-white">
                    {visibleCartCount}
                  </span>
                ) : null}
              </Button>
            </Link>
          ) : null}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full bg-white/80">
                <Menu className="size-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88vw] max-w-sm border-l-white/60 bg-background/95">
              <SheetHeader>
                <SheetTitle className="text-left">BookVault</SheetTitle>
              </SheetHeader>

              <div className="mt-8 space-y-6">
                <div className="space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center rounded-2xl px-4 py-3 text-base font-medium transition-colors',
                        pathname === item.href
                          ? 'bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)]'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                {visibleUser ? (
                  <div className="space-y-3 rounded-3xl border border-border/70 bg-white/80 p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-11 border border-border">
                        <AvatarFallback className="bg-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]">
                          {visibleUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-semibold">{visibleUser.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{visibleUser.email}</p>
                      </div>
                    </div>
                    {isAdmin ? (
                      <div className="space-y-2">
                        <Link href="/admin/categories" className="block">
                          <Button variant="outline" className="w-full justify-start rounded-2xl bg-transparent">
                            <FolderKanban className="mr-2 size-4" />
                            Categories
                          </Button>
                        </Link>
                        <Link href="/admin/authors" className="block">
                          <Button variant="outline" className="w-full justify-start rounded-2xl bg-transparent">
                            <UsersRound className="mr-2 size-4" />
                            Authors
                          </Button>
                        </Link>
                        <Link href="/admin/books" className="block">
                          <Button variant="outline" className="w-full justify-start rounded-2xl bg-transparent">
                            <PenSquare className="mr-2 size-4" />
                            Books
                          </Button>
                        </Link>
                      </div>
                    ) : null}
                    <Link href="/library" className="block">
                      <Button variant="outline" className="w-full justify-start rounded-2xl bg-transparent">
                        <Library className="mr-2 size-4" />
                        My Library
                      </Button>
                    </Link>
                    <Link href="/cart" className="block">
                      <Button variant="outline" className="w-full justify-start rounded-2xl bg-transparent">
                        <ShoppingBag className="mr-2 size-4" />
                        Cart ({visibleCartCount})
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start rounded-2xl text-destructive hover:text-destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 size-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 rounded-3xl border border-border/70 bg-white/80 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[color:var(--color-brand-faint)] text-[color:var(--color-brand-strong)]">
                        <UserRound className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold">Welcome to BookVault</p>
                        <p className="text-sm text-muted-foreground">Login to unlock your library and cart</p>
                      </div>
                    </div>
                    <Link href="/login" className="block">
                      <Button className="w-full rounded-2xl bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white">
                        Login
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
