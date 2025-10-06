'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, MessageSquare, Users, Bot, Building2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

interface SearchResult {
  id: string
  type: 'conversation' | 'client' | 'chatbot' | 'company'
  title: string
  description: string
  status?: string
  href: string
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Fechar busca quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Buscar com debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      setShowResults(false)
      return
    }

    const timeoutId = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await api.get(`/search?q=${encodeURIComponent(searchQuery)}`)
      setResults(response.data || [])
      setShowResults(true)
    } catch (error) {
      console.error('Erro na busca:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    router.push(result.href)
    setIsOpen(false)
    setQuery('')
    setShowResults(false)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="h-4 w-4" />
      case 'client':
        return <Users className="h-4 w-4" />
      case 'chatbot':
        return <Bot className="h-4 w-4" />
      case 'company':
        return <Building2 className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getResultTypeLabel = (type: string) => {
    switch (type) {
      case 'conversation':
        return 'Conversa'
      case 'client':
        return 'Cliente'
      case 'chatbot':
        return 'Chatbot'
      case 'company':
        return 'Empresa'
      default:
        return 'Item'
    }
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-lg">
      {/* Input de busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Buscar conversas, clientes, chatbots..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('')
              setShowResults(false)
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Resultados da busca */}
      {isOpen && showResults && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-boti-primary mx-auto"></div>
                <p className="mt-2 text-sm">Buscando...</p>
              </div>
            ) : results.length > 0 ? (
              <div className="py-2">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <div className="flex-shrink-0 text-boti-primary">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.description}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {getResultTypeLabel(result.type)}
                      </Badge>
                      {result.status && (
                        <Badge 
                          variant={result.status === 'ACTIVE' ? 'default' : 'secondary'} 
                          className="text-xs ml-1"
                        >
                          {result.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : query ? (
              <div className="p-4 text-center text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhum resultado encontrado</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tente termos diferentes
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
