'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { api } from '@/lib/api'
import { Company, Role } from '@/types'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface Chatbot {
  id: string
  name: string
  description?: string
  active: boolean
  autoEndMessage?: string
  companyId: string
  configuration?: any
}

interface ChatbotModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  chatbot: Chatbot | null
}

const formSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  active: z.boolean().default(true),
  autoEndMessage: z.string().optional(),
  companyId: z.string().min(1, 'A empresa é obrigatória'),
})

type FormData = z.infer<typeof formSchema>

export function ChatbotModal({ isOpen, onClose, onSuccess, chatbot }: ChatbotModalProps) {
  const { user } = useAuth()
  const { isAdmin } = usePermissions()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [companiesLoaded, setCompaniesLoaded] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: chatbot?.name || '',
      description: chatbot?.description || '',
      active: chatbot?.active ?? true,
      autoEndMessage: chatbot?.autoEndMessage || '',
      companyId: chatbot?.companyId || user?.companyId || '',
    },
  })

  useEffect(() => {
    if (chatbot) {
      form.reset({
        name: chatbot.name,
        description: chatbot.description || '',
        active: chatbot.active,
        autoEndMessage: chatbot.autoEndMessage || '',
        companyId: chatbot.companyId,
      })
    } else {
      form.reset({
        name: '',
        description: '',
        active: true,
        autoEndMessage: '',
        companyId: user?.companyId || '',
      })
    }
  }, [isOpen, chatbot, form, user])

  useEffect(() => {
    if (isAdmin() && isOpen && !companiesLoaded) {
      fetchCompanies()
    }
  }, [isAdmin, isOpen, companiesLoaded])

  // Reset companies loaded state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCompaniesLoaded(false)
    }
  }, [isOpen])

  const fetchCompanies = async () => {
    try {
      const response = await api.get<Company[]>('/companies')
      setCompanies(response.data)
      setCompaniesLoaded(true)
    } catch (error) {
      console.error('Erro ao carregar empresas:', error)
    }
  }

  const createDefaultFlow = async (chatbotId: string, chatbotName: string) => {
    try {
      // Criar o flow padrão
      const flowResponse = await api.post('/flows', {
        name: `Flow do ${chatbotName}`,
        description: 'Fluxo padrão criado automaticamente',
        chatbotId: chatbotId,
        active: true,
        isDefault: true
      })
      
      const flowId = flowResponse.data.id
      console.log('✅ Flow padrão criado:', flowId)

      // Criar nós padrão
      const nodes = [
        {
          id: 'start_node',
          title: 'Início',
          message: 'Bem-vindo! Como posso ajudá-lo?',
          nodeType: 'MESSAGE',
          position: { x: 100, y: 100 },
          isStart: true,
          isEnd: false
        },
        {
          id: 'welcome_node',
          title: 'Mensagem de Boas-vindas',
          message: 'Olá! Como posso ajudá-lo hoje?',
          nodeType: 'MESSAGE',
          position: { x: 300, y: 100 },
          isStart: false,
          isEnd: false
        },
        {
          id: 'end_node',
          title: 'Fim',
          message: 'Obrigado por usar nosso chatbot!',
          nodeType: 'MESSAGE',
          position: { x: 500, y: 100 },
          isStart: false,
          isEnd: true
        }
      ]

      for (const nodeData of nodes) {
        await api.post(`/flows/${flowId}/nodes`, nodeData)
        console.log('✅ Nó padrão criado:', nodeData.id)
      }

      // Criar conexões padrão
      const connections = [
        {
          sourceNodeId: 'start_node',
          targetNodeId: 'welcome_node',
          condition: null
        },
        {
          sourceNodeId: 'welcome_node',
          targetNodeId: 'end_node',
          condition: null
        }
      ]

      for (const connection of connections) {
        await api.post(`/flows/${flowId}/connections`, connection)
        console.log('✅ Conexão padrão criada:', connection.sourceNodeId, '->', connection.targetNodeId)
      }

      console.log('✅ Fluxo padrão criado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao criar fluxo padrão:', error)
      // Não falhar a criação do chatbot se o fluxo falhar
    }
  }

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true)
      
      // Verificar se o usuário tem companyId
      if (!user?.companyId && !isAdmin()) {
        alert('Erro: Usuário não está associado a uma empresa. Por favor, contate o administrador.')
        return
      }

      const chatbotData = {
        ...data,
        companyId: isAdmin() ? data.companyId : user?.companyId, // ADMIN pode escolher, outros usam o seu
      }

      console.log('📤 Enviando dados do chatbot:', chatbotData)

      let chatbotId = chatbot?.id

      if (chatbot) {
        console.log('✏️ Editando chatbot existente:', chatbot.id)
        await api.patch(`/chatbots/${chatbot.id}`, chatbotData)
        chatbotId = chatbot.id
      } else {
        console.log('➕ Criando novo chatbot')
        const response = await api.post('/chatbots', chatbotData)
        console.log('✅ Chatbot criado:', response.data)
        chatbotId = response.data.id
      }

      // Criar fluxo padrão automaticamente para novos chatbots
      if (!chatbot && chatbotId) {
        console.log('🔄 Criando fluxo padrão para o chatbot:', chatbotId)
        await createDefaultFlow(chatbotId, data.name)
      }

      onSuccess()
    } catch (error: any) {
      console.error('❌ Erro ao salvar chatbot:', error)
      console.error('📋 Detalhes do erro:', error.response?.data || error.message)
      
      // Mostrar erro para o usuário
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido'
      alert(`Erro ao salvar chatbot: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>{chatbot ? 'Editar Chatbot' : 'Criar Novo Chatbot'}</DialogTitle>
          <DialogDescription>
            {chatbot ? 'Edite os detalhes do chatbot.' : 'Preencha os campos para criar um novo chatbot.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nome *
            </Label>
            <Input 
              id="name" 
              {...form.register('name')} 
              className="col-span-3" 
              placeholder="Ex: Atendimento Vendas"
            />
            {form.formState.errors.name && (
              <p className="col-span-4 text-right text-red-500 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Descrição
            </Label>
            <Textarea 
              id="description" 
              {...form.register('description')} 
              className="col-span-3" 
              placeholder="Descreva o propósito do chatbot..."
              rows={3}
            />
            {form.formState.errors.description && (
              <p className="col-span-4 text-right text-red-500 text-sm">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="autoEndMessage" className="text-right">
              Mensagem de Finalização
            </Label>
            <Textarea 
              id="autoEndMessage" 
              {...form.register('autoEndMessage')} 
              className="col-span-3" 
              placeholder="Mensagem enviada automaticamente quando a conversa for finalizada pela cron..."
              rows={2}
            />
            {form.formState.errors.autoEndMessage && (
              <p className="col-span-4 text-right text-red-500 text-sm">
                {form.formState.errors.autoEndMessage.message}
              </p>
            )}
          </div>

          {isAdmin() && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="companyId" className="text-right">
                Empresa *
              </Label>
              <Select
                onValueChange={(value: string) => form.setValue('companyId', value)}
                value={form.watch('companyId')}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma empresa" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.companyId && (
                <p className="col-span-4 text-right text-red-500 text-sm">
                  {form.formState.errors.companyId.message}
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="active" className="text-right">
              Ativo
            </Label>
            <div className="col-span-3 flex items-center space-x-2">
              <Switch
                id="active"
                checked={form.watch('active')}
                onCheckedChange={(checked: boolean) => form.setValue('active', checked)}
              />
              <Label htmlFor="active" className="text-sm text-gray-600">
                {form.watch('active') ? 'Chatbot ativo' : 'Chatbot inativo'}
              </Label>
            </div>
          </div>


          <DialogFooter>
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
