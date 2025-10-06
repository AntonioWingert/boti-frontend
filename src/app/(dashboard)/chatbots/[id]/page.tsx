'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Bot, Play, Pause, Settings, Workflow, MessageSquare, Users, Calendar, Edit, Trash2, CheckCircle, XCircle, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Chatbot } from '@/types'
import { api } from '@/lib/api'
import { FlowEditor } from '@/components/chatbot/flow-editor'
import { ChatbotModal } from '@/components/modals/chatbot-modal'

interface ChatbotStats {
  totalConversations: number
  totalMessages: number
  activeConnections: number
  lastActivity: string | null
}

export default function ChatbotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [chatbot, setChatbot] = useState<Chatbot | null>(null)
  const [stats, setStats] = useState<ChatbotStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showFlowEditor, setShowFlowEditor] = useState(false)
  const [flowData, setFlowData] = useState<any>(null)

  const chatbotId = params.id as string

  useEffect(() => {
    if (chatbotId) {
      fetchChatbot()
      fetchStats()
    }
  }, [chatbotId])

  const fetchChatbot = async () => {
    try {
      setLoading(true)
      const response = await api.get<Chatbot>(`/chatbots/${chatbotId}`)
      setChatbot(response.data)
    } catch (error) {
      console.error('Erro ao carregar chatbot:', error)
      setError('Chatbot não encontrado')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [conversationsRes, messagesRes, connectionsRes] = await Promise.allSettled([
        api.get(`/conversations?chatbotId=${chatbotId}`),
        api.get(`/messages/stats?chatbotId=${chatbotId}`),
        api.get(`/whatsapp/sessions/chatbot/${chatbotId}`)
      ])

      const conversations = conversationsRes.status === 'fulfilled' ? conversationsRes.value.data : []
      const messages = messagesRes.status === 'fulfilled' ? messagesRes.value.data : { total: 0, lastActivity: null }
      const connections = connectionsRes.status === 'fulfilled' ? connectionsRes.value.data : []

      setStats({
        totalConversations: conversations.length,
        totalMessages: messages.total || 0,
        activeConnections: connections.filter((c: any) => c.status === 'CONNECTED').length,
        lastActivity: messages.lastActivity
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir este chatbot? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`/chatbots/${chatbotId}`)
        router.push('/chatbots')
      } catch (error) {
        console.error('Erro ao excluir chatbot:', error)
      }
    }
  }

  const handleToggleStatus = async () => {
    if (!chatbot) return
    
    try {
      await api.patch(`/chatbots/${chatbotId}/toggle-status`)
      setChatbot({ ...chatbot, active: !chatbot.active })
    } catch (error) {
      console.error('Erro ao alterar status do chatbot:', error)
    }
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
  }

  const handleEditModalSuccess = () => {
    fetchChatbot()
    setIsEditModalOpen(false)
  }

  const handleOpenFlowEditor = async () => {
    try {
      // Buscar flows do chatbot da API
      const response = await api.get(`/flows?chatbotId=${chatbotId}`)
      const flows = response.data
      
      if (flows && flows.length > 0) {
        // Usar o primeiro flow (ou o flow padrão)
        const flow = flows.find((f: any) => f.isDefault) || flows[0]
        
        // Converter dados do flow para formato do ReactFlow
        const reactFlowData = {
          nodes: flow.nodes?.map((node: any) => {
            // Mapear tipo do nó
            let nodeType = 'message'
            if (node.isStart) nodeType = 'start'
            else if (node.isEnd) nodeType = 'end'
            else if (node.nodeType === 'OPTION') nodeType = 'choice'
            else if (node.nodeType === 'MESSAGE') nodeType = 'message'
            
            return {
              id: node.id,
              type: nodeType,
              position: node.position || { x: 100, y: 100 },
              data: {
                label: node.title || 'Nó',
                message: node.message || '',
                options: node.options?.map((opt: any) => ({
                  text: opt.text,
                  label: opt.text,
                  id: opt.id,
                  actionType: opt.actionType || 'message',
                  targetNodeId: opt.targetNodeId || null,
                  transferMessage: opt.transferMessage || null,
                  waitTime: opt.waitTime || null
                })) || []
              }
            }
          }) || [],
          edges: flow.edges?.map((edge: any) => ({
            id: edge.id,
            source: edge.sourceNodeId,
            target: edge.targetNodeId,
            type: 'smoothstep',
            data: {
              label: edge.label || ''
            }
          })) || []
        }
        
        setFlowData(reactFlowData)
        setShowFlowEditor(true)
      } else {
        // Criar flow vazio se não existir
        setFlowData({
          nodes: [
            {
              id: 'start',
              type: 'start',
              position: { x: 100, y: 100 },
              data: { label: 'Início' }
            }
          ],
          edges: []
        })
        setShowFlowEditor(true)
      }
    } catch (error) {
      console.error('Erro ao carregar flow:', error)
    }
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

  if (error || !chatbot) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/chatbots')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-boti-text">Chatbot não encontrado</h1>
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

  if (showFlowEditor) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => setShowFlowEditor(false)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-boti-text">Editor de Fluxo - {chatbot.name}</h1>
        </div>
        <FlowEditor
          flowData={flowData}
          onSave={() => {
            setShowFlowEditor(false)
            fetchChatbot()
          }}
          onClose={() => {
            setShowFlowEditor(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/chatbots')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-boti-text font-poppins flex items-center">
            <Bot className="h-8 w-8 mr-3 text-boti-primary" />
            {chatbot.name}
          </h1>
          <p className="text-gray-600 mt-1">Detalhes do chatbot</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleStatus}
            className={chatbot.active ? 'text-red-600' : 'text-green-600'}
          >
            {chatbot.active ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Ativar
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={handleOpenFlowEditor}>
            <Workflow className="h-4 w-4 mr-1" />
            Fluxo
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
        <Badge variant={chatbot.active ? 'default' : 'secondary'} className="text-sm">
          {chatbot.active ? (
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
          Criado em {new Date(chatbot.createdAt).toLocaleDateString('pt-BR')}
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
              <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConnections}</div>
              <p className="text-xs text-muted-foreground">
                Conexões ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Atividade</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {stats.lastActivity 
                  ? new Date(stats.lastActivity).toLocaleDateString('pt-BR')
                  : 'Nunca'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Última atividade
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chatbot Details */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Chatbot</CardTitle>
            <CardDescription>
              Dados básicos do chatbot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Bot className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">{chatbot.name}</p>
                <p className="text-sm text-gray-500">Nome do chatbot</p>
              </div>
            </div>
            
            {chatbot.description && (
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium">{chatbot.description}</p>
                  <p className="text-sm text-gray-500">Descrição</p>
                </div>
              </div>
            )}

            {chatbot.autoEndMessage && (
              <div className="flex items-start space-x-3">
                <Settings className="h-5 w-5 text-gray-400 mt-1" />
                <div>
                  <p className="font-medium">{chatbot.autoEndMessage}</p>
                  <p className="text-sm text-gray-500">Mensagem de encerramento</p>
                </div>
              </div>
            )}

            {chatbot.company && (
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{chatbot.company.name}</p>
                  <p className="text-sm text-gray-500">Empresa</p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="font-medium">
                  {new Date(chatbot.createdAt).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm text-gray-500">Data de criação</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
            <CardDescription>
              Métricas do chatbot
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
                  <span className="text-sm text-gray-600">Mensagens processadas</span>
                  <span className="font-medium">{stats.totalMessages}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Conexões ativas</span>
                  <span className="font-medium">{stats.activeConnections}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Última atividade</span>
                  <span className="font-medium text-sm">
                    {stats.lastActivity 
                      ? new Date(stats.lastActivity).toLocaleDateString('pt-BR')
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
      <ChatbotModal
        chatbot={chatbot}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditModalSuccess}
      />
    </div>
  )
}
