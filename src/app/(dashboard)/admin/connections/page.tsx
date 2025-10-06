'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Wifi, WifiOff, RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/auth/role-guard'
import { Role } from '@/types'
import { api } from '@/lib/api'
import { QRCodeDisplay } from '@/components/ui/qr-code-display'
import { ConnectionModal } from '@/components/modals/connection-modal'

interface WhatsAppSession {
  id: string
  sessionName: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'FAILED'
  qrCode?: string
  lastSeen?: string
  companyId: string
  chatbotId?: string
  company?: {
    name: string
  }
  chatbot?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export default function AdminConnectionsPage() {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [connecting, setConnecting] = useState<string | null>(null)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)
  const [pollingStartTime, setPollingStartTime] = useState<number | null>(null)
  const [maxPollingTime] = useState(5 * 60 * 1000) // 5 minutos máximo
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedSession, setSelectedSession] = useState<WhatsAppSession | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])
  
  // Polling para verificar mudanças de status
  useEffect(() => {
    const hasConnectingSessions = sessions.some(session => 
      session.status === 'CONNECTING' || session.status === 'FAILED'
    )

    // Verificar se já passou do tempo máximo de polling
    const shouldStopPolling = pollingStartTime && 
      (Date.now() - pollingStartTime) > maxPollingTime

    if (hasConnectingSessions && !shouldStopPolling) {
      // Iniciar polling a cada 3 segundos
      if (!pollingInterval) {
        console.log('🔄 Iniciando polling para verificar status das sessões...')
        setPollingStartTime(Date.now())
        
        const interval = setInterval(() => {
          console.log('🔄 Verificando status das sessões...')
          fetchSessions()
        }, 3000)
        setPollingInterval(interval)
      }
    } else {
      // Parar polling se não há sessões conectando ou passou do tempo limite
      if (pollingInterval) {
        console.log('🛑 Parando polling - sessões conectadas ou tempo limite atingido')
        clearInterval(pollingInterval)
        setPollingInterval(null)
        setPollingStartTime(null)
      }
    }

    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
        setPollingInterval(null)
        setPollingStartTime(null)
      }
    }
  }, [sessions]) // Removido pollingInterval das dependências para evitar loop

  const fetchSessions = async () => {
    try {
      setLoading(true)
      // ADMINs podem ver todas as sessões do sistema
      const response = await api.get<WhatsAppSession[]>('/whatsapp/sessions')
      setSessions(response.data)
    } catch (error) {
      console.error('Erro ao carregar sessões:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSessions = sessions.filter(session =>
    session.sessionName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.company?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    console.log('🔄 Abrindo modal de criação (admin)...')
    setSelectedSession(null)
    setIsModalOpen(true)
    console.log('✅ Modal aberto (admin):', true)
  }

  const handleEdit = (session: WhatsAppSession) => {
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

  const handleConnect = async (sessionId: string) => {
    try {
      setConnecting(sessionId)
      
      // Gerar o QR Code (já atualiza o status para CONNECTING)
      const qrResponse = await api.post(`/whatsapp/sessions/${sessionId}/generate-qr`)
      
      console.log('🔗 Resposta do QR Code:', qrResponse.data)
      console.log('📊 QR Code data preview:', qrResponse.data.qrCode?.substring(0, 100) + '...')
      
      if (qrResponse.data.success) {
        console.log('✅ QR Code gerado com sucesso')
        console.log('🖼️ QR Code é base64?', qrResponse.data.qrCode?.startsWith('data:image/'))
        await fetchSessions()
      } else {
        console.error('❌ Falha ao gerar QR Code:', qrResponse.data.error)
      }
    } catch (error) {
      console.error('❌ Erro ao conectar sessão:', error)
    } finally {
      setConnecting(null)
    }
  }

  const handleDisconnect = async (sessionId: string) => {
    try {
      await api.post(`/whatsapp/sessions/${sessionId}/disconnect`)
      await fetchSessions()
    } catch (error) {
      console.error('Erro ao desconectar sessão:', error)
    }
  }

  const handleGenerateQR = async (sessionId: string) => {
    try {
      setConnecting(sessionId)
      const qrResponse = await api.post(`/whatsapp/sessions/${sessionId}/generate-qr`)
      
      if (qrResponse.data.success) {
        await api.put(`/whatsapp/sessions/${sessionId}/status`, {
          status: 'CONNECTING'
        })
        await fetchSessions()
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error)
    } finally {
      setConnecting(null)
    }
  }

  const handleDelete = async (sessionId: string) => {
    if (confirm('Tem certeza que deseja excluir esta sessão?')) {
      try {
        await api.delete(`/whatsapp/sessions/${sessionId}`)
        setSessions(sessions.filter(session => session.id !== sessionId))
      } catch (error) {
        console.error('Erro ao excluir sessão:', error)
      }
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
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-boti-text font-poppins">Gerenciar Conexões</h1>
            <p className="text-gray-600">Gerencie todas as conexões WhatsApp do sistema</p>
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
              Encontre conexões por nome, empresa ou ID
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

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Conectadas</p>
                  <p className="text-2xl font-bold">
                    {sessions.filter(s => s.status === 'CONNECTED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Desconectadas</p>
                  <p className="text-2xl font-bold">
                    {sessions.filter(s => s.status === 'DISCONNECTED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Conectando</p>
                  <p className="text-2xl font-bold">
                    {sessions.filter(s => s.status === 'CONNECTING').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Com Falha</p>
                  <p className="text-2xl font-bold">
                    {sessions.filter(s => s.status === 'FAILED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
                  {session.company?.name || 'Sem empresa'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p><strong>ID:</strong> {session.id}</p>
                    <p><strong>Criado em:</strong> {new Date(session.createdAt).toLocaleDateString('pt-BR')}</p>
                    {session.lastSeen && (
                      <p><strong>Última atividade:</strong> {new Date(session.lastSeen).toLocaleString('pt-BR')}</p>
                    )}
                  </div>

                  {/* QR Code */}
                  {session.qrCode && session.status === 'CONNECTING' && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">QR Code para conexão:</p>
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
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Tente ajustar os termos de busca.' 
                  : 'Crie uma nova conexão para começar.'
                }
              </p>
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
    </RoleGuard>
  )
}
