'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Company, CreateCompanyDto, UpdateCompanyDto } from '@/types'
import { api } from '@/lib/api'

const companySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyModalProps {
  company?: Company
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CompanyModal({ company, isOpen, onClose, onSuccess }: CompanyModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: company?.name || '',
      email: company?.email || '',
      phone: company?.phone || '',
      address: company?.address || '',
    },
  })

  useEffect(() => {
    if (company) {
      reset({
        name: company.name,
        email: company.email,
        phone: company.phone || '',
        address: company.address || '',
      })
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
      })
    }
  }, [company, reset])

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setLoading(true)
      setError('')

      if (company) {
        // Atualizar empresa existente
        await api.patch<Company>(`/companies/${company.id}`, data as UpdateCompanyDto)
      } else {
        // Criar nova empresa
        await api.post<Company>('/companies', data as CreateCompanyDto)
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao salvar empresa')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 max-h-[90vh] overflow-y-auto">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {company ? 'Editar Empresa' : 'Nova Empresa'}
          </CardTitle>
          <CardDescription>
            {company 
              ? 'Atualize as informações da empresa'
              : 'Preencha os dados para criar uma nova empresa'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                placeholder="Nome da empresa"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="empresa@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                {...register('phone')}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                placeholder="Rua, número, cidade, estado"
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address.message}</p>
              )}
            </div>

            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200"
            >
              {loading ? 'Salvando...' : company ? 'Atualizar' : 'Criar'}
            </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
