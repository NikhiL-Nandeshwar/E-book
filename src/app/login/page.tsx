'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Library, LockKeyhole, Mail } from 'lucide-react'
import Image from 'next/image'
import { useDemo } from '@/src/components/custom/demo-provider'
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
  const [showPassword, setShowPassword] = useState(false)

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
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-12 lg:grid-cols-[1fr_1fr]">
        {/* ── Left column ─────────────────────────────────────────────── */}
        <section className="section-shell relative hidden overflow-hidden bg-[#f6e6ca] p-6 lg:flex">
          <Image
            src="/login_banner_1.png"
            alt="ई-पुस्तक विभाग"
            fill
            priority
            className="object-cover object-[center_-76px]"
          />
        </section>

        {/* ── Right column: form ──────────────────────────────────────── */}
        <section className="section-shell flex items-center justify-center p-5 sm:p-8">
          <Card className="w-full max-w-lg rounded-[32px] border-white/70 bg-white/90 p-6 shadow-none sm:p-8">
            <Badge className="rounded-full bg-[color:var(--color-brand-faint)] px-4 py-1.5 text-[color:var(--color-brand-strong)]">
              🔐 लॉगिन
            </Badge>
            <h2 className="mt-5 text-[#7A2E92] text-3xl font-semibold tracking-tight sm:text-3xl">
              आपल्या खात्यामध्ये लॉगिन करा
            </h2>
            <p className="mt-3 text-md leading-6 text-muted-foreground">
              आपले नोंदणीकृत ई-मेल व पासवर्ड वापरून लॉगिन करा.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">ई-मेल</Label>
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
                  <Label htmlFor="password">पासवर्ड</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[color:var(--color-brand)] hover:underline"
                  >
                    पासवर्ड विसरलात?
                  </Link>
                </div>

                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 rounded-2xl border-white bg-[#fdfaf5] pr-12"
                    placeholder="आपला पासवर्ड प्रविष्ट करा"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-4 flex items-center text-muted-foreground hover:text-foreground"
                    disabled={isLoading}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-[linear-gradient(135deg,var(--color-brand),var(--color-brand-strong))] text-white shadow-lg shadow-[color:var(--color-brand-soft)]"
                disabled={isLoading}
              >
                {isLoading ? 'लॉगिन सुरू आहे...' : 'लॉगिन करा'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              नवीन वापरकर्ता आहात?{' '}
              <Link
                href="/register"
                className="font-semibold text-[#7A2E92]"
              >
                नवीन खाते तयार करा
              </Link>
            </p>
          </Card>
        </section>
      </div>
    </main>
  )
}
