'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, Eye, EyeOff, ShieldCheck, Sparkles } from 'lucide-react'
import Image from 'next/image'
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
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!fullName || !email || !mobile || !password || !confirmPassword) {
      toast.error('कृपया सर्व माहिती भरा.')
      return
    }
    if (!email.includes('@')) {
      toast.error('वैध ई-मेल प्रविष्ट करा.')
      return
    }
    if (!/^\d{10}$/.test(mobile)) {
      toast.error('मोबाईल क्रमांक १० अंकी असावा.')
      return
    }
    if (password.length < 6) {
      toast.error('पासवर्ड किमान ६ अक्षरांचा असावा.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('दोन्ही पासवर्ड समान नाहीत.')
      return
    }

    setIsLoading(true)
    try {
      const res = await registerApi({ fullName, email, mobile, password, confirmPassword })
      if (res.success) {
        toast.success('खाते तयार झाले. OTP तपासा.')
        router.push(`/verify-otp?email=${encodeURIComponent(email)}`)
      } else {
        toast.error(res.message || 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.')
      }
    } catch {
      toast.error('नेटवर्क त्रुटी. कृपया पुन्हा प्रयत्न करा.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-12 lg:grid-cols-[0.95fr_1.05fr]">
        {/* ── Left column: form ───────────────────────────────────────── */}
        <section className="section-shell flex items-center justify-center p-5 sm:p-8">
          <Card className="w-full max-w-lg rounded-[32px] border-white/70 bg-white/90 p-6 shadow-none sm:p-8">
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              📝 नोंदणी
            </Badge>
            <h2 className="mt-5 text-3xl text-[#7A2E92] font-semibold tracking-tight sm:text-4xl">
              नवीन खाते तयार करा
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              आपली माहिती भरून खाते तयार करा.
              नोंदणीनंतर OTP द्वारे ई-मेल पडताळणी केली जाईल.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">पूर्ण नाव</Label>
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
                <Label htmlFor="reg-email">ई-मेल</Label>
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
                <Label htmlFor="mobile">मोबाईल क्रमांक</Label>
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
                <Label htmlFor="reg-password">पासवर्ड</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl border-white bg-[#fdfaf5] pr-12"
                    placeholder="किमान ६ अक्षरे"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((value) => !value)}
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">पासवर्ड पुन्हा प्रविष्ट करा</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="h-12 rounded-2xl border-white bg-[#fdfaf5] pr-12"
                    placeholder="पासवर्ड पुन्हा प्रविष्ट करा"
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1.5 top-1/2 size-9 -translate-y-1/2 rounded-full text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword((value) => !value)}
                    disabled={isLoading}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  >
                    {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-[#7A2E92] hover:bg-[#69267d] text-white"
                disabled={isLoading}
              >
                {isLoading ? 'नोंदणी सुरू आहे...' : 'नोंदणी करा'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              आधीपासून खाते आहे?{' '}
              <Link href="/login" className="font-semibold text-[color:var(--color-brand)]">
                लॉगिन करा
              </Link>
            </p>
          </Card>
        </section>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <section className="section-shell relative hidden overflow-hidden bg-[#f6e6ca] p-6 lg:flex">
          <Image
            src="/signup_banner.png"
            alt="नवीन खाते तयार करा"
            fill
            priority
            className="object-cover object-top"
            // style={{ objectPosition: 'center -40px' }}
          />
        </section>
      </div>
    </main>
  )
}
