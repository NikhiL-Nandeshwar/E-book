import type { Metadata } from 'next'
import { Roboto, Manrope } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'

import { DemoProvider } from '@/src/components/demo-provider'
import { ThemeProvider } from '@/src/components/theme-provider'
import './globals.css'

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
  title: 'BookVault | Online Book Management System',
  description:
    'A modern static ebook platform demo built with Next.js, TypeScript, Tailwind CSS, and shadcn/ui.',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
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
          <DemoProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                style: {
                  borderRadius: '20px',
                },
              }}
            />
          </DemoProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
