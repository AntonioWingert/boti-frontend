'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MainLayout } from '@/components/layout/main-layout'
import { useAuth } from '@/hooks/use-auth'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, isLoading, isHydrated, setHydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setHydrated()
  }, [setHydrated])

  useEffect(() => {
    if (isHydrated && !isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, isHydrated, router])

  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-boti-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-boti-primary mx-auto"></div>
          <p className="mt-4 text-boti-text">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <MainLayout>{children}</MainLayout>
}