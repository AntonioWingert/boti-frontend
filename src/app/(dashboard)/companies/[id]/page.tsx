'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Users, Bot, Wifi, MessageSquare, Calendar, Mail, Phone, MapPin, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/auth/role-guard'
import { Company, Role } from '@/types'
import { api } from '@/lib/api'
import { CompanyModal } from '@/components/modals/company-modal'

interface CompanyStats {
  totalUsers: number
  totalChatbots: number
  totalConnections: number
  totalMessages: number
  activeConnections: number
}

export default function CompanyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [company, setCompany] = useState<Company | null>(null)
  const [stats, setStats] = useState<CompanyStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const companyId = params.id as string

  useEffect(() => {
    if (companyId) {
      fetchCompany()
      fetchStats()
    }
  }, [companyId])

  const fetchCompany = async () => {
    try {
      setLoading(true)
      const response = await api.get<Company>(`/companies/${companyId}`)
      setCompany(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresa:', error)
      setError('Empresa não encontrada')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [usersRes, chatbotsRes, connectionsRes, messagesRes] = await Promise.allSettled([
        api.get(`/users/admin/all?companyId=${companyId}`),
        api.get(`/chatbots?companyId=${companyId}`),
        api.get(`/whatsapp/sessions/company/${companyId}`),
        api.get(`/messages/stats?companyId=${companyId}`)
      ])

      const users = usersRes.status === 'fulfilled' ? usersRes.value.data : []
      const chatbots = chatbotsRes.status === 'fulfilled' ? chatbotsRes.value.data : []
      const connections = connectionsRes.status === 'fulfilled' ? connectionsRes.value.data : []
      const messages = messagesRes.status === 'fulfilled' ? messagesRes.value.data : { total: 0 }

      setStats({
        totalUsers: users.length,
        totalChatbots: chatbots.length,
        totalConnections: connections.length,
        totalMessages: messages.total || 0,
        activeConnections: connections.filter((c: any) => c.status === 'CONNECTED').length
      })
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
    }
  }

  const handleDelete = async () => {
    if (confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete(`/companies/${companyId}`)
        router.push('/companies')
      } catch (error) {
        console.error('Erro ao excluir empresa:', error)
      }
    }
  }

  const handleToggleStatus = async () => {
    if (!company) return
    
    try {
      await api.patch(`/companies/${companyId}`, {
        active: !company.active
      })
      setCompany({ ...company, active: !company.active })
    } catch (error) {
      console.error('Erro ao alterar status da empresa:', error)
    }
  }

  const handleEdit = () => {
    setIsEditModalOpen(true)
  }

  const handleEditModalClose = () => {
    setIsEditModalOpen(false)
  }

  const handleEditModalSuccess = () => {
    fetchCompany()
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

  if (error || !company) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/companies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-boti-text">Empresa não encontrada</h1>
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
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.push('/companies')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-boti-text font-poppins flex items-center">
              <Building2 className="h-8 w-8 mr-3 text-boti-primary" />
              {company.name}
            </h1>
            <p className="text-gray-600 mt-1">Detalhes da empresa</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleStatus}
              className={company.active ? 'text-red-600' : 'text-green-600'}
            >
              {company.active ? 'Desativar' : 'Ativar'}
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
          <Badge variant={company.active ? 'default' : 'secondary'} className="text-sm">
            {company.active ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativa
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inativa
              </>
            )}
          </Badge>
          <span className="text-sm text-gray-500">
            Criada em {new Date(company.createdAt).toLocaleDateString('pt-BR')}
          </span>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Total de usuários
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chatbots</CardTitle>
                <Bot className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalChatbots}</div>
                <p className="text-xs text-muted-foreground">
                  Total de chatbots
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conexões</CardTitle>
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeConnections}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalConnections} total
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
          </div>
        )}

        {/* Company Details */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Dados básicos da empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building2 className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{company.name}</p>
                  <p className="text-sm text-gray-500">Nome da empresa</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">{company.email}</p>
                  <p className="text-sm text-gray-500">Email de contato</p>
                </div>
              </div>

              {company.phone && (
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{company.phone}</p>
                    <p className="text-sm text-gray-500">Telefone</p>
                  </div>
                </div>
              )}

              {company.address && (
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{company.address}</p>
                    <p className="text-sm text-gray-500">Endereço</p>
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium">
                    {new Date(company.createdAt).toLocaleDateString('pt-BR')}
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
                Métricas da empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Usuários ativos</span>
                    <span className="font-medium">{stats.totalUsers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Chatbots criados</span>
                    <span className="font-medium">{stats.totalChatbots}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Conexões ativas</span>
                    <span className="font-medium">{stats.activeConnections}/{stats.totalConnections}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Mensagens enviadas</span>
                    <span className="font-medium">{stats.totalMessages}</span>
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
      </div>

      {/* Modal de Edição */}
      <CompanyModal
        company={company}
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        onSuccess={handleEditModalSuccess}
      />
    </RoleGuard>
  )
}
