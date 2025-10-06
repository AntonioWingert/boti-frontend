'use client'

import { ReactNode, useState } from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'

interface MainLayoutProps {
  children: ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className="flex h-screen bg-boti-bg">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <Header onMenuClick={toggleSidebar} />
        
        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
