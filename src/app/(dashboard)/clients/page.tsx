'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, Phone, Mail, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClientModal } from '@/components/modals/client-modal'
import { Client } from '@/types'
import { api } from '@/lib/api'

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await api.get<Client[]>('/clients')
      setClients(response.data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setSelectedClient(null)
    setIsModalOpen(true)
  }

  const handleEdit = (client: Client) => {
    setSelectedClient(client)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedClient(null)
  }

  const handleModalSuccess = () => {
    fetchClients()
    handleModalClose()
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      try {
        await api.delete(`/clients/${id}`)
        setClients(clients.filter(client => client.id !== id))
      } catch (error) {
        console.error('Erro ao excluir cliente:', error)
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/clients/${id}/toggle-status`)
      setClients(clients.map(client => 
        client.id === id 
          ? { ...client, active: !currentStatus }
          : client
      ))
    } catch (error) {
      console.error('Erro ao alterar status do cliente:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-boti-text font-poppins">Clientes</h1>
          <p className="text-gray-600">Gerencie os clientes do sistema</p>
        </div>
        <Button 
          onClick={handleCreate}
          className="w-full sm:w-auto bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Clientes</CardTitle>
          <CardDescription>
            Encontre clientes por nome, email, telefone ou empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{client.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <Building2 className="h-4 w-4 mr-1" />
                    {client.company?.name || 'Sem empresa'}
                  </CardDescription>
                </div>
                <Badge variant={client.active ? "default" : "secondary"}>
                  {client.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {client.phone}
                  </div>
                  {client.email && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                  )}
                </div>

                {/* Created Date */}
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Criado em: {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center pt-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(client.id, client.active)}
                    >
                      {client.active ? 'Desativar' : 'Ativar'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(client)}
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
                    onClick={() => handleDelete(client.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm 
                ? 'Tente ajustar os termos de busca.' 
                : 'Comece adicionando seu primeiro cliente.'
              }
            </p>
            {!searchTerm && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Cliente
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <ClientModal
        client={selectedClient}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
    </div>
  )
}
