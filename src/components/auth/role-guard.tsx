'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { Role } from '@/types'

interface RoleGuardProps {
  children: ReactNode
  allowedRoles: Role[]
  fallback?: ReactNode
  redirectTo?: string
}

export function RoleGuard({ 
  children, 
  allowedRoles, 
  fallback,
  redirectTo = '/dashboard'
}: RoleGuardProps) {
  const { user, isLoading } = useAuth()
  const { hasAnyRole } = usePermissions()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (!hasAnyRole(allowedRoles)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <button
            onClick={() => router.push(redirectTo)}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
