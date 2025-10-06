'use client'

import { useState, useEffect } from 'react'
import { X, User, Mail, Lock, Building, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User as UserType, Role } from '@/types'
import { api } from '@/lib/api'

interface UserModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: UserType | null
  companies: Array<{ id: string; name: string }>
}

export function UserModal({ isOpen, onClose, onSuccess, user, companies }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: Role.AGENT,
    companyId: '',
    active: true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isInitialized, setIsInitialized] = useState(false)

  const isEdit = !!user

  useEffect(() => {
    if (isOpen && !isInitialized) {
      if (user) {
        setFormData({
          name: user.name,
          email: user.email,
          password: '', // Não preencher senha em edição
          role: user.role,
          companyId: user.companyId,
          active: user.active
        })
      } else {
        setFormData({
          name: '',
          email: '',
          password: '',
          role: Role.AGENT,
          companyId: companies[0]?.id || '',
          active: true
        })
      }
      setErrors({})
      setIsInitialized(true)
    }
  }, [isOpen, user, companies, isInitialized])

  // Reset initialization when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsInitialized(false)
    }
  }, [isOpen])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      let payload: any = {}
      
      console.log('🔍 Form data before processing:', formData)
      console.log('🔍 Is edit mode:', isEdit)
      
      if (isEdit) {
        // Para edição, incluir todos os campos exceto senha vazia
        payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          companyId: formData.companyId,
          active: formData.active
        }
        
        // Incluir senha apenas se foi preenchida
        if (formData.password && formData.password.trim() !== '') {
          payload.password = formData.password
        }
      } else {
        // Para criação, excluir active
        payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          companyId: formData.companyId
        }
        console.log('🔍 Created payload for new user (no active property)')
      }
      
      console.log('📤 Final payload to send:', JSON.stringify(payload, null, 2))
      console.log('🔍 Payload keys:', Object.keys(payload))
      console.log('🔍 Has active property?', 'active' in payload)


      if (isEdit) {
        await api.put(`/users/admin/${user.id}`, payload)
      } else {
        await api.post('/users/admin/create', payload)
      }

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Erro ao salvar usuário:', error)
      
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: 'Erro ao salvar usuário' })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    // Ignorar valores vazios para evitar resets
    if (value === '' || value === null || value === undefined) {
      return
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl">
              {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
            </CardTitle>
            <CardDescription>
              {isEdit ? 'Atualize as informações do usuário' : 'Preencha os dados do novo usuário'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Erro geral */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nome Completo
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Digite o nome completo"
                className={errors.name ? 'border-red-500' : ''}
                required
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Digite o email"
                className={errors.email ? 'border-red-500' : ''}
                required
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha {isEdit && <span className="text-gray-500">(deixe em branco para manter a atual)</span>}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder={isEdit ? "Digite uma nova senha (opcional)" : "Digite a senha"}
                className={errors.password ? 'border-red-500' : ''}
                required={!isEdit}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            {/* Função e Empresa */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Função */}
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Função
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: string) => handleInputChange('role', value)}
                >
                  <SelectTrigger className={errors.role ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.AGENT}>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">Agente</Badge>
                        <span className="text-sm text-gray-500">Acesso básico</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={Role.SUPERVISOR}>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Supervisor</Badge>
                        <span className="text-sm text-gray-500">Acesso intermediário</span>
                      </div>
                    </SelectItem>
                    <SelectItem value={Role.ADMIN}>
                      <div className="flex items-center gap-2">
                        <Badge variant="destructive">Admin</Badge>
                        <span className="text-sm text-gray-500">Acesso total</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              </div>

              {/* Empresa */}
              <div className="space-y-2">
                <Label htmlFor="companyId" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Empresa
                </Label>
                {companies.length > 0 ? (
                <Select
                  value={formData.companyId || ''}
                  onValueChange={(value: string) => handleInputChange('companyId', value)}
                >
                    <SelectTrigger className={errors.companyId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="text-sm text-gray-500">Carregando empresas...</div>
                )}
                {errors.companyId && <p className="text-red-500 text-sm">{errors.companyId}</p>}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Status
              </Label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="active"
                    checked={formData.active}
                    onChange={() => handleInputChange('active', true)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Ativo</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="active"
                    checked={!formData.active}
                    onChange={() => handleInputChange('active', false)}
                    className="text-blue-600"
                  />
                  <span className="text-sm">Inativo</span>
                </label>
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
