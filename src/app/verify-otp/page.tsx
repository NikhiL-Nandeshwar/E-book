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
      toast.error('ईमेल माहिती उपलब्ध नाही. कृपया प्रथम नोंदणी करा.')
      router.replace('/register')
    }
  }, [emailParam, router])

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!otp || otp.length !== 6) {
      toast.error('कृपया ईमेलवर पाठवलेला ६ अंकी ओटीपी टाका.')
      return
    }

    setIsVerifying(true)
    try {
      const res = await verifyOtpApi({ email, otp })
      if (res.success) {
        toast.success('ईमेल यशस्वीरित्या पडताळले गेले! कृपया लॉगिन करा.')
        router.push('/login')
      } else {
        toast.error(res.message || 'अवैध किंवा निर्माणाची मुदत संपलेला OTP. कृपया पुन्हा प्रयत्न करा.')
      }
    } catch {
      toast.error('नेटवर्कमध्ये समस्या आली आहे. कृपया पुन्हा प्रयत्न करा.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      const res = await resendOtpApi({ email })
      if (res.success) {
        toast.success('नवीन OTP आपल्या ईमेलवर पाठवला गेला.')
        setCooldown(60) // 60-second cooldown
      } else {
        toast.error(res.message || 'OTP पुन्हा पाठवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.')
      }
    } catch {
      toast.error('नेटवर्कमध्ये समस्या आली आहे. कृपया पुन्हा प्रयत्न करा.')
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
              📧 ई-मेल पडताळणी
            </Badge>
            <h1 className="mt-6 font-display text-5xl leading-none">
              आपले खाते सक्रिय करण्यासाठी
              फक्त एक पाऊल बाकी
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-muted-foreground">
              <span className="font-semibold text-foreground">{email}</span>{' '} या ई-मेल पत्त्यावर
              ६ अंकी OTP पाठविण्यात आला आहे.
              तो खाली प्रविष्ट करून आपले खाते सक्रिय करा.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <MailCheck className="size-5 text-[#7A2E92]" />
              <p className="mt-4 font-semibold">ई-मेल तपासा</p>
              <p className="mt-2 text-sm text-muted-foreground">
                OTP १० मिनिटांसाठी वैध आहे.
                ई-मेल दिसत नसल्यास स्पॅम फोल्डर तपासा.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <RefreshCw className="size-5 text-[#7A2E92]" />
              <p className="mt-4 font-semibold">पुन्हा OTP मिळवा</p>
              <p className="mt-2 text-sm text-muted-foreground">
                OTP प्राप्त न झाल्यास ६० सेकंदांनंतर पुन्हा पाठवू शकता.
              </p>
            </Card>
            <Card className="rounded-[28px] border-white/70 bg-white/85 p-5 shadow-none">
              <ShieldCheck className="size-5 text-[#7A2E92]" />
              <p className="mt-4 font-semibold">सुरक्षित पडताळणी</p>
              <p className="mt-2 text-sm text-muted-foreground">
                OTP कालबाह्य झाल्यावर आपोआप निष्क्रिय होतो.
              </p>
            </Card>
          </div>
        </section>

        {/* ── Right column: form ────────────────────────────────────────── */}
        <section className="section-shell flex items-center justify-center p-5 sm:p-8">
          <Card className="w-full max-w-lg rounded-[32px] border-white/70 bg-white/90 p-6 shadow-none sm:p-8">
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              🔐 OTP पडताळणी
            </Badge>
            <h2 className="mt-5 text-3xl text-[#7A2E92] font-semibold tracking-tight sm:text-4xl">
              ई-मेल पडताळणी करा
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              <span className="font-medium text-foreground">{email}</span>{' '}
              या ई-मेलवर पाठविलेला
              ६ अंकी OTP खाली प्रविष्ट करा.
            </p>

            <form onSubmit={handleVerify} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
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
                {isVerifying ? 'पडताळणी सुरू आहे...' : 'OTP पडताळा'}
              </Button>
            </form>

            <div className="mt-5 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">OTP प्राप्त झाला नाही?</p>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 rounded-full text-[color:var(--color-brand)] hover:text-[color:var(--color-brand-strong)]"
                onClick={handleResend}
                disabled={isResending || cooldown > 0}
              >
                <RefreshCw className="size-3.5" />
                {isResending
                  ? 'पाठवत आहे...'
                  : cooldown > 0
                    ? `${cooldown} सेकंदांनी पुन्हा पाठवा`
                    : 'OTP पुन्हा पाठवा'}
              </Button>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              ई-मेल चुकीचा आहे?{' '}
              <Link href="/register" className="font-semibold text-[color:var(--color-brand)]">
                पुन्हा नोंदणी करा
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
