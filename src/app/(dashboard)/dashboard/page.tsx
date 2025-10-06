'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Building2, 
  Bot,
  Wifi,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Clock
} from 'lucide-react'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useAuth } from '@/hooks/use-auth'
import Link from 'next/link'

export default function DashboardPage() {
  const { user } = useAuth()
  const { stats, recentConnections, recentMessages, loading, error } = useDashboardData()

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-boti-text font-poppins">Dashboard</h1>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-boti-text font-poppins">Dashboard</h1>
          <p className="text-red-600">Erro ao carregar dados: {error}</p>
        </div>
      </div>
    )
  }

  const statsData = [
    {
      title: 'Conexões Ativas',
      value: stats.connections.active.toString(),
      change: `${stats.connections.change > 0 ? '+' : ''}${stats.connections.change}%`,
      changeType: stats.connections.change >= 0 ? 'positive' as const : 'negative' as const,
      icon: Wifi,
    },
    {
      title: 'Clientes',
      value: stats.clients.total.toString(),
      change: `${stats.clients.change > 0 ? '+' : ''}${stats.clients.change}%`,
      changeType: stats.clients.change >= 0 ? 'positive' as const : 'negative' as const,
      icon: Users,
    },
    {
      title: 'Chatbots',
      value: stats.chatbots.total.toString(),
      change: `${stats.chatbots.change > 0 ? '+' : ''}${stats.chatbots.change}%`,
      changeType: stats.chatbots.change >= 0 ? 'positive' as const : 'negative' as const,
      icon: Bot,
    },
    {
      title: 'Mensagens Hoje',
      value: stats.messages.today.toString(),
      change: `${stats.messages.change > 0 ? '+' : ''}${stats.messages.change}%`,
      changeType: stats.messages.change >= 0 ? 'positive' as const : 'negative' as const,
      icon: MessageSquare,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <Badge variant="default" className="bg-green-500">Conectado</Badge>
      case 'DISCONNECTED':
        return <Badge variant="secondary">Desconectado</Badge>
      case 'CONNECTING':
        return <Badge variant="default" className="bg-blue-500">Conectando</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Falhou</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s atrás`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m atrás`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h atrás`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d atrás`
    const months = Math.floor(days / 30)
    if (months < 12) return `${months}mês atrás`
    const years = Math.floor(months / 12)
    return `${years}a atrás`
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-boti-text font-poppins">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de chatbots</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-boti-secondary flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stat.change} em relação ao mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Connections and Messages */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Conexões Recentes</CardTitle>
            <CardDescription>
              Status das conexões WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConnections.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhuma conexão encontrada</p>
              ) : (
                recentConnections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">
                          {connection.sessionName}
                        </p>
                        {getStatusBadge(connection.status)}
                      </div>
                      <p className="text-sm text-gray-600">
                        {connection.companyName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Última atividade: {getTimeAgo(connection.lastSeen)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Wifi className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Mensagens Recentes</CardTitle>
            <CardDescription>
              Últimas mensagens recebidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentMessages.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Nenhuma mensagem encontrada</p>
              ) : (
                recentMessages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-boti-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {message.clientName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {message.content}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getTimeAgo(message.createdAt)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Badge variant="outline" className="text-xs">
                        {message.sender === 'CLIENT' ? 'Cliente' : 
                         message.sender === 'CHATBOT' ? 'Chatbot' : 
                         message.sender === 'AGENT' ? 'Agente' : 'Sistema'}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às funcionalidades principais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/connections" className="p-4 border rounded-lg text-center hover:bg-boti-primary/5 cursor-pointer transition-colors duration-200">
                <Wifi className="h-8 w-8 mx-auto mb-2 text-boti-primary" />
                <p className="text-sm font-medium">Gerenciar Conexões</p>
              </Link>
              <Link href="/clients" className="p-4 border rounded-lg text-center hover:bg-boti-secondary/5 cursor-pointer transition-colors duration-200">
                <Users className="h-8 w-8 mx-auto mb-2 text-boti-secondary" />
                <p className="text-sm font-medium">Gerenciar Clientes</p>
              </Link>
              <Link href="/chatbots" className="p-4 border rounded-lg text-center hover:bg-boti-primary/5 cursor-pointer transition-colors duration-200">
                <Bot className="h-8 w-8 mx-auto mb-2 text-boti-primary" />
                <p className="text-sm font-medium">Configurar Chatbot</p>
              </Link>
              <Link href="/disparos" className="p-4 border rounded-lg text-center hover:bg-boti-secondary/5 cursor-pointer transition-colors duration-200">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-boti-secondary" />
                <p className="text-sm font-medium">Disparos em Massa</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
