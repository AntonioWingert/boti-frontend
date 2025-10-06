'use client'

import { Menu, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/notifications/notification-bell'
import { GlobalSearch } from '@/components/search/global-search'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logoutUser } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    logoutUser()
    router.push('/login')
  }

  const handleProfile = () => {
    router.push('/profile')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden mr-2"
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Search */}
        <div className="flex flex-1 items-center">
          <div className="w-full max-w-lg">
            <GlobalSearch />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <NotificationBell />

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-gray-100">
                <div className="h-10 w-10 rounded-full bg-boti-primary flex items-center justify-center shadow-md hover:shadow-lg transition-shadow duration-200">
                  <span className="text-base font-semibold text-white">
                    {user ? getInitials(user.name) : 'U'}
                  </span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex flex-col space-y-1 p-2">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfile}>
                <User className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
