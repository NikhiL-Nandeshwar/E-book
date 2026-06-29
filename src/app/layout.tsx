import type { Metadata } from 'next'
import { Roboto, Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'

import { AuthProvider } from '@/src/components/custom/demo-provider'
import { ThemeProvider } from '@/src/components/custom/theme-provider'
import './globals.css'
import { Header } from '../components/custom/header'
import Footer from '../components/custom/footer'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
})

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-display',
})

export const metadata: Metadata = {
  title: 'E-Book | Online Book Management System',
  description:
    'A modern static ebook platform demo built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${roboto.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">

              <Header />

              <main className="flex-1">
                {children}
              </main>

              <Footer />

              <Toaster
                position="top-right"
                richColors
                toastOptions={{
                  style: {
                    borderRadius: '20px',
                  },
                }}
              />

            </div>
          </AuthProvider>
        </ThemeProvider>

        <Analytics />
      </body>
    </html>
  )
}

