'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Bot, Play, Pause, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChatbotModal } from '@/components/modals/chatbot-modal'
import { FlowEditor } from '@/components/chatbot/flow-editor'
import { RoleGuard } from '@/components/auth/role-guard'
import { Role } from '@/types'
import { api } from '@/lib/api'

interface Chatbot {
  id: string
  name: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
  companyId: string
  company?: {
    name: string
  }
}

export default function AdminChatbotsPage() {
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null)
  const [showFlowEditor, setShowFlowEditor] = useState(false)
  const [flowData, setFlowData] = useState<any>(null)
  const [flowId, setFlowId] = useState<string | null>(null)

  useEffect(() => {
    fetchChatbots()
  }, [])

  const fetchChatbots = async () => {
    try {
      setLoading(true)
      // ADMINs podem ver todos os chatbots do sistema
      const response = await api.get<Chatbot[]>('/chatbots')
      setChatbots(response.data)
    } catch (error) {
      console.error('Erro ao carregar chatbots:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChatbots = chatbots.filter(chatbot =>
    chatbot.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chatbot.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chatbot.company?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = () => {
    setSelectedChatbot(null)
    setIsModalOpen(true)
  }

  const handleEdit = (chatbot: Chatbot) => {
    setSelectedChatbot(chatbot)
    setIsModalOpen(true)
  }

  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedChatbot(null)
  }

  const handleModalSuccess = () => {
    fetchChatbots()
    handleModalClose()
  }

  const handleOpenFlowEditor = async (chatbot: Chatbot) => {
    try {
      setSelectedChatbot(chatbot)
      
      // Buscar flows do chatbot da API
      const response = await api.get(`/flows?chatbotId=${chatbot.id}`)
      const flows = response.data
      
      if (flows && flows.length > 0) {
        // Usar o primeiro flow (ou o flow padrão)
        const flow = flows.find((f: any) => f.isDefault) || flows[0]
        
        // Definir flowId ANTES de abrir o editor
        console.log('🆔 Definindo flowId antes de abrir editor:', flow.id)
        setFlowId(flow.id)
        
        // Converter dados do flow para formato do ReactFlow
        const reactFlowData = {
          nodes: flow.nodes?.map((node: any) => {
            // Mapear tipo do nó
            let nodeType = 'message'
            if (node.isStart) nodeType = 'start'
            else if (node.isEnd) nodeType = 'end'
            else if (node.nodeType === 'OPTION') nodeType = 'choice'
            else if (node.nodeType === 'MESSAGE') nodeType = 'message'
            
            // Logs removidos para limpeza
            
            return {
              id: node.id,
              type: nodeType,
              position: node.position || { x: 100, y: 100 },
              data: {
                label: node.title || 'Nó',
                message: node.message || '',
                options: node.options?.map((opt: any) => ({
                  text: opt.text,
                  label: opt.text,
                  id: opt.id,
                  actionType: opt.actionType || 'message',
                  targetNodeId: opt.targetNodeId || null,
                  transferMessage: opt.transferMessage || null,
                  waitTime: opt.waitTime || null
                })) || []
              }
            }
          }) || [],
          edges: flow.nodes?.flatMap((node: any) => {
            const nodeConnections = []
            
            console.log('🔍 Node outgoingConnections:', node.id, node.outgoingConnections?.length || 0)
            
            // Conexões diretas do nó (apenas para nós que não são de opções)
            if (node.outgoingConnections && node.nodeType !== 'OPTION' && !node.options) {
              console.log('🔗 Processing outgoingConnections for node:', node.id, node.outgoingConnections)
              nodeConnections.push(...node.outgoingConnections.map((conn: any) => ({
                id: conn.id,
                source: conn.sourceNodeId,
                target: conn.targetNodeId,
                sourceHandle: 'bottom', // Handle principal
                targetHandle: 'top'
              })))
            }
            
            // Conexões específicas das opções
            if (node.options && node.options.length > 0) {
              node.options.forEach((option: any, index: number) => {
                if (option.actionType === 'message' && option.targetNodeId) {
                  // Criar conexão direta baseada no targetNodeId da opção
                  const connection = {
                    id: `option-conn-${option.id}`,
                    source: node.id,
                    target: option.targetNodeId,
                    sourceHandle: `option-${index}`, // Handle da opção específica
                    targetHandle: 'top',
                    type: 'option', // Usar tipo personalizado
                    style: { stroke: '#f59e0b', strokeWidth: 3 }, // Cor laranja para opções, mais espessa
                    animated: true
                  }
                  nodeConnections.push(connection)
                }
              })
            }
            
            return nodeConnections
          }) || []
        }
        
        setFlowData(reactFlowData)
        console.log('📊 Flow data loaded:', reactFlowData)
        console.log('🔍 Raw flow data from backend:', flow)
      } else {
        // Se não há flow, criar um vazio
        setFlowData(null)
        console.log('📊 No flow data found, starting fresh')
      }
      
      setShowFlowEditor(true)
    } catch (error) {
      console.error('❌ Error loading flow data:', error)
      // Em caso de erro, abrir editor vazio
      setFlowData(null)
      setShowFlowEditor(true)
    }
  }

  const handleFlowEditorClose = () => {
    setShowFlowEditor(false)
    setSelectedChatbot(null)
    setFlowData(null)
  }

  const handleFlowEditorSave = async (flow: any) => {
    if (!selectedChatbot) {
      console.error('❌ Nenhum chatbot selecionado para salvar o fluxo')
      return
    }

    try {
      console.log('💾 Salvando fluxo no banco para chatbot:', selectedChatbot.id)
      
      // Primeiro, buscar ou criar o flow
      let flowResponse
      try {
        // Tentar buscar flows existentes
        const existingFlows = await api.get(`/flows?chatbotId=${selectedChatbot.id}`)
        const flows = existingFlows.data
        
        if (flows && flows.length > 0) {
          // Usar o flow existente (ou o padrão) - NÃO criar novo
          const existingFlow = flows.find((f: any) => f.isDefault) || flows[0]
          flowResponse = { data: existingFlow }
          console.log('📋 Usando flow existente:', existingFlow.id, '- NÃO criando novo flow')
        } else {
          // Criar novo flow
          flowResponse = await api.post('/flows', {
            name: `Flow do ${selectedChatbot.name}`,
            description: 'Fluxo criado pelo editor visual',
            chatbotId: selectedChatbot.id,
            active: true,
            isDefault: true
          })
          console.log('✅ Novo flow criado:', flowResponse.data.id)
        }
      } catch (error) {
        // Se falhar ao buscar, criar novo
        flowResponse = await api.post('/flows', {
          name: `Flow do ${selectedChatbot.name}`,
          description: 'Fluxo criado pelo editor visual',
          chatbotId: selectedChatbot.id,
          active: true,
          isDefault: true
        })
        console.log('✅ Novo flow criado (fallback):', flowResponse.data.id)
      }

      const currentFlowId = flowResponse.data.id
      console.log('🆔 Flow ID obtido:', currentFlowId)
      
      // Definir flowId no estado para uso no FlowEditor
      console.log('🆔 Definindo flowId no estado:', currentFlowId)
      setFlowId(currentFlowId)

      // Verificar se o flow foi criado corretamente
      if (!currentFlowId) {
        throw new Error('Flow ID não foi obtido corretamente')
      }

      // ESTRATÉGIA INTELIGENTE: Verificar se existe e usar PUT/POST adequadamente
      console.log('🧠 Usando estratégia inteligente: PUT para editar, POST para criar...')
      
      // Buscar nós existentes
      let existingNodes: any[] = []
      try {
        const existingNodesResponse = await api.get(`/flows/${currentFlowId}/nodes`)
        existingNodes = existingNodesResponse.data
        console.log('📋 Nós existentes encontrados:', existingNodes.length)
      } catch (error) {
        console.log('ℹ️ Nenhum nó existente encontrado ou erro ao buscar:', error.message)
      }

      // Mapear IDs do ReactFlow para IDs do banco
      const nodeIdMap = new Map<string, string>()
      
        // Processar cada nó do ReactFlow
        for (const node of flow.nodes) {
          
          // Verificar se já existe um nó com este ID no banco
          const existingNode = existingNodes.find(n => n.id === node.id)
          
          const nodeData = {
            title: node.data.label || 'Nó',
            message: node.data.message || node.data.label || 'Mensagem',
            nodeType: getNodeType(node.type),
            position: node.position,
            isStart: node.type === 'start',
            isEnd: node.type === 'end'
          }

          if (existingNode) {
            // Atualizar nó existente usando PUT
            console.log('🔄 Atualizando nó existente:', node.id, 'com dados:', nodeData)
            await api.put(`/flows/${currentFlowId}/nodes/${node.id}`, nodeData)
            nodeIdMap.set(node.id, node.id)
            console.log('✅ Nó atualizado com sucesso:', node.id, node.type)
          } else {
            // Criar novo nó usando POST
            console.log('➕ Criando novo nó:', node.id, 'com dados:', nodeData)
            await api.post(`/flows/${currentFlowId}/nodes`, {
              id: node.id, // Especificar ID para o novo nó
              ...nodeData
            })
            nodeIdMap.set(node.id, node.id)
            console.log('✅ Nó criado com sucesso:', node.id, node.type)
          }

          // Processar opções para nós do tipo 'choice'
          if (node.type === 'choice' && node.data.options && node.data.options.length > 0) {
            console.log('🔧 Processando opções para nó de escolha:', node.id)
            
            // Buscar opções existentes do nó
            let existingOptions: any[] = []
            try {
              const existingOptionsResponse = await api.get(`/flows/nodes/${node.id}/options`)
              existingOptions = existingOptionsResponse.data
              console.log('📋 Opções existentes encontradas:', existingOptions.length)
            } catch (error: any) {
              console.log('ℹ️ Nenhuma opção existente encontrada ou erro ao buscar:', error.message)
            }

            // Limpar opções existentes
            for (const existingOption of existingOptions) {
              try {
                await api.delete(`/flows/nodes/${node.id}/options/${existingOption.id}`)
                console.log('🗑️ Opção removida:', existingOption.id)
              } catch (deleteError: any) {
                console.warn('⚠️ Erro ao remover opção:', existingOption.id, deleteError.message)
              }
            }

            // Criar novas opções
            for (let i = 0; i < node.data.options.length; i++) {
              const option = node.data.options[i]
              if (option.text || option.label) {
                try {
                  const optionResponse = await api.post(`/flows/nodes/${node.id}/options`, {
                    text: option.text || option.label || `Opção ${i + 1}`,
                    order: i,
                    actionType: option.actionType || 'message',
                    targetNodeId: option.targetNodeId || null,
                    transferMessage: option.transferMessage || null,
                    waitTime: option.waitTime || null
                  })
                  
                  const createdOption = optionResponse.data
                  console.log('✅ Opção criada:', createdOption.id, option.text || option.label, 'com ação:', option.actionType)
                  
                  // Se a opção tem um targetNodeId (nó de destino), criar conexão específica
                  if (option.actionType === 'message' && option.targetNodeId) {
                    try {
                      const connectionResponse = await api.post(`/flows/${currentFlowId}/connections`, {
                        sourceNodeId: node.id,
                        targetNodeId: option.targetNodeId,
                        optionId: createdOption.id, // VINCULAR A OPÇÃO À CONEXÃO
                        condition: `option_${i + 1}` // Condição baseada na opção
                      })
                      console.log('🔗 Conexão específica criada para opção:', createdOption.id, '->', option.targetNodeId)
                    } catch (connectionError: any) {
                      console.warn('⚠️ Erro ao criar conexão para opção:', createdOption.id, connectionError.message)
                    }
                  }
                } catch (error: any) {
                  console.warn('⚠️ Erro ao criar opção:', option.text || option.label, error.message)
                }
              }
            }
          }
        }

      // Remover nós que não existem mais no ReactFlow
      const reactFlowNodeIds = new Set(flow.nodes.map(n => n.id))
      for (const existingNode of existingNodes) {
        if (!reactFlowNodeIds.has(existingNode.id)) {
          try {
            await api.delete(`/flows/${currentFlowId}/nodes/${existingNode.id}`)
            console.log('🗑️ Nó removido:', existingNode.id)
          } catch (deleteError) {
            console.warn('⚠️ Erro ao remover nó:', existingNode.id, deleteError)
          }
        }
      }

      // Buscar conexões existentes
      let existingConnections: any[] = []
      try {
        const existingConnectionsResponse = await api.get(`/flows/${currentFlowId}/connections`)
        existingConnections = existingConnectionsResponse.data
        console.log('📋 Conexões existentes encontradas:', existingConnections.length)
      } catch (error) {
        console.log('ℹ️ Nenhuma conexão existente encontrada')
      }

      // Processar conexões do ReactFlow
      console.log('🔗 Processando conexões do ReactFlow:', flow.edges.length, 'edges')
      for (const edge of flow.edges) {
        console.log('🔗 Processando edge:', { source: edge.source, target: edge.target })
        const sourceId = nodeIdMap.get(edge.source)
        const targetId = nodeIdMap.get(edge.target)
        
        console.log('🔗 IDs mapeados:', { sourceId, targetId })
        
        if (sourceId && targetId) {
          // Verificar se ambos os nós existem no banco
          const sourceNodeExists = existingNodes.find(n => n.id === sourceId)
          const targetNodeExists = existingNodes.find(n => n.id === targetId)
          
          if (sourceNodeExists && targetNodeExists) {
            // Verificar se conexão já existe
            const existingConnection = existingConnections.find(c => 
              c.sourceNodeId === sourceId && c.targetNodeId === targetId
            )
            
            if (!existingConnection) {
              try {
                console.log('🔗 Criando conexão:', { sourceId, targetId })
                const response = await api.post(`/flows/${currentFlowId}/connections`, {
                  sourceNodeId: sourceId,
                  targetNodeId: targetId,
                  condition: null
                })
                console.log('✅ Conexão criada com sucesso:', response.data)
              } catch (error) {
                console.error('❌ Erro ao criar conexão:', error)
              }
            } else {
              console.log('ℹ️ Conexão já existe:', sourceId, '->', targetId)
            }
          } else {
            console.warn('⚠️ Conexão ignorada - nós não existem no banco:', { 
              sourceExists: !!sourceNodeExists, 
              targetExists: !!targetNodeExists 
            })
          }
        } else {
          console.warn('⚠️ Conexão ignorada - IDs não encontrados:', edge.source, '->', edge.target)
        }
      }

      // Nota: Não removemos conexões antigas automaticamente para evitar problemas
      // As conexões são gerenciadas através das opções dos nós (targetNodeId)
      console.log('ℹ️ Conexões gerenciadas através das opções dos nós (targetNodeId)')

      console.log('✅ Fluxo salvo com sucesso no banco!')
      setFlowData(flow)
      setShowFlowEditor(false)
      
      // Atualizar lista de chatbots
      await fetchChatbots()
      
    } catch (error) {
      console.error('❌ Erro ao salvar fluxo no banco:', error)
      alert('Erro ao salvar fluxo. Tente novamente.')
    }
  }

  const getNodeType = (nodeType: string) => {
    switch (nodeType) {
      case 'message':
        return 'MESSAGE'
      case 'choice':
        return 'OPTION'
      case 'start':
      case 'action':
      case 'end':
        return 'MESSAGE'
      default:
        return 'MESSAGE'
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este chatbot?')) {
      try {
        await api.delete(`/chatbots/${id}`)
        setChatbots(chatbots.filter(chatbot => chatbot.id !== id))
      } catch (error) {
        console.error('Erro ao excluir chatbot:', error)
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/chatbots/${id}/toggle-status`)
      setChatbots(chatbots.map(chatbot => 
        chatbot.id === id 
          ? { ...chatbot, active: !currentStatus }
          : chatbot
      ))
    } catch (error) {
      console.error('Erro ao alternar status do chatbot:', error)
    }
  }

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-500 hover:bg-green-600">Ativo</Badge>
    ) : (
      <Badge variant="secondary">Inativo</Badge>
    )
  }

  const activeCount = chatbots.filter(c => c.active).length
  const inactiveCount = chatbots.filter(c => !c.active).length

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando chatbots...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Chatbots</h1>
            <p className="text-gray-600">Visão geral e gerenciamento de todos os chatbots do sistema</p>
          </div>
          <div className="flex space-x-2">
            <Button onClick={fetchChatbots} variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Chatbot
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Chatbots</CardTitle>
              <Bot className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{chatbots.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Ativos</CardTitle>
              <Play className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Inativos</CardTitle>
              <Pause className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inactiveCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardHeader>
            <CardTitle>Buscar Chatbots</CardTitle>
            <CardDescription>
              Encontre chatbots por nome, descrição ou empresa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar chatbots..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Chatbots List */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredChatbots.map((chatbot) => (
            <Card key={chatbot.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-blue-500" />
                    <CardTitle className="text-lg">{chatbot.name}</CardTitle>
                  </div>
                  {getStatusBadge(chatbot.active)}
                </div>
                <CardDescription>
                  {chatbot.description || 'Sem descrição'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500 mb-4">
                  <p>Empresa: {chatbot.company?.name || 'N/A'}</p>
                  <p>Criado em: {new Date(chatbot.createdAt).toLocaleDateString('pt-BR')}</p>
                  <p>Atualizado em: {new Date(chatbot.updatedAt).toLocaleDateString('pt-BR')}</p>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-4 border-t">
                  <Button
                    onClick={() => handleToggleStatus(chatbot.id, chatbot.active)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    {chatbot.active ? (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Ativar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(chatbot)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenFlowEditor(chatbot)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    🧠 Fluxo
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(chatbot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredChatbots.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm ? 'Nenhum chatbot encontrado' : 'Nenhum chatbot cadastrado'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Tente ajustar os termos de busca.'
                  : 'Comece criando o primeiro chatbot do sistema.'
                }
              </p>
              {!searchTerm && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Chatbot
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Modal */}
        <ChatbotModal
          chatbot={selectedChatbot}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />

        {/* Editor de Fluxo Visual */}
        {showFlowEditor && (
          <FlowEditor
            initialFlow={flowData}
            flowId={flowId}
            flowData={flowData}
            onSave={handleFlowEditorSave}
            onClose={handleFlowEditorClose}
          />
        )}
      </div>
    </RoleGuard>
  )
}
