import { useAuth } from './use-auth'
import { Role } from '@/types'

export const usePermissions = () => {
  const { user } = useAuth()

  const hasRole = (role: Role): boolean => {
    return user?.role === role
  }

  const hasAnyRole = (roles: Role[]): boolean => {
    return user ? roles.includes(user.role) : false
  }

  const isAdmin = (): boolean => {
    return hasRole(Role.ADMIN)
  }

  const isSupervisor = (): boolean => {
    return hasRole(Role.SUPERVISOR)
  }

  const isAgent = (): boolean => {
    return hasRole(Role.AGENT)
  }

  const canManageCompanies = (): boolean => {
    return hasAnyRole([Role.ADMIN, Role.SUPERVISOR])
  }

  const canManageUsers = (): boolean => {
    return hasRole(Role.ADMIN)
  }

  const canManageChatbots = (): boolean => {
    return hasAnyRole([Role.ADMIN, Role.SUPERVISOR])
  }

  const canViewReports = (): boolean => {
    return hasAnyRole([Role.ADMIN, Role.SUPERVISOR])
  }

  const canManageSettings = (): boolean => {
    return hasRole(Role.ADMIN)
  }

  const canEscalateConversations = (): boolean => {
    return hasAnyRole([Role.ADMIN, Role.SUPERVISOR])
  }

  const canAssignConversations = (): boolean => {
    return hasAnyRole([Role.ADMIN, Role.SUPERVISOR])
  }

  return {
    hasRole,
    hasAnyRole,
    isAdmin,
    isSupervisor,
    isAgent,
    canManageCompanies,
    canManageUsers,
    canManageChatbots,
    canViewReports,
    canManageSettings,
    canEscalateConversations,
    canAssignConversations,
  }
}
