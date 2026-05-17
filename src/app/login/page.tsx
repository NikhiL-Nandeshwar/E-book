'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Library, LockKeyhole, Mail } from 'lucide-react'

import { useDemo } from '@/src/components/demo-provider'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { toast } from 'sonner'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useDemo()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email || !password) {
      toast.error('Please enter your email and password.')
      return
    }

    if (!email.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    const result = await login(email, password)
    setIsLoading(false)

    if (result.success) {
      router.push('/')
    } else {
      toast.error(result.message)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* ── Left column ─────────────────────────────────────────────── */}
        <section className="section-shell hidden flex-col justify-between p-8 lg:flex">
          <div>
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              BookVault
            </Badge>
            <h1 className="mt-6 font-display text-6xl leading-none">
              Welcome back to your digital reading lounge.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
              Sign in to access your library, continue reading, and discover new titles curated
              just for you.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <Mail className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Secure sign-in</p>
              <p className="mt-2 text-sm text-muted-foreground">
                JWT-authenticated access to your account and library.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <Library className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Your library</p>
              <p className="mt-2 text-sm text-muted-foreground">
                All purchased titles available instantly after login.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <LockKeyhole className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Protected reader</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Secure PDF viewing powered by your access token.
              </p>
            </Card>
          </div>
        </section>

        {/* ── Right column: form ──────────────────────────────────────── */}
        <section className="section-shell flex items-center justify-center p-5 sm:p-8">
          <Card className="w-full max-w-lg rounded-[32px] border-white/70 bg-white/90 p-6 shadow-none sm:p-8">
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              Sign in
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Sign in to BookVault
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Enter the credentials you registered with to access your account.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                  placeholder="you@/srcexample.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[color:var(--color-brand)] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                  placeholder="Your password"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              New to BookVault?{' '}
              <Link href="/register" className="font-semibold text-[color:var(--color-brand)]">
                Create an account
              </Link>
            </p>
          </Card>
        </section>
      </div>
    </main>
  )
}
