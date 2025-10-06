'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RoleGuard } from '@/components/auth/role-guard'
import { UserModal } from '@/components/modals/user-modal'
import { User, Role } from '@/types'
import { api } from '@/lib/api'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
    fetchCompanies()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await api.get<User[]>('/users/admin/all')
      setUsers(response.data)
    } catch (error) {
      console.error('Erro ao carregar usuários:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCompanies = async () => {
    try {
      const response = await api.get<Array<{ id: string; name: string }>>('/companies')
      setCompanies(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await api.delete(`/users/admin/${id}`)
        setUsers(users.filter(user => user.id !== id))
      } catch (error) {
        console.error('Erro ao excluir usuário:', error)
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`/users/admin/${id}/toggle-status`)
      setUsers(users.map(user => 
        user.id === id 
          ? { ...user, active: !currentStatus }
          : user
      ))
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error)
    }
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedUser(null)
  }

  const handleModalSuccess = () => {
    fetchUsers()
  }

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return <Badge variant="destructive">Admin</Badge>
      case Role.SUPERVISOR:
        return <Badge variant="default">Supervisor</Badge>
      case Role.AGENT:
        return <Badge variant="secondary">Agente</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={[Role.ADMIN]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
            <p className="text-gray-600">Gerencie os usuários do sistema</p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Usuários</CardTitle>
            <CardDescription>
              Encontre usuários por nome ou email
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {getRoleBadge(user.role)}
                    <Badge variant={user.active ? "default" : "secondary"}>
                      {user.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    🏢 {user.company?.name || 'Sem empresa'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Criado em: {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(user.id, user.active)}
                    >
                      {user.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm ? 'Nenhum usuário encontrado para a busca.' : 'Nenhum usuário cadastrado.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        <UserModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          user={selectedUser}
          companies={companies}
        />
      </div>
    </RoleGuard>
  )
}
