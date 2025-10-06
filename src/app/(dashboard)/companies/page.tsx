'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CompanyModal } from '@/components/modals/company-modal'
import { RoleGuard } from '@/components/auth/role-guard'
import { Company, Role } from '@/types'
import { api } from '@/lib/api'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<Company | undefined>()

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    try {
      setLoading(true)
      const response = await api.get<Company[]>('/companies')
      setCompanies(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await api.delete(`/companies/${id}`)
        setCompanies(companies.filter(company => company.id !== id))
      } catch (error) {
        console.error('Erro ao excluir empresa:', error)
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/companies/${id}/toggle-status`)
      setCompanies(companies.map(company => 
        company.id === id 
          ? { ...company, active: !currentStatus }
          : company
      ))
    } catch (error) {
      console.error('Erro ao alterar status da empresa:', error)
    }
  }

  const handleEdit = (company: Company) => {
    setSelectedCompany(company)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedCompany(undefined)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedCompany(undefined)
  }

  const handleModalSuccess = () => {
    fetchCompanies()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando empresas...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard allowedRoles={[Role.ADMIN, Role.SUPERVISOR]}>
      <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-boti-text font-poppins">Empresas</h1>
          <p className="text-gray-600">Gerencie as empresas do sistema</p>
        </div>
        <Button 
          onClick={handleCreate}
          className="w-full sm:w-auto bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Buscar Empresas</CardTitle>
          <CardDescription>
            Encontre empresas por nome ou email
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

      {/* Companies List */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <CardDescription>{company.email}</CardDescription>
                </div>
                <Badge variant={company.active ? "default" : "secondary"}>
                  {company.active ? "Ativa" : "Inativa"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {company.phone && (
                  <p className="text-sm text-gray-600">
                    📞 {company.phone}
                  </p>
                )}
                {company.address && (
                  <p className="text-sm text-gray-600">
                    📍 {company.address}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Criada em: {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
              
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(company.id, company.active)}
                  >
                    {company.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(company)}
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
                  onClick={() => handleDelete(company.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? 'Nenhuma empresa encontrada para a busca.' : 'Nenhuma empresa cadastrada.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modal */}
      <CompanyModal
        company={selectedCompany}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
      />
      </div>
    </RoleGuard>
  )
}
