'use client'

import React, { useState, useRef, useEffect } from 'react'

interface TooltipProps {
  content: string
  children: React.ReactNode
  maxWidth?: number
}

export function Tooltip({ content, children, maxWidth = 200 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      let x = rect.left + rect.width / 2
      let y = rect.top - 10
      
      // Ajustar posição se sair da tela
      if (x < 100) x = 100
      if (x > viewportWidth - 100) x = viewportWidth - 100
      if (y < 50) y = rect.bottom + 10
      
      setPosition({ x, y })
    }
  }, [isVisible])

  const handleMouseEnter = () => {
    if (content && content.length > 20) { // Só mostra se o texto for longo
      setIsVisible(true)
    }
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="w-full"
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-50 px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-xl pointer-events-none border border-gray-700"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translateX(-50%) translateY(-100%)',
            maxWidth: `${maxWidth}px`,
            wordWrap: 'break-word',
            whiteSpace: 'pre-line'
          }}
        >
          {content}
          <div 
            className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
          />
        </div>
      )}
    </>
  )
}
