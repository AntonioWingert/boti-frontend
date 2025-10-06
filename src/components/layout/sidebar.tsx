'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Bot, 
  Settings,
  LogOut,
  Wifi,
  WifiOff,
  MessageSquare,
  Menu,
  X,
  Crown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { Role } from '@/types'
import Logo from '@/components/Logo'
import { useState } from 'react'

const navigationItems = [
  { 
    name: 'Dashboard', 
    href: '/dashboard', 
    icon: LayoutDashboard,
    roles: [Role.ADMIN, Role.SUPERVISOR, Role.AGENT]
  },
  { 
    name: 'Clientes', 
    href: '/clients', 
    icon: Users,
    roles: [Role.ADMIN, Role.SUPERVISOR, Role.AGENT]
  },
  { 
    name: 'Empresas', 
    href: '/companies', 
    icon: Building2,
    roles: [Role.ADMIN, Role.SUPERVISOR]
  },
  { 
    name: 'Usuários', 
    href: '/users', 
    icon: Users,
    roles: [Role.ADMIN]
  },
  { 
    name: 'Solicitações', 
    href: '/admin/pending-users', 
    icon: Users,
    roles: [Role.ADMIN]
  },
  { 
    name: 'Chatbots', 
    href: '/chatbots', 
    icon: Bot,
    roles: [Role.ADMIN, Role.SUPERVISOR]
  },
  { 
    name: 'Disparos', 
    href: '/disparos', 
    icon: MessageSquare,
    roles: [Role.ADMIN, Role.SUPERVISOR]
  },
  { 
    name: 'Conexões', 
    href: '/connections', 
    icon: Wifi,
    roles: [Role.ADMIN, Role.SUPERVISOR, Role.AGENT]
  },
  { 
    name: 'Gerenciar Conexões', 
    href: '/admin/connections', 
    icon: WifiOff,
    roles: [Role.ADMIN]
  },
  { 
    name: 'Upgrade', 
    href: '/upgrade', 
    icon: Crown,
    roles: [Role.ADMIN, Role.SUPERVISOR]
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logoutUser } = useAuth()
  const { hasAnyRole } = usePermissions()

  // Filtrar itens de navegação baseado no role do usuário
  const navigation = navigationItems.filter(item => 
    user ? hasAnyRole(item.roles) : false
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "flex w-64 flex-col bg-gray-900 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "fixed z-50 h-screen lg:h-full overflow-y-auto"
      )}>
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6">
        <Logo size={32} showText={true} textColor="white" />
        {/* Mobile Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden text-white hover:bg-gray-800"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* User Role Badge */}
      {user && (
        <div className="px-6 py-2">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-boti-secondary"></div>
            <span className="text-xs text-gray-300 capitalize">
              {user.role.toLowerCase()}
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex flex-1 flex-col px-3 pb-4 min-h-0">
        <ul role="list" className="flex flex-col gap-y-2 overflow-y-auto flex-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'group flex gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 transition-colors',
                    isActive
                      ? 'bg-boti-primary text-white'
                      : 'text-gray-300 hover:bg-boti-primary/20 hover:text-white'
                  )}
                >
                  <item.icon
                    className={cn(
                      'h-6 w-6 shrink-0',
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>

        {/* User info and logout */}
        <div className="mt-auto border-t border-gray-700 pt-4 shrink-0">
          <div className="px-3 py-2">
            <p className="text-sm text-gray-300">{user?.name}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            onClick={logoutUser}
            className="w-full justify-start text-gray-300 hover:bg-boti-primary/20 hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </nav>
      </div>
    </>
  )
}
