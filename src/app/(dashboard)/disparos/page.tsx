'use client'

import { useState, useEffect } from 'react'
import type { FormEvent, ChangeEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Send, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  Users,
  Calendar,
  BarChart3,
  Upload,
  Image,
  File,
  X
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import type { Client } from '@/types'
import { api } from '@/lib/api'

const disparoTipos = [
  { value: 'PROMOCIONAL', label: 'Promocional' },
  { value: 'LEMBRETE', label: 'Lembrete' },
  { value: 'FOLLOWUP', label: 'Follow-up' },
  { value: 'NEWSLETTER', label: 'Newsletter' },
  { value: 'PERSONALIZADO', label: 'Personalizado' }
]

const statusColors = {
  AGENDADO: 'bg-blue-100 text-blue-800',
  ENVIANDO: 'bg-yellow-100 text-yellow-800',
  CONCLUIDO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-gray-100 text-gray-800',
  ERRO: 'bg-red-100 text-red-800'
}

const statusIcons = {
  AGENDADO: Clock,
  ENVIANDO: Send,
  CONCLUIDO: CheckCircle,
  CANCELADO: XCircle,
  ERRO: AlertCircle
}

export default function DisparosPage() {
  const { user } = useAuth()
  const [disparos, setDisparos] = useState([])
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [clientes, setClientes] = useState<Client[]>([])
  const [clientesSelecionados, setClientesSelecionados] = useState<Client[]>([])
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'PROMOCIONAL',
    scheduledFor: '',
    recipients: [],
    sendInterval: 5, // segundos entre envios
    selectedClients: [],
    attachments: []
  })

  useEffect(() => {
    fetchDisparos()
    fetchUsage()
    fetchClientes()
  }, [])

  const fetchDisparos = async () => {
    try {
      const response = await api.get('/disparos')
      setDisparos(response.data)
    } catch (error) {
      console.error('Erro ao carregar disparos:', error)
    }
  }

  const fetchUsage = async () => {
    try {
      const response = await api.get('/companies/usage')
      setUsage(response.data)
    } catch (error) {
      console.error('Erro ao carregar uso:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchClientes = async () => {
    try {
      const response = await api.get('/clients')
      setClientes(response.data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    }
  }

  const handleCreateDisparo = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (clientesSelecionados.length === 0) {
      alert('Selecione pelo menos um cliente para o disparo')
      return
    }
    
    try {
      // Preparar dados do disparo
      const disparoData = {
        ...formData,
        recipients: clientesSelecionados.map(cliente => ({
          clientId: cliente.id,
          phone: cliente.phone,
          name: cliente.name
        })),
        selectedClients: clientesSelecionados.map(c => c.id)
      }
      
      // Verificar limites antes de criar
      await api.post('/disparos/check-limits', {
        quantidade: clientesSelecionados.length
      })
      
      // Criar disparo
      await api.post('/disparos', disparoData)
      
      setShowCreateModal(false)
      setFormData({
        title: '',
        message: '',
        type: 'PROMOCIONAL',
        scheduledFor: '',
        recipients: [],
        sendInterval: 5,
        selectedClients: [],
        attachments: []
      })
      setClientesSelecionados([])
      
      fetchDisparos()
      fetchUsage()
      
      alert('Disparo criado com sucesso!')
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Limite de disparos atingido. Faça upgrade para enviar mais.')
      } else {
        alert('Erro ao criar disparo')
      }
    }
  }

  const handleSendDisparo = async (disparoId: string) => {
    try {
      await api.post(`/disparos/${disparoId}/send`)
      fetchDisparos()
      fetchUsage()
      alert('Disparo enviado com sucesso!')
    } catch (error) {
      alert('Erro ao enviar disparo')
    }
  }

  const handleCancelDisparo = async (disparoId: string) => {
    try {
      await api.post(`/disparos/${disparoId}/cancel`)
      fetchDisparos()
      alert('Disparo cancelado')
    } catch (error) {
      alert('Erro ao cancelar disparo')
    }
  }

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)
    
    try {
      // Upload dos arquivos para o servidor
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('path', 'disparos')
        
        const response = await api.post('/storage/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        return {
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          url: response.data.data.url,
          key: response.data.data.key,
          preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
        }
      })
      
      const uploadedFiles = await Promise.all(uploadPromises)
      
      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...uploadedFiles]
      })
    } catch (error) {
      console.error('Erro ao fazer upload dos arquivos:', error)
      alert('Erro ao fazer upload dos arquivos')
    }
  }

  const removeAnexo = async (anexoId: number) => {
    const anexo = formData.attachments.find(a => a.id === anexoId)
    
    if (anexo && anexo.key) {
      try {
        // Deletar arquivo do servidor
        await api.delete(`/storage/${anexo.key}`)
      } catch (error) {
        console.error('Erro ao deletar arquivo do servidor:', error)
      }
    }
    
    setFormData({
      ...formData,
      attachments: formData.attachments.filter(anexo => anexo.id !== anexoId)
    })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-boti-text font-poppins">Disparos</h1>
          <p className="text-gray-600">Gerencie suas campanhas de marketing</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto bg-boti-primary hover:bg-boti-primary/90 text-white transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Disparos Mensais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.currentDisparos || 0}</div>
            <div className="text-xs text-gray-500">
              de {usage?.maxDisparos || 0} disparos
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ 
                  width: `${((usage?.currentDisparos || 0) / (usage?.maxDisparos || 1)) * 100}%` 
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Disparos Diários
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.currentDisparosDiarios || 0}</div>
            <div className="text-xs text-gray-500">
              de {usage?.maxDisparosDiarios || 0} disparos
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ 
                  width: `${((usage?.currentDisparosDiarios || 0) / (usage?.maxDisparosDiarios || 1)) * 100}%` 
                }}
              ></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Taxa de Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <div className="text-xs text-gray-500">
              Últimos 30 dias
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Disparos List */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas de Disparo</CardTitle>
          <CardDescription>
            Gerencie suas campanhas de marketing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {disparos.map((disparo) => {
              const StatusIcon = statusIcons[disparo.status]
              return (
                <div key={disparo.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <StatusIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">{disparo.titulo}</h4>
                      <p className="text-sm text-gray-500">
                        {disparo.destinatarios?.length || 0} destinatários • 
                        {disparo.tipo} • 
                        {new Date(disparo.agendadoPara).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className={statusColors[disparo.status]}>
                      {disparo.status}
                    </Badge>
                    
                    {disparo.status === 'AGENDADO' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSendDisparo(disparo.id)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Enviar
                      </Button>
                    )}
                    
                    {disparo.status === 'AGENDADO' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCancelDisparo(disparo.id)}
                      >
                        Cancelar
                      </Button>
                    )}
                    
                    <Button size="sm" variant="outline">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              )
            })}
            
            {disparos.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhuma campanha criada
                </h3>
                <p className="text-gray-600 mb-4">
                  Comece criando sua primeira campanha de disparo
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Campanha
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Nova Campanha de Disparo</CardTitle>
              <CardDescription>
                Crie uma nova campanha de marketing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateDisparo} className="space-y-4">
                <div>
                  <Label>Título da Campanha</Label>
                  <Input 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Ex: Promoção Black Friday"
                    required
                  />
                </div>

                {/* Seleção de Clientes */}
                <div>
                  <Label>Selecionar Clientes</Label>
                  <div className="border border-gray-300 rounded-md p-3 max-h-40 overflow-y-auto">
                    <div className="mb-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={clientesSelecionados.length === clientes.length && clientes.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setClientesSelecionados(clientes)
                            } else {
                              setClientesSelecionados([])
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm font-medium">
                          Selecionar Todos ({clientes.length} clientes)
                        </span>
                      </label>
                    </div>
                    {clientes.map((cliente) => (
                      <label key={cliente.id} className="flex items-center py-1">
                        <input
                          type="checkbox"
                          checked={clientesSelecionados.some(c => c.id === cliente.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setClientesSelecionados([...clientesSelecionados, cliente])
                            } else {
                              setClientesSelecionados(clientesSelecionados.filter(c => c.id !== cliente.id))
                            }
                          }}
                          className="mr-2"
                        />
                        <span className="text-sm">{cliente.name} - {cliente.phone}</span>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {clientesSelecionados.length} cliente(s) selecionado(s)
                  </p>
                </div>
                
                <div>
                  <Label>Mensagem</Label>
                  <Textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Digite sua mensagem aqui..."
                    rows={4}
                    required
                  />
                </div>

                {/* Upload de Arquivos */}
                <div>
                  <Label>Anexos (Imagens e Arquivos)</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center justify-center py-4"
                    >
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Clique para adicionar arquivos ou arraste aqui
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        Suporta: JPG, PNG, PDF, DOC, TXT (máx. 10MB cada)
                      </span>
                    </label>
                  </div>
                  
                  {/* Lista de Anexos */}
                  {formData.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {formData.attachments.map((anexo) => (
                        <div key={anexo.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center space-x-2">
                            {anexo.type.startsWith('image/') ? (
                              <Image className="h-4 w-4 text-blue-500" />
                            ) : (
                              <File className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="text-sm font-medium">{anexo.name}</span>
                            <span className="text-xs text-gray-500">({formatFileSize(anexo.size)})</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAnexo(anexo.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Disparo</Label>
                    <Select 
                      value={formData.type} 
                      onValueChange={(value) => setFormData({...formData, type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {disparoTipos.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Agendar para</Label>
                    <Input 
                      type="datetime-local"
                      value={formData.scheduledFor}
                      onChange={(e) => setFormData({...formData, scheduledFor: e.target.value})}
                      required
                    />
                  </div>
                </div>

                {/* Controle de Intervalo */}
                <div>
                  <Label>Intervalo entre Envios (segundos)</Label>
                  <Input
                    type="number"
                    min="3"
                    max="60"
                    value={formData.sendInterval}
                    onChange={(e) => setFormData({...formData, sendInterval: parseInt(e.target.value) || 5})}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Recomendado: 5-10 segundos para evitar bloqueios do WhatsApp
                  </p>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    Criar Campanha
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
