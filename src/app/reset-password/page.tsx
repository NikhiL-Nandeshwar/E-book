'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { resetPasswordApi } from '@/src/lib/auth-api'
import { toast } from 'sonner'

// ── Inner component (needs useSearchParams) ───────────────────────────────────

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const tokenParam = searchParams.get('token') ?? ''

  const [token] = useState(tokenParam)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // Guard: redirect if no token in URL
  useEffect(() => {
    if (!tokenParam) {
      toast.error('Invalid or missing reset token. Please request a new link.')
      router.replace('/forgot-password')
    }
  }, [tokenParam, router])

  // Password strength indicator
  const strength = (() => {
    if (!newPassword) return 0
    let score = 0
    if (newPassword.length >= 6) score++
    if (newPassword.length >= 10) score++
    if (/[A-Z]/.test(newPassword)) score++
    if (/[0-9]/.test(newPassword)) score++
    if (/[^A-Za-z0-9]/.test(newPassword)) score++
    return score
  })()

  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength]
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'][strength]

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in both password fields.')
      return
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.')
      return
    }

    setIsLoading(true)
    try {
      const res = await resetPasswordApi({ token, newPassword, confirmPassword })
      if (res.success) {
        setSuccess(true)
        toast.success('Password reset successfully!')
      } else {
        toast.error(res.message || 'Reset failed. The link may have expired.')
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
        {/* ── Left column: form / success ─────────────────────────────── */}
        <section className="section-shell flex items-center justify-center p-5 sm:p-8">
          <Card className="w-full max-w-lg rounded-[32px] border-white/70 bg-white/90 p-6 shadow-none sm:p-8">
            {success ? (
              /* ── Success state ─────────────────────────────────────── */
              <div className="flex flex-col items-center py-6 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="size-8 text-emerald-600" />
                </div>
                <h2 className="mt-5 text-2xl font-semibold tracking-tight">
                  Password updated!
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
                  Your password has been reset successfully. You can now sign in with your new
                  password.
                </p>
                <Button
                  className="mt-8 h-12 w-full rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
                  onClick={() => router.push('/login')}
                >
                  Sign in now
                </Button>
              </div>
            ) : (
              /* ── Form state ────────────────────────────────────────── */
              <>
                <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
                  Reset password
                </Badge>
                <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                  Set a new password
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Choose a strong password you haven&apos;t used before. It must be at least 6
                  characters long.
                </p>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  {/* New password */}
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                      placeholder="Min. 6 characters"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />

                    {/* Strength bar */}
                    {newPassword.length > 0 && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className="h-1 flex-1 rounded-full transition-colors duration-300"
                              style={{
                                backgroundColor:
                                  level <= strength ? strengthColor : '#e5e7eb',
                              }}
                            />
                          ))}
                        </div>
                        <p
                          className="text-xs font-medium"
                          style={{ color: strengthColor }}
                        >
                          {strengthLabel}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12 rounded-2xl border-white bg-[#fdfaf5]"
                      placeholder="Repeat your new password"
                      autoComplete="new-password"
                      disabled={isLoading}
                    />
                    {/* Match indicator */}
                    {confirmPassword.length > 0 && (
                      <p
                        className="text-xs font-medium"
                        style={{
                          color: newPassword === confirmPassword ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {newPassword === confirmPassword
                          ? '✓ Passwords match'
                          : '✗ Passwords do not match'}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="h-12 w-full rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Resetting password…' : 'Reset password'}
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Link expired?{' '}
                  <Link
                    href="/forgot-password"
                    className="font-semibold text-[color:var(--color-brand)]"
                  >
                    Request a new one
                  </Link>
                </p>
              </>
            )}
          </Card>
        </section>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <section className="section-shell hidden flex-col justify-between p-8 lg:flex">
          <div>
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              Secure recovery
            </Badge>
            <h1 className="mt-6 font-display text-6xl leading-none">
              A strong password keeps your library safe.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
              Your new password is hashed and salted on our servers — it is never stored in
              plain text. Choose something unique and memorable.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <LockKeyhole className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Hashed &amp; salted</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Passwords are never stored in plain text on our servers.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <KeyRound className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">One-time token</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The reset token is invalidated the moment your password is updated.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <ShieldCheck className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Auto-logout</p>
              <p className="mt-2 text-sm text-muted-foreground">
                After a reset all active sessions are cleared for your protection.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </main>
  )
}

// ── Page export with Suspense (required for useSearchParams) ──────────────────

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  )
}
