'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useAuth } from '@/src/components/custom/demo-provider'

export function useAdminGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isHydrated } = useAuth()
  const isAdmin = user?.role?.toLowerCase() === 'admin'

  useEffect(() => {
    if (!isHydrated) return

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }

    if (!isAdmin) {
      router.replace('/')
    }
  }, [isAdmin, isHydrated, pathname, router, user])

  return {
    user,
    isHydrated,
    isAdmin,
  }
}