'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash2, Search, Shield, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ConnectionModal } from '@/components/modals/connection-modal'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { QRCodeDisplay } from '@/components/ui/qr-code-display'
import { useWebSocketEvents } from '@/hooks/useWebSocketEvents'

interface WhatsAppSession {
  id: string
  sessionName: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'FAILED'
  qrCode?: string
  lastSeen?: string
  companyId?: string
  phoneNumber?: string
  error?: string
  chatbotId?: string
  company?: {
    name: string
  }
  chatbot?: {
    id: string
    name: string
  }
}

export default function ConnectionsPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<any>(null)
  const [localSessions, setLocalSessions] = useState<WhatsAppSession[]>([])
  
  // Sistema de eventos em tempo real via WebSocket
  const { 
    isConnected: isWebSocketConnected, 
    sessions: wsSessions, 
    lastEvent, 
    error: wsError, 
    reconnect: reconnectWebSocket 
  } = useWebSocketEvents()

  // Priorizar sessões do WebSocket, mas sempre mostrar alguma coisa
  const sessions = wsSessions.length > 0 ? wsSessions : localSessions
  

  useEffect(() => {
    // Carregar sessões iniciais quando o usuário estiver disponível
    if (user?.companyId) {
      fetchSessions()
    }
  }, [user?.companyId])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      console.log('🔄 Buscando sessões para companyId:', user?.companyId)
      
      if (!user?.companyId) {
        console.error('❌ companyId não encontrado no usuário')
        return
      }
      
      // Buscar apenas sessões da empresa do usuário
      const response = await api.get<WhatsAppSession[]>(`/whatsapp/sessions/company/${user?.companyId}`)
      console.log('📡 Sessões carregadas:', response.data.length)
      
      // Sempre atualizar as sessões locais para fallback
      setLocalSessions(response.data);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    } finally {
      setLoading(false)
    }
  }


  const regenerateSession = async (sessionId: string) => {
    try {
      setConnecting(sessionId)
      console.log('🔄 Regenerando sessão:', sessionId)
      
      const response = await api.post(`/whatsapp/sessions/${sessionId}/regenerate`)
      
      if (response.data.success) {
        console.log('✅ Sessão regenerada:', response.data.message)
        // Recarregar sessões após regenerar
        await fetchSessions()
      } else {
        console.error('❌ Erro ao regenerar sessão:', response.data.error)
      }
    } catch (error) {
      console.error('❌ Erro ao regenerar sessão:', error)
    } finally {
      setConnecting(null)
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    console.log('🔄 Abrindo modal de criação...')
    setSelectedSession(null)
    setIsModalOpen(true)
    console.log('✅ Modal aberto:', true)
  }

  const handleEdit = (session: WhatsAppSession) => {
    console.log('✏️ Editando sessão:', session)
    console.log('📊 Dados da sessão:', {
      id: session.id,
      sessionName: session.sessionName,
      companyId: session.companyId,
      chatbotId: session.chatbotId,
      phoneNumber: session.phoneNumber
    })
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedSession(null)
  }

  const handleModalSuccess = () => {
    fetchSessions()
    handleModalClose()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conexão?')) {
      try {
        await api.delete(`/whatsapp/sessions/${id}`)
        setLocalSessions(localSessions.filter(session => session.id !== id))
      } catch (error) {
        console.error('Erro ao excluir conexão:', error)
      }
    }
  }

  const handleConnect = async (sessionId: string) => {
    try {
      setConnecting(sessionId)
      console.log('🔄 Iniciando conexão da sessão:', sessionId)
      
      // Gerar o QR Code (já atualiza o status para CONNECTING)
      const qrResponse = await api.post(`/whatsapp/sessions/${sessionId}/generate-qr`)
      
      console.log('🔗 Resposta do QR Code:', qrResponse.data)
      console.log('📊 QR Code data preview:', qrResponse.data.qrCode?.substring(0, 100) + '...')
      
      if (qrResponse.data.success) {
        console.log('✅ QR Code gerado com sucesso')
        console.log('🖼️ QR Code é base64?', qrResponse.data.qrCode?.startsWith('data:image/'))
        
        // Atualizar imediatamente para mostrar o QR Code
        await fetchSessions()
        
        // O polling vai continuar verificando o status
        console.log('🔄 Polling ativado para monitorar conexão')
      } else {
        console.error('❌ Falha ao gerar QR Code:', qrResponse.data.error)
        setConnecting(null) // Parar loading se falhou
      }
    } catch (error) {
      console.error('❌ Erro ao conectar sessão:', error)
      setConnecting(null) // Parar loading se deu erro
    }
  }

  const handleDisconnect = async (sessionId: string) => {
    try {
      await api.post(`/whatsapp/sessions/${sessionId}/disconnect`)
      await fetchSessions() // Recarregar dados
    } catch (error) {
      console.error('Erro ao desconectar sessão:', error)
    }
  }

  const handleGenerateQR = async (sessionId: string) => {
    try {
      setConnecting(sessionId)
      console.log('🔄 Regenerando QR Code para sessão:', sessionId)
      
      const qrResponse = await api.post(`/whatsapp/sessions/${sessionId}/generate-qr`)
      
      if (qrResponse.data.success) {
        console.log('✅ QR Code regenerado com sucesso')
        await api.put(`/whatsapp/sessions/${sessionId}/status`, {
          status: 'CONNECTING'
        })
        await fetchSessions()
      } else {
        console.error('❌ Falha ao regenerar QR Code:', qrResponse.data.error)
        setConnecting(null) // Parar loading se falhou
      }
    } catch (error) {
      console.error('❌ Erro ao regenerar QR Code:', error)
      setConnecting(null) // Parar loading se deu erro
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'DISCONNECTED':
        return <XCircle className="h-5 w-5 text-gray-400" />
      case 'CONNECTING':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
      case 'FAILED':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <WifiOff className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return <Badge variant="default" className="bg-green-500">Conectado</Badge>
      case 'DISCONNECTED':
        return <Badge variant="secondary">Desconectado</Badge>
      case 'CONNECTING':
        return <Badge variant="default" className="bg-blue-500">Conectando...</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Falhou</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando conexões...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-boti-text font-poppins">Conexões WhatsApp</h1>
          <p className="text-gray-600">Gerencie suas conexões do WhatsApp</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button onClick={fetchSessions} variant="outline" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={handleCreate}
            className="w-full sm:w-auto bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Conexão
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Conexões</CardTitle>
          <CardDescription>
            Encontre conexões por nome ou número de telefone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar conexões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map((session) => (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(session.status)}
                  <CardTitle className="text-lg">{session.sessionName}</CardTitle>
                </div>
                {getStatusBadge(session.status)}
              </div>
              <CardDescription>
                {(session as any).company?.name || 'Sem empresa'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  <p><strong>ID:</strong> {session.id}</p>
                  {session.lastSeen && (
                    <p><strong>Última atividade:</strong> {new Date(session.lastSeen).toLocaleString('pt-BR')}</p>
                  )}
                </div>

                {/* QR Code */}
                {session.qrCode && (session.status === 'CONNECTING' || session.status === 'DISCONNECTED') && (
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Escaneie o QR Code com seu WhatsApp:</p>
                    <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                      <QRCodeDisplay 
                        qrString={session.qrCode}
                        className="mx-auto max-w-48 max-h-48"
                        alt="QR Code para conectar WhatsApp"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Abra o WhatsApp {'>'} Configurações {'>'} Dispositivos conectados {'>'} Conectar um dispositivo
                    </p>
                  </div>
                )}

                {/* Debug QR Code */}
                {session.status === 'CONNECTING' && !session.qrCode && (
                  <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">⏳ Gerando QR Code...</p>
                    <p className="text-xs text-yellow-600">Aguarde alguns segundos</p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                  {/* Primary Action */}
                  <div className="flex-1">
                    {session.status === 'DISCONNECTED' && (
                      <Button
                        onClick={() => handleConnect(session.id)}
                        disabled={connecting === session.id}
                        size="sm"
                        className="w-full bg-boti-primary hover:bg-boti-primary/90 text-white"
                      >
                        {connecting === session.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Wifi className="h-4 w-4 mr-2" />
                        )}
                        Conectar
                      </Button>
                    )}
                    
                    {session.status === 'CONNECTED' && (
                      <Button
                        onClick={() => handleDisconnect(session.id)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <WifiOff className="h-4 w-4 mr-2" />
                        Desconectar
                      </Button>
                    )}

                    {session.status === 'FAILED' && (
                      <Button
                        onClick={() => handleConnect(session.id)}
                        disabled={connecting === session.id}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        {connecting === session.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Tentar Novamente
                      </Button>
                    )}

                    {session.status === 'CONNECTING' && (
                      <Button
                        onClick={() => handleGenerateQR(session.id)}
                        disabled={connecting === session.id}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        {connecting === session.id ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Regenerar QR
                      </Button>
                    )}
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regenerateSession(session.id)}
                      disabled={connecting === session.id}
                      className="flex-1"
                      title="Regenerar conexão"
                    >
                      {connecting === session.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(session)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(session.id)}
                      className="flex-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Nenhuma conexão encontrada' : 'Nenhuma conexão cadastrada'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca.' 
                : 'Comece criando sua primeira conexão WhatsApp.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conexão
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <ConnectionModal
        session={selectedSession}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
