'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, KeyRound, MailCheck, ShieldCheck } from 'lucide-react'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { forgotPasswordApi } from '@/src/lib/auth-api'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email) {
      toast.error('Please enter your email address.')
      return
    }
    if (!email.includes('@/src')) {
      toast.error('Please enter a valid email address.')
      return
    }

    setIsLoading(true)
    try {
      const res = await forgotPasswordApi({ email })
      if (res.success) {
        setSubmitted(true)
        toast.success('Reset instructions sent! Check your inbox.')
      } else {
        toast.error(res.message || 'Could not send reset link. Please try again.')
      }
    } catch {
      toast.error('Network error. Check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* ── Left column ─────────────────────────────────────────────── */}
        <section className="section-shell hidden flex-col justify-between p-8 lg:flex">
          <div>
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              Account recovery
            </Badge>
            <h1 className="mt-6 font-display text-6xl leading-none">
              Forgot your password? No problem.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
              Enter your registered email and we&apos;ll send you a secure link to reset your
              password. The link expires in 30 minutes.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <MailCheck className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Check your inbox</p>
              <p className="mt-2 text-sm text-muted-foreground">
                A reset link will be sent to your registered email address.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <KeyRound className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Secure token</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The reset link contains a one-time token valid for 30 minutes.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <ShieldCheck className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Stay protected</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Tokens expire automatically to keep your account safe.
              </p>
            </Card>
          </div>
        </section>

        {/* ── Right column: form / success ────────────────────────────── */}
        <section className="section-shell flex items-center justify-center p-5 sm:p-8">
          <Card className="w-full max-w-lg rounded-[32px] border-white/70 bg-white/90 p-6 shadow-none sm:p-8">
            {submitted ? (
              /* ── Success state ─────────────────────────────────────────── */
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-[color:var(--color-brand-faint)]">
                  <MailCheck className="size-8 text-[color:var(--color-brand-strong)]" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">Check your email</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                  We&apos;ve sent a password reset link to{' '}
                  <span className="font-medium text-foreground">{email}</span>. Follow the link
                  to set a new password. It expires in 30 minutes.
                </p>
                <p className="mt-4 text-xs text-muted-foreground">
                  Didn&apos;t get it? Check your spam folder or{' '}
                  <button
                    className="font-semibold text-[color:var(--color-brand)] hover:underline"
                    onClick={() => setSubmitted(false)}
                  >
                    try again
                  </button>
                  .
                </p>
                <Link href="/login" className="mt-8 w-full">
                  <Button
                    variant="outline"
                    className="w-full rounded-full border-[color:var(--color-brand-soft)] text-[color:var(--color-brand-strong)]"
                  >
                    <ArrowLeft className="mr-2 size-4" />
                    Back to sign in
                  </Button>
                </Link>
              </div>
            ) : (
              /* ── Form state ────────────────────────────────────────────── */
              <>
                <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
                  Forgot password
                </Badge>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Reset your password
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Enter the email address linked to your BookVault account and we&apos;ll send
                  you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="forgot-email">Email address</Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                      placeholder="you@/srcexample.com"
                      autoComplete="email"
                      disabled={isLoading}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending reset link…' : 'Send reset link'}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Remembered it?{' '}
                  <Link href="/login" className="font-semibold text-[color:var(--color-brand)]">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </Card>
        </section>
      </div>
    </main>
  )
}
