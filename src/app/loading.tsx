import { Header } from '@/src/components/custom/header'
import { SiteFooter } from '@/src/components/custom/site-footer'
import { Skeleton } from '@/src/components/ui/skeleton'

export default function Loading() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        <section className="section-shell p-6 md:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-4">
              <Skeleton className="h-8 w-40 rounded-full" />
              <Skeleton className="h-16 w-full max-w-2xl rounded-3xl" />
              <Skeleton className="h-6 w-full max-w-xl rounded-full" />
              <div className="flex gap-3">
                <Skeleton className="h-12 w-36 rounded-full" />
                <Skeleton className="h-12 w-36 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-[320px] rounded-[32px]" />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="section-shell p-4">
              <Skeleton className="aspect-[4/5] rounded-[28px]" />
              <Skeleton className="mt-4 h-5 w-2/3 rounded-full" />
              <Skeleton className="mt-3 h-4 w-1/2 rounded-full" />
              <Skeleton className="mt-5 h-10 rounded-2xl" />
            </div>
          ))}
        </section>
      </div>
      <SiteFooter />
    </main>
  )
}
