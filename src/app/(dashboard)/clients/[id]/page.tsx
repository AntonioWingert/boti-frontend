'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, User, Phone, Mail, Building2, MessageSquare, Calendar, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Client } from '@/types'
import { api } from '@/lib/api'
import { ClientModal } from '@/components/modals/client-modal'

interface ClientStats {
  totalConversations: number
  totalMessages: number
  lastMessageAt: string | null
  lastConversationAt: string | null
}

export default function ClientDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [stats, setStats] = useState<ClientStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const clientId = params.id as string

  useEffect(() => {
    if (clientId) {
      fetchClient()
      fetchStats()
    }
  }, [clientId])

  const fetchClient = async () => {
    try {
      setLoading(true)
      const response = await api.get<Client>(`/clients/${clientId}`)
      setClient(response.data)
    } catch (error) {
      console.error('Erro ao carregar cliente:', error)
      setError('Cliente não encontrado')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [conversationsRes, messagesRes] = await Promise.allSettled([
        api.get(`/conversations?clientId=${clientId}`),
        api.get(`/messages/stats?clientId=${clientId}`)
      ])

      const conversations = conversationsRes.status === 'fulfilled' ? conversationsRes.value.data : []
      const messages = messagesRes.status === 'fulfilled' ? messagesRes.value.data : { total: 0, lastMessageAt: null }

      setStats({
        totalConversations: conversations.length,
        totalMessages: messages.total || 0,
        lastMessageAt: messages.lastMessageAt,
        lastConversationAt: conversations.length > 0 ? conversations[0].updatedAt : null
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`/clients/${clientId}`)
        router.push('/clients')
      } catch (error) {
        console.error('Erro ao excluir cliente:', error)
      }
    }
  }

  const handleToggleStatus = async () => {
    if (!client) return
    
    try {
      await api.patch(`/clients/${clientId}`, {
        active: !client.active
      })
      setClient({ ...client, active: !client.active })
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error)
    }
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
  }

  const handleEditModalSuccess = () => {
    fetchClient()
    setIsEditModalOpen(false)
  }

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
          </div>
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

  if (error || !client) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/clients')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-boti-text">Cliente não encontrado</h1>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/clients')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-boti-text font-poppins flex items-center">
            <User className="h-8 w-8 mr-3 text-boti-primary" />
            {client.name}
          </h1>
          <p className="text-gray-600 mt-1">Detalhes do cliente</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            className={client.active ? 'text-red-600' : 'text-green-600'}
          >
            {client.active ? 'Desativar' : 'Ativar'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleEdit}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center space-x-2">
        <Badge variant={client.active ? 'default' : 'secondary'} className="text-sm">
          {client.active ? (
            <>
              <CheckCircle className="h-3 w-3 mr-1" />
              Ativo
            </>
          ) : (
            <>
              <XCircle className="h-3 w-3 mr-1" />
              Inativo
            </>
          )}
        </Badge>
        <span className="text-sm text-gray-500">
          Cadastrado em {new Date(client.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversas</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalConversations}</div>
              <p className="text-xs text-muted-foreground">
                Total de conversas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMessages}</div>
              <p className="text-xs text-muted-foreground">
                Total de mensagens
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Mensagem</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {stats.lastMessageAt 
                  ? new Date(stats.lastMessageAt).toLocaleDateString('pt-BR')
                  : 'Nunca'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Última atividade
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Conversa</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {stats.lastConversationAt 
                  ? new Date(stats.lastConversationAt).toLocaleDateString('pt-BR')
                  : 'Nunca'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Última conversa
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Client Details */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
            <CardDescription>
              Dados básicos do cliente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{client.name}</p>
                <p className="text-sm text-gray-500">Nome do cliente</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{client.phone}</p>
                <p className="text-sm text-gray-500">Telefone</p>
              </div>
            </div>

            {client.email && (
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{client.email}</p>
                  <p className="text-sm text-gray-500">Email</p>
                </div>
              </div>
            )}

            {client.company && (
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{client.company.name}</p>
                  <p className="text-sm text-gray-500">Empresa</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">
                  {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-gray-500">Data de cadastro</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <CardDescription>
              Métricas do cliente
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conversas iniciadas</span>
                  <span className="font-medium">{stats.totalConversations}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mensagens enviadas</span>
                  <span className="font-medium">{stats.totalMessages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Última mensagem</span>
                  <span className="font-medium text-sm">
                    {stats.lastMessageAt 
                      ? new Date(stats.lastMessageAt).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Última conversa</span>
                  <span className="font-medium text-sm">
                    {stats.lastConversationAt 
                      ? new Date(stats.lastConversationAt).toLocaleDateString('pt-BR')
                      : 'Nunca'
                    }
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-boti-primary mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Carregando estatísticas...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <ClientModal
        client={client}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditModalSuccess}
      />
    </div>
  )
}
