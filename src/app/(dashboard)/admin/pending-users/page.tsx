'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Building2, 
  Mail, 
  Phone,
  MapPin,
  MessageSquare,
  Calendar
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'

interface PendingUser {
  id: string
  name: string
  email: string
  companyName: string
  companyEmail: string
  companyPhone?: string
  companyAddress?: string
  message?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  createdAt: string
}

export default function PendingUsersPage() {
  const { user } = useAuth()
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/admin/pending-users')
      setPendingUsers(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuários pendentes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (userId: string) => {
    try {
      setProcessing(userId)
      await api.post(`/admin/pending-users/${userId}/approve`)
      await fetchPendingUsers()
      alert('Usuário aprovado com sucesso!')
    } catch (error) {
      console.error('Erro ao aprovar usuário:', error)
      alert('Erro ao aprovar usuário')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (userId: string) => {
    if (!confirm('Tem certeza que deseja rejeitar esta solicitação?')) {
      return
    }

    try {
      setProcessing(userId)
      await api.post(`/admin/pending-users/${userId}/reject`)
      await fetchPendingUsers()
      alert('Solicitação rejeitada')
    } catch (error) {
      console.error('Erro ao rejeitar usuário:', error)
      alert('Erro ao rejeitar solicitação')
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pendente</Badge>
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Aprovado</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejeitado</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Usuários Pendentes</h1>
        <p className="text-gray-600">Gerencie as solicitações de acesso à plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pendingUsers.filter(u => u.status === 'PENDING').length}
            </div>
            <p className="text-xs text-gray-500">Aguardando aprovação</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Aprovados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {pendingUsers.filter(u => u.status === 'APPROVED').length}
            </div>
            <p className="text-xs text-gray-500">Aprovados hoje</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejeitados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {pendingUsers.filter(u => u.status === 'REJECTED').length}
            </div>
            <p className="text-xs text-gray-500">Rejeitados hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users List */}
      <div className="space-y-4">
        {pendingUsers.map((pendingUser) => (
          <Card key={pendingUser.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{pendingUser.name}</CardTitle>
                    <CardDescription>{pendingUser.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(pendingUser.status)}
                  <span className="text-sm text-gray-500">
                    {new Date(pendingUser.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dados Pessoais */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Dados Pessoais
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{pendingUser.email}</span>
                    </div>
                  </div>
                </div>

                {/* Dados da Empresa */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" />
                    Dados da Empresa
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <Building2 className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{pendingUser.companyName}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{pendingUser.companyEmail}</span>
                    </div>
                    {pendingUser.companyPhone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{pendingUser.companyPhone}</span>
                      </div>
                    )}
                    {pendingUser.companyAddress && (
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{pendingUser.companyAddress}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mensagem do usuário */}
              {pendingUser.message && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mensagem do Usuário
                  </h5>
                  <p className="text-sm text-gray-700">{pendingUser.message}</p>
                </div>
              )}

              {/* Actions */}
              {pendingUser.status === 'PENDING' && (
                <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => handleReject(pendingUser.id)}
                    disabled={processing === pendingUser.id}
                    className="text-red-600 hover:text-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rejeitar
                  </Button>
                  <Button
                    onClick={() => handleApprove(pendingUser.id)}
                    disabled={processing === pendingUser.id}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Aprovar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {pendingUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhuma solicitação pendente
              </h3>
              <p className="text-gray-600">
                Não há usuários aguardando aprovação no momento.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
