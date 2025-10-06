'use client'

import { useState, useEffect } from 'react'
import { User, Mail, Building, Shield, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'
import { Role } from '@/types'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      // Validar senhas se fornecidas
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setErrors({ confirmPassword: 'As senhas não coincidem' })
        return
      }

      const updateData: any = {
        name: formData.name,
        email: formData.email
      }

      // Incluir senha apenas se fornecida
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      await api.put('/users/profile', updateData)
      
      // Atualizar dados do usuário no contexto
      updateUser({
        ...user!,
        name: formData.name,
        email: formData.email
      })

      alert('Perfil atualizado com sucesso!')
    } catch (error: any) {
      if (error.response?.data?.message) {
        setErrors({ general: error.response.data.message })
      } else if (error.response?.data?.errors) {
        setErrors(error.response.data.errors)
      } else {
        setErrors({ general: 'Erro ao atualizar perfil' })
      }
    } finally {
      setLoading(false)
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-boti-text font-poppins">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar e Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-boti-primary flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-200">
                <span className="text-2xl font-bold text-white">
                  {getInitials(user.name)}
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="mt-2">
                  {getRoleBadge(user.role)}
                </div>
              </div>
            </div>

            {/* Informações da Empresa */}
            {user.company && (
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building className="h-4 w-4" />
                  <span>{user.company.name}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Formulário de Edição */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais
              </CardDescription>
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
                    placeholder="Digite seu nome completo"
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
                    placeholder="Digite seu email"
                    className={errors.email ? 'border-red-500' : ''}
                    required
                  />
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                {/* Senha Atual */}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      placeholder="Digite sua senha atual"
                      className={errors.currentPassword ? 'border-red-500' : ''}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.currentPassword && <p className="text-red-500 text-sm">{errors.currentPassword}</p>}
                </div>

                {/* Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha (opcional)</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    placeholder="Digite uma nova senha"
                    className={errors.newPassword ? 'border-red-500' : ''}
                  />
                  {errors.newPassword && <p className="text-red-500 text-sm">{errors.newPassword}</p>}
                </div>

                {/* Confirmar Nova Senha */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    placeholder="Confirme a nova senha"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
                </div>

                {/* Botões */}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button type="submit" disabled={loading} className="bg-boti-primary hover:bg-boti-primary/90">
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
