'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MailCheck, RefreshCw, ShieldCheck } from 'lucide-react'

import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Card } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { verifyOtpApi, resendOtpApi } from '@/src/lib/auth-api'
import { toast } from 'sonner'

// ── Inner component (needs useSearchParams) ───────────────────────────────────

function VerifyOtpForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const emailParam = searchParams.get('email') ?? ''

  const [email] = useState(emailParam)
  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  // Guard: redirect away if no email in URL
  useEffect(() => {
    if (!emailParam) {
      toast.error('No email provided. Please register first.')
      router.replace('/register')
    }
  }, [emailParam, router])

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP sent to your email.')
      return
    }

    setIsVerifying(true)
    try {
      const res = await verifyOtpApi({ email, otp })
      if (res.success) {
        toast.success('Email verified successfully! Please sign in.')
        router.push('/login')
      } else {
        toast.error(res.message || 'Invalid or expired OTP. Please try again.')
      }
    } catch {
      toast.error('Network error. Check your connection and try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const res = await resendOtpApi({ email })
      if (res.success) {
        toast.success('A new OTP has been sent to your email.')
        setCooldown(60) // 60-second cooldown
      } else {
        toast.error(res.message || 'Could not resend OTP. Please try again.')
      }
    } catch {
      toast.error('Network error. Check your connection and try again.')
    } finally {
      setIsResending(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* ── Left column ───────────────────────────────────────────────── */}
        <section className="section-shell hidden flex-col justify-between p-8 lg:flex">
          <div>
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              Email verification
            </Badge>
            <h1 className="mt-6 font-display text-6xl leading-none">
              One step away from your reading world.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
              We sent a 6-digit code to{' '}
              <span className="font-semibold text-foreground">{email}</span>. Enter it below to
              verify your account and gain full access to BookVault.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <MailCheck className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Check your inbox</p>
              <p className="mt-2 text-sm text-muted-foreground">
                The OTP is valid for 10 minutes. Check spam if needed.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <RefreshCw className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Resend anytime</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Didn&apos;t get it? Request a fresh code after 60 seconds.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <ShieldCheck className="size-5 text-[color:var(--color-brand)]" />
              <p className="mt-4 font-semibold">Secure &amp; private</p>
              <p className="mt-2 text-sm text-muted-foreground">
                OTPs expire automatically — your account stays protected.
              </p>
            </Card>
          </div>
        </section>

        {/* ── Right column: form ────────────────────────────────────────── */}
        <section className="section-shell flex items-center justify-center p-5 sm:p-8">
          <Card className="w-full max-w-lg rounded-[32px] border-white/70 bg-white/90 p-6 shadow-none sm:p-8">
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              Verify OTP
            </Badge>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              Verify your email
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Enter the 6-digit code we sent to{' '}
              <span className="font-medium text-foreground">{email}</span>.
            </p>

            <form onSubmit={handleVerify} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp">One-Time Password</Label>
                <Input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="h-14 rounded-2xl border-white bg-[#fdfaf5] text-center text-2xl font-bold tracking-[0.5em]"
                  placeholder="000000"
                  autoComplete="one-time-code"
                  disabled={isVerifying}
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying…' : 'Verify email'}
              </Button>
            </form>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Didn&apos;t receive the code?</p>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-full text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-strong)]"
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
              >
                <RefreshCw className="size-3.5" />
                {isResending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Wrong email?{' '}
              <Link href="/register" className="font-semibold text-[color:var(--color-brand)]">
                Register again
              </Link>
            </p>
          </Card>
        </section>
      </div>
    </main>
  )
}

// ── Page export with Suspense (required because useSearchParams needs it) ─────

export default function VerifyOtpPage() {
  return (
    <Suspense>
      <VerifyOtpForm />
    </Suspense>
  )
}
