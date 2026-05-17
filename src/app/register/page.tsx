'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ShieldCheck, Sparkles } from 'lucide-react'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { registerApi } from '@/src/lib/auth-api'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      toast.error('Please complete all fields.')
      return
    }
    if (!email.includes('@/src')) {
      toast.error('Please enter a valid email address.')
      return
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast.error('Mobile number must be exactly 10 digits.')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const res = await registerApi({ fullName, email, mobile, password, confirmPassword })
      if (res.success) {
        toast.success('Account created! Please verify your email with the OTP we sent.')
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(res.message || 'Registration failed. Please try again.')
      }
    } catch {
      toast.error('Network error. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        {/* ── Left column: form ───────────────────────────────────────── */}
        <section className="section-shell flex items-center justify-center p-5 sm:p-8">
          <Card className="w-full max-w-lg rounded-[32px] border-white/70 bg-white/90 p-6 shadow-none sm:p-8">
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              Create account
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Join BookVault
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Fill in your details below. We&apos;ll send a one-time password to verify your email.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                  placeholder="Aarav Sharma"
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="reg-email">Email</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                  placeholder="you@/srcexample.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>

              {/* Mobile */}
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                  placeholder="10-digit mobile number"
                  autoComplete="tel"
                  disabled={isLoading}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account…' : 'Create account'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-[color:var(--color-brand)]">
                Sign in
              </Link>
            </p>
          </Card>
        </section>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <section className="section-shell hidden flex-col justify-between p-8 lg:flex">
          <div>
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              Onboard new readers
            </Badge>
            <h1 className="mt-6 font-display text-6xl leading-none">
              A warm first impression for your reading journey.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
              Registration is quick and secure. Once your email is verified you get instant
              access to your library and the full BookVault experience.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <Sparkles className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Premium experience</p>
              <p className="mt-2 text-sm text-muted-foreground">
                A polished platform that feels launch-ready from day one.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <ShieldCheck className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Email verification</p>
              <p className="mt-2 text-sm text-muted-foreground">
                OTP verification keeps every account trusted and secure.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <BookOpen className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Library ready</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Purchased titles appear in your library the moment you sign in.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}
