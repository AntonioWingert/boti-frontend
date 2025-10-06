'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { usePermissions } from '@/hooks/use-permissions'
import { api } from '@/lib/api'
import { Company } from '@/types'

const connectionSchema = z.object({
  sessionName: z.string().min(2, 'Nome da sessão deve ter pelo menos 2 caracteres'),
  phoneNumber: z.string().optional(),
  companyId: z.string().min(1, 'A empresa é obrigatória'),
  chatbotId: z.string().optional(),
})

type ConnectionFormData = z.infer<typeof connectionSchema>

interface WhatsAppSession {
  id: string
  sessionName: string
  phoneNumber?: string
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'FAILED'
  qrCode?: string
  lastSeen?: string
  companyId: string
  chatbotId?: string
  company?: {
    name: string
  }
  chatbot?: {
    id: string
    name: string
  }
}

interface ConnectionModalProps {
  session?: WhatsAppSession | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ConnectionModal({ session, isOpen, onClose, onSuccess }: ConnectionModalProps) {
  const { user, refreshUser } = useAuth()
  const { isAdmin } = usePermissions()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<Company[]>([])
  const [chatbots, setChatbots] = useState<any[]>([])
  const [loadingCompanies, setLoadingCompanies] = useState(false)
  const [loadingChatbots, setLoadingChatbots] = useState(false)
  const companiesLoadedRef = useRef(false)


  const form = useForm<ConnectionFormData>({
    resolver: zodResolver(connectionSchema),
    defaultValues: {
      sessionName: '',
      phoneNumber: '',
      companyId: '',
    },
  })

  // Carregar empresas quando o modal abrir (apenas uma vez)
  useEffect(() => {
    if (isOpen && isAdmin() && !companiesLoadedRef.current) {
      const fetchCompanies = async () => {
        try {
          setLoadingCompanies(true)
          companiesLoadedRef.current = true
          const response = await api.get<Company[]>('/companies')
          setCompanies(response.data)
        } catch (error) {
          console.error('❌ Erro ao carregar empresas:', error)
          companiesLoadedRef.current = false // Reset em caso de erro
        } finally {
          setLoadingCompanies(false)
        }
      }
      fetchCompanies()
    }
  }, [isOpen])

  // Função para buscar chatbots quando empresa for selecionada
  const fetchChatbots = async (companyId: string) => {
    if (!companyId) return
    setLoadingChatbots(true)
    try {
      const response = await api.get(`/chatbots?companyId=${companyId}`)
      setChatbots(response.data)
    } catch (error) {
      console.error('Erro ao carregar chatbots:', error)
    } finally {
      setLoadingChatbots(false)
    }
  }

  // Reset companiesLoadedRef quando o modal fechar
  useEffect(() => {
    if (!isOpen) {
      companiesLoadedRef.current = false
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      console.log('🔍 Modal aberto, session:', session)
      if (session) {
        console.log('📝 Preenchendo formulário com dados da sessão:', {
          sessionName: session.sessionName,
          phoneNumber: session.phoneNumber,
          companyId: session.companyId,
          chatbotId: session.chatbotId
        })
        
        form.reset({
          sessionName: session.sessionName,
          phoneNumber: session.phoneNumber || '',
          companyId: session.companyId,
          chatbotId: session.chatbotId || '',
        })
        
        // Carregar chatbots da empresa da sessão
        if (session.companyId) {
          console.log('🤖 Carregando chatbots para empresa:', session.companyId)
          fetchChatbots(session.companyId)
        }
      } else {
        console.log('📝 Preenchendo formulário vazio')
        form.reset({
          sessionName: '',
          phoneNumber: '',
          companyId: isAdmin() ? '' : user?.companyId || '',
          chatbotId: '',
        })
      }
    }
  }, [isOpen, session])

  const onSubmit = async (data: ConnectionFormData) => {
    try {
      setLoading(true)
      
      // Para usuários não-admin, usar o companyId do usuário
      const finalCompanyId = isAdmin() ? data.companyId : user?.companyId
      
      if (!finalCompanyId) {
        console.error('❌ companyId não encontrado')
        alert('Erro: Empresa não selecionada')
        return
      }
      
      const sessionData = {
        sessionName: data.sessionName,
        phoneNumber: data.phoneNumber || undefined,
        companyId: finalCompanyId,
        chatbotId: data.chatbotId || undefined,
      }

      if (session) {
        await api.put(`/whatsapp/sessions/${session.id}`, sessionData)
      } else {
        await api.post('/whatsapp/sessions', sessionData)
      }

      onSuccess()
    } catch (error: any) {
      console.error('Erro ao salvar conexão:', error)
      
      // Mostrar erro para o usuário
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido'
      alert(`Erro ao salvar conexão: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" onClose={onClose}>
        <DialogHeader>
          <DialogTitle>
            {session ? 'Editar Conexão' : 'Criar Nova Conexão'}
          </DialogTitle>
          <DialogDescription>
            {session 
              ? 'Edite as informações da conexão WhatsApp.' 
              : 'Configure uma nova conexão WhatsApp para sua empresa.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionName">Nome da Sessão *</Label>
            <Input
              id="sessionName"
              {...form.register('sessionName')}
              placeholder="Ex: WhatsApp Vendas"
            />
            {form.formState.errors.sessionName && (
              <p className="text-sm text-red-500">{form.formState.errors.sessionName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Número do WhatsApp</Label>
            <Input
              id="phoneNumber"
              {...form.register('phoneNumber')}
              placeholder="Ex: 5511999999999"
            />
            <p className="text-xs text-gray-500">
              Deixe em branco para gerar QR Code
            </p>
            {form.formState.errors.phoneNumber && (
              <p className="text-sm text-red-500">{form.formState.errors.phoneNumber.message}</p>
            )}
          </div>

          {/* Campo de empresa apenas para ADMINs */}
          {isAdmin() && (
            <div className="space-y-2">
              <Label htmlFor="companyId">Empresa *</Label>
              <select
                id="companyId"
                {...form.register('companyId')}
                disabled={loadingCompanies}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loadingCompanies ? 'Carregando empresas...' : 'Selecione uma empresa'}
                </option>
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
          )}

          {/* Campo de chatbot */}
          <div className="space-y-2">
            <Label htmlFor="chatbotId">Chatbot (Opcional)</Label>
            <select
              id="chatbotId"
              {...form.register('chatbotId')}
              disabled={loadingChatbots}
              onChange={(e) => {
                form.setValue('chatbotId', e.target.value)
                // Buscar chatbots quando empresa mudar (apenas para ADMINs)
                if (isAdmin() && form.getValues('companyId')) {
                  fetchChatbots(form.getValues('companyId'))
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingChatbots ? 'Carregando chatbots...' : 'Selecione um chatbot (opcional)'}
              </option>
              {chatbots.map((chatbot) => (
                <option key={chatbot.id} value={chatbot.id}>
                  {chatbot.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">
              Se não selecionar, será usado o chatbot padrão da empresa
            </p>
            {form.formState.errors.chatbotId && (
              <p className="text-sm text-red-500">{form.formState.errors.chatbotId.message}</p>
            )}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como conectar:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Salve a conexão</li>
              <li>2. Clique em "Conectar" na lista</li>
              <li>3. Escaneie o QR Code com seu WhatsApp</li>
              <li>4. Aguarde a confirmação de conexão</li>
            </ol>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
