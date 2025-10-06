'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Client, Company } from '@/types'
import { api } from '@/lib/api'

const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  companyId: z.string().min(1, 'Empresa é obrigatória'),
})

type ClientFormData = z.infer<typeof clientSchema>

interface ClientModalProps {
  client?: Client | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ClientModal({ client, isOpen, onClose, onSuccess }: ClientModalProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      companyId: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      fetchCompanies()
      if (client) {
        form.reset({
          name: client.name,
          email: client.email || '',
          phone: client.phone,
          companyId: client.companyId,
        })
      } else {
        form.reset({
          name: '',
          email: '',
          phone: '',
          companyId: '',
        })
      }
    }
  }, [isOpen, client, form])

  const fetchCompanies = async () => {
    try {
      const response = await api.get<Company[]>('/companies')
      setCompanies(response.data)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const onSubmit = async (data: ClientFormData) => {
    try {
      setLoading(true)
      
      const clientData = {
        ...data,
        email: data.email || undefined,
        active: true,
      }

      if (client) {
        await api.patch(`/clients/${client.id}`, clientData)
      } else {
        await api.post('/clients', clientData)
      }

      onSuccess()
    } catch (error) {
      console.error('Erro ao salvar cliente:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {client ? 'Editar Cliente' : 'Criar Novo Cliente'}
          </DialogTitle>
          <DialogDescription>
            {client 
              ? 'Edite as informações do cliente.' 
              : 'Preencha os dados para criar um novo cliente.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="Nome completo do cliente"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="email@exemplo.com"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              {...form.register('phone')}
              placeholder="(11) 99999-9999"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyId">Empresa *</Label>
            <select
              id="companyId"
              {...form.register('companyId')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione uma empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {form.formState.errors.companyId && (
              <p className="text-sm text-red-500">{form.formState.errors.companyId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
