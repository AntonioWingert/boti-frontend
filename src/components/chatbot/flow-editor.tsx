'use client'

import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  BackgroundVariant,
  NodeTypes,
  Handle,
  Position,
  MiniMap
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MobileFlowControls } from './mobile-flow-controls'
import { MobileNodeEditor } from './mobile-node-editor'
import { useMobileDetection } from '@/hooks/use-mobile-detection'
import { api } from '@/lib/api'
import { Plus, MessageSquare, ArrowRight, Settings, Save, Play, Square, Edit, X } from 'lucide-react'

// Nó de Início
function StartNode({ data }: { data: any }) {
  const messageText = data.message || 'Clique para editar a mensagem de início'
  
  return (
    <div 
      className="px-3 py-2 shadow-md rounded-md bg-white border-2 border-green-500 w-40 relative cursor-pointer hover:shadow-lg transition-all"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-green-500 border-2 border-white"
        style={{ background: '#10b981', border: '3px solid white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      />
      <div className="flex items-start space-x-2">
        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Play className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-900 mb-1">Início</div>
          <div className="text-xs text-gray-600 leading-tight">
            {messageText.length > 30 ? `${messageText.substring(0, 30)}...` : messageText}
          </div>
        </div>
      </div>
    </div>
  )
}

// Nó de Mensagem
function MessageNode({ data }: { data: any }) {
  const messageText = data.message || 'Clique para editar a mensagem'
  
  return (
    <div 
      className="px-3 py-2 shadow-md rounded-md bg-white border-2 border-blue-500 w-44 relative cursor-pointer hover:shadow-lg transition-all"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ background: '#3b82f6', border: '3px solid white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-blue-500 border-2 border-white"
        style={{ background: '#3b82f6', border: '3px solid white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      />
      <div className="flex items-start space-x-2">
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <MessageSquare className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-900 mb-1">Mensagem</div>
          <div className="text-xs text-gray-600 leading-tight">
            {messageText.length > 35 ? `${messageText.substring(0, 35)}...` : messageText}
          </div>
        </div>
      </div>
    </div>
  )
}

// Nó de Escolha
function ChoiceNode({ data }: { data: any }) {
  const choiceText = data.message || 'Clique para editar a pergunta'
  const optionsCount = data.options?.length || 0
  
  // Código de opções individuais removido - apenas contador
  
  return (
    <div 
      className="px-3 py-2 shadow-md rounded-md bg-white border-2 border-purple-500 w-40 relative cursor-pointer hover:shadow-lg transition-all"
      onClick={(e) => {
        e.stopPropagation()
      }}
      style={{ minHeight: '80px' }}
    >
      {/* Handle de entrada (top) */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-purple-500 border-2 border-white"
        style={{ background: '#8b5cf6', border: '3px solid white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      />
      
       {/* Handles específicos para cada opção */}
       {data.options && data.options.map((opt: any, index: number) => {
         const isConnected = opt.targetNodeId && opt.actionType === 'message'
         return (
           <Handle
             key={`option-${index}`}
             type="source"
             position={Position.Right}
             id={`option-${index}`}
             className={`w-4 h-4 border-2 border-white ${isConnected ? 'bg-green-500' : 'bg-orange-500'}`}
             style={{ 
               top: `${25 + (index * 28)}px`,
               right: '-8px',
               background: isConnected ? '#10b981' : '#f59e0b', 
               border: '3px solid white', 
               boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
               width: '16px',
               height: '16px',
               zIndex: 10
             }}
           />
         )
       })}
      
      {/* Handle de saída principal */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-purple-500 border-2 border-white"
        style={{ background: '#8b5cf6', border: '3px solid white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      />
      
      <div className="flex items-start space-x-2">
        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Settings className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-900 mb-1">Escolha</div>
          <div className="text-xs text-gray-600 leading-tight">
            {choiceText.length > 25 ? `${choiceText.substring(0, 25)}...` : choiceText}
          </div>
           <div className="text-xs text-purple-600 font-medium mt-1">
             <span>{optionsCount} {optionsCount !== 1 ? 'opções' : 'opção'}</span>
           </div>
           {/* Opções individuais removidas - apenas contador */}
        </div>
      </div>
    </div>
  )
}

// Nó de Ação
function ActionNode({ data }: { data: any }) {
  const actionText = data.action || 'Clique para editar a ação'
  const actionDetails = data.duration ? ` (${data.duration}ms)` : ''
  const fullText = `${actionText}${actionDetails}`
  
  return (
    <div 
      className="px-3 py-2 shadow-md rounded-md bg-white border-2 border-orange-500 w-40 relative cursor-pointer hover:shadow-lg transition-all"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-orange-500 border-2 border-white"
        style={{ background: '#f59e0b', border: '3px solid white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        className="w-3 h-3 bg-orange-500 border-2 border-white"
        style={{ background: '#f59e0b', border: '3px solid white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      />
      <div className="flex items-start space-x-2">
        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <ArrowRight className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-900 mb-1">Ação</div>
          <div className="text-xs text-gray-600 leading-tight">
            {actionText.length > 30 ? `${actionText.substring(0, 30)}...` : actionText}
          </div>
          {actionDetails && (
            <div className="text-xs text-orange-600 font-medium mt-1">
              {actionDetails}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Nó de Fim
function EndNode({ data }: { data: any }) {
  const endText = data.message || 'Clique para editar a mensagem final'
  
  return (
    <div 
      className="px-3 py-2 shadow-md rounded-md bg-white border-2 border-red-500 w-40 relative cursor-pointer hover:shadow-lg transition-all"
      onClick={(e) => {
        e.stopPropagation()
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        className="w-3 h-3 bg-red-500 border-2 border-white"
        style={{ background: '#ef4444', border: '3px solid white', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}
      />
      <div className="flex items-start space-x-2">
        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Square className="h-3 w-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold text-gray-900 mb-1">Fim</div>
          <div className="text-xs text-gray-600 leading-tight">
            {endText.length > 30 ? `${endText.substring(0, 30)}...` : endText}
          </div>
        </div>
      </div>
    </div>
  )
}

// Tipos de nós personalizados - serão definidos dentro do componente

interface FlowEditorProps {
  initialFlow?: any
  flowId?: string
  flowData?: any
  onSave: (flow: any) => void
  onClose: () => void
}

export function FlowEditor({ initialFlow, flowId, flowData, onSave, onClose }: FlowEditorProps) {
  // Configurações de grid para alinhamento
  const snapGrid = [20, 20]
  const defaultViewport = { x: -200, y: -100, zoom: 0.8 }
  const { isMobile } = useMobileDetection()

  // Debug: monitorar mudanças no flowId
  useEffect(() => {
    // FlowId changed
  }, [flowId])

  // Carregar dados do fluxo quando o flowId mudar
  useEffect(() => {
    if (flowId && flowData) {
      // Converter dados do backend para formato ReactFlow
      const reactFlowNodes = flowData.nodes.map((node: any) => {
        // Mapear tipos corretamente - usar dados diretos do node
        let nodeType = 'message' // padrão
        
        // Usar o tipo já mapeado no page.tsx ou mapear novamente
        if (node.type) {
          nodeType = node.type
        } else if (node.data?.nodeType === 'MESSAGE') {
          nodeType = node.data?.isStart ? 'start' : 
                     node.data?.isEnd ? 'end' : 'message'
        } else if (node.data?.nodeType === 'OPTION') {
          nodeType = 'choice'
        }

        return {
          id: node.id, // Usar ID real do banco
          type: nodeType,
          position: node.position,
          data: {
            label: node.data?.label || node.title,
            message: node.data?.message || node.message,
            realId: node.id, // Armazenar ID real
            options: node.data?.options || node.options || [],
            ...(node.data?.nodeType === 'OPTION' && { 
              options: (node.data?.options || node.options)?.map((opt: any) => ({
                id: opt.id,
                text: opt.text,
                targetNodeId: opt.targetNodeId
              })) || []
            })
          },
          // Posicionamento de handles baseado no tipo
          ...(nodeType === 'start' && { 
            sourcePosition: 'bottom'
          }),
          ...(nodeType === 'message' && { 
            sourcePosition: 'bottom',
            targetPosition: 'top'
          }),
          ...(nodeType === 'choice' && { 
            sourcePosition: 'bottom',
            targetPosition: 'top'
          }),
          ...(nodeType === 'end' && { 
            targetPosition: 'top'
          })
        }
      })

      // Converter conexões para edges - usar edges já processados do page.tsx
      const reactFlowEdges = flowData.edges || []
      
      setNodes(reactFlowNodes)
      setEdges(reactFlowEdges)
    }
  }, [flowId, flowData])
  
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Salvar posições automaticamente quando nós são movidos
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes)
    
    // Verificar se há mudanças de posição
    const positionChanges = changes.filter(change => 
      change.type === 'position' && change.position
    )
    
    if (positionChanges.length > 0) {
      // Salvar posições no banco
      positionChanges.forEach(change => {
        if (change.id && change.position) {
          // Buscar o nó para obter o ID real
          const node = nodes.find((n: any) => n.id === change.id)
          if (node?.data?.realId && flowId) {
            // Salvar posição no banco usando ID real
            api.put(`/flows/${flowId}/nodes/${node.data.realId}`, {
              position: change.position
            }).catch(error => {
              console.error('❌ Erro ao salvar posição:', error)
            })
          }
        }
      })
    }
  }, [onNodesChange, nodes, flowId])
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [showNodeEditor, setShowNodeEditor] = useState(false)
  const [isPanMode, setIsPanMode] = useState(false)
  const [currentZoom, setCurrentZoom] = useState(1)
  // Estados de opções removidos - não mais editáveis fora do modal

  // Função removida - opções não são mais editáveis fora do modal

  // OptionEdge removido - usando edge padrão com labels

  // Tipos de nós personalizados
  const nodeTypes: NodeTypes = useMemo(() => ({
    start: StartNode,
    message: MessageNode,
    choice: ChoiceNode,
    action: ActionNode,
    end: EndNode,
  }), [])

  // EdgeTypes removido - usando edges padrão com labels
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null)

  // Função para calcular o centro da viewport atual
  const getViewportCenter = useCallback(() => {
    // Usar valores fixos que sabemos que estão na área visível
    // Baseado no viewport padrão (0, 0, zoom: 1)
    return { x: 400, y: 300 }
  }, [])


  // Função para salvar conexão automaticamente
  const saveConnectionToDatabase = async (sourceId: string, targetId: string, retryCount = 0) => {
    if (!flowId) {
      if (retryCount < 5) {
        setTimeout(() => {
          saveConnectionToDatabase(sourceId, targetId, retryCount + 1)
        }, 1000)
        return
      } else {
        return
      }
    }

    try {
      // Buscar IDs reais dos nós no banco
      const sourceNode = nodes.find((n: any) => n.id === sourceId)
      const targetNode = nodes.find((n: any) => n.id === targetId)
      
      if (!sourceNode || !targetNode) {
        return
      }

      // Usar IDs reais do banco se disponíveis
      const realSourceId = sourceNode.data?.realId || sourceId
      const realTargetId = targetNode.data?.realId || targetId

      const response = await api.post(`/flows/${flowId}/connections`, {
        sourceNodeId: realSourceId,
        targetNodeId: realTargetId,
        condition: null
      })
    } catch (error) {
      console.error('❌ Erro ao salvar conexão automaticamente:', error)
    }
  }

  // Conectar nós
  const onConnect = useCallback(
    (params: Connection) => {
      // Verificar se é uma conexão de opção (handle específico)
      if (params.sourceHandle && params.sourceHandle.startsWith('option-')) {
        const optionIndex = parseInt(params.sourceHandle.replace('option-', ''))
        
        // Atualizar o nó de origem para incluir o targetNodeId na opção
        setNodes((nds: Node[]) => 
          nds.map((node: Node) => {
            if (node.id === params.source && node.data.options) {
              const newOptions = [...node.data.options]
              if (newOptions[optionIndex]) {
                newOptions[optionIndex] = {
                  ...newOptions[optionIndex],
                  actionType: 'message',
                  targetNodeId: params.target
                }
              }
              return { ...node, data: { ...node.data, options: newOptions } }
            }
            return node
          })
        )
        
        // Criar edge com estilo especial para opções
        setEdges((eds: Edge[]) => addEdge({ 
          ...params, 
          animated: true,
          style: { stroke: '#f59e0b', strokeWidth: 3 },
          label: `Opção ${optionIndex + 1}`,
          labelStyle: { 
            fill: '#f59e0b', 
            fontWeight: 'bold',
            fontSize: '12px'
          },
          labelBgStyle: {
            fill: 'white',
            fillOpacity: 0.8,
            stroke: '#f59e0b',
            strokeWidth: 1,
            rx: 4,
            ry: 4
          },
          labelBgPadding: [4, 8],
          labelBgBorderRadius: 4
        }, eds))

        // Salvar conexão automaticamente no banco (nós já existem)
        saveConnectionToDatabase(params.source, params.target)
      } else {
        // Conexão normal entre nós
        setEdges((eds: Edge[]) => addEdge({ 
          ...params, 
          animated: true,
          style: { stroke: '#4b5563', strokeWidth: 2 }
        }, eds))

        // Salvar conexão automaticamente no banco (nós já existem)
        saveConnectionToDatabase(params.source, params.target)
      }
    },
    [setEdges, setNodes]
  )

  // Memoizar callbacks para evitar re-renders desnecessários
  const memoizedOnNodesChange = useMemo(() => (changes: any) => {
    handleNodesChange(changes)
  }, [handleNodesChange])

  const memoizedOnEdgesChange = useMemo(() => (changes: any) => {
    onEdgesChange(changes)
  }, [onEdgesChange])

  const memoizedOnConnect = useMemo(() => (params: Connection) => {
    onConnect(params)
  }, [onConnect])

  // Adicionar estilos CSS necessários
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .react-flow {
        background: #f9fafb;
        width: 100%;
        height: 100%;
      }
      .react-flow__node {
        font-family: inherit;
        font-size: 12px;
        font-weight: 500;
        cursor: grab;
        pointer-events: all;
      }
      .react-flow__node:active {
        cursor: grabbing;
      }
      .react-flow__node:hover {
        cursor: grab;
      }
      .react-flow__node-default {
        background: white;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
      }
      .react-flow__node-default:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transform: translateY(-1px);
      }
      .react-flow__node-default.selected {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .react-flow__edge-path {
        stroke: #4b5563;
        stroke-width: 3;
        fill: none;
      }
      .react-flow__edge.selected .react-flow__edge-path {
        stroke: #3b82f6;
        stroke-width: 4;
      }
      .react-flow__edge:hover .react-flow__edge-path {
        stroke: #1f2937;
        stroke-width: 4;
      }
      .react-flow__edge-text {
        font-size: 12px;
        font-weight: 500;
        fill: #374151;
      }
      .react-flow__edge-textbg {
        fill: white;
        stroke: white;
        stroke-width: 3;
      }
      .react-flow__handle {
        width: 12px;
        height: 12px;
        background: #4b5563;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        transition: all 0.2s ease;
        pointer-events: all;
        cursor: crosshair;
      }
      .react-flow__handle:hover {
        background: #374151;
      }
      .react-flow__handle-connecting {
        background: #ef4444;
        border-color: #fff;
        animation: pulse 1s infinite;
      }
      .react-flow__handle-valid {
        background: #10b981;
        border-color: #fff;
        animation: pulse 0.5s infinite;
      }
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
      .react-flow__controls {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
      }
      .react-flow__attribution {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 4px;
        padding: 2px 6px;
        font-size: 10px;
        color: #6b7280;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Adicionar novo nó
  const addNode = useCallback((type: string) => {
    const existingNodes = nodes.length
    
    // Calcular o centro da viewport atual
    const viewportCenter = getViewportCenter()
    
    // Adicionar pequeno offset para evitar sobreposição total
    const offsetX = (existingNodes % 2) * 40 - 20
    const offsetY = Math.floor(existingNodes / 2) * 40
    
    const x = viewportCenter.x + offsetX
    const y = viewportCenter.y + offsetY
    
    const newNode: Node = {
      id: `${type}-${Date.now()}`,
      type,
      position: { 
        x: Math.round(x / 20) * 20, // Snap to grid
        y: Math.round(y / 20) * 20
      },
      data: {
        label: `Novo ${type}`,
        ...(type === 'start' && { message: 'Olá! Como posso ajudar?' }),
        ...(type === 'message' && { message: 'Digite sua mensagem aqui...' }),
        ...(type === 'choice' && { message: 'Escolha uma opção:', options: [] }),
        ...(type === 'action' && { action: 'wait', duration: 1000 }),
        ...(type === 'end' && { message: 'Obrigado! Até logo!' }),
      },
      // Posicionamento de handles baseado no tipo
      ...(type === 'start' && { sourcePosition: 'bottom' }),
      ...(type === 'message' && { 
        sourcePosition: 'bottom',
        targetPosition: 'top'
      }),
      ...(type === 'choice' && { 
        sourcePosition: 'bottom',
        targetPosition: 'top'
      }),
      ...(type === 'action' && { 
        sourcePosition: 'bottom',
        targetPosition: 'top'
      }),
      ...(type === 'end' && { targetPosition: 'top' }),
    }

    setNodes((nds: Node[]) => [...nds, newNode])
    
    // Log para debug
    console.log('🎯 Novo nó criado em:', { x, y, viewportCenter })
    
    // Salvar nó automaticamente no banco
    const saveNewNodeToDatabase = async (retryCount = 0) => {
      console.log(`🔍 Tentativa ${retryCount + 1}: Verificando flowId para salvar novo nó:`, { flowId, nodeId: newNode.id, type })
      
      if (!flowId) {
        if (retryCount < 10) {
          console.warn(`⚠️ FlowId não disponível para salvar novo nó - tentativa ${retryCount + 1}/10`)
          // Tentar novamente em 1 segundo
          setTimeout(() => {
            saveNewNodeToDatabase(retryCount + 1)
          }, 1000)
          return
        } else {
          console.error('❌ FlowId não disponível após 10 tentativas - nó não será salvo automaticamente')
          return
        }
      }

      try {
        console.log('💾 Salvando novo nó automaticamente:', { nodeId: newNode.id, type, flowId })
        
        // Preparar dados do nó para o banco
        const nodeData = {
          title: newNode.data.label,
          message: newNode.data.message || newNode.data.label,
          nodeType: type === 'start' ? 'MESSAGE' : 
                   type === 'message' ? 'MESSAGE' :
                   type === 'choice' ? 'OPTION' :
                   type === 'action' ? 'ACTION' :
                   type === 'end' ? 'MESSAGE' : 'MESSAGE',
          position: newNode.position,
          isStart: type === 'start',
          isEnd: type === 'end',
          active: true
        }

        const response = await api.post(`/flows/${flowId}/nodes`, {
          id: newNode.id,
          ...nodeData
        })
        
        console.log('✅ Novo nó salvo automaticamente:', response.data)
        
        // Armazenar ID real do banco no nó
        setNodes((nds: Node[]) => 
          nds.map((node: Node) => 
            node.id === newNode.id 
              ? { ...node, data: { ...node.data, realId: response.data.id } }
              : node
          )
        )
        
        // Se é um nó de escolha, criar opções padrão
        if (type === 'choice' && newNode.data.options && newNode.data.options.length > 0) {
          console.log('📋 Criando opções para nó de escolha:', newNode.data.options)
          
          for (const option of newNode.data.options) {
            try {
              const optionResponse = await api.post(`/flows/nodes/${response.data.id}/options`, {
                text: option.text || option.label || '',
                targetNodeId: option.targetNodeId || null
              })
              console.log('✅ Opção criada automaticamente:', optionResponse.data)
            } catch (error) {
              console.error('❌ Erro ao criar opção automaticamente:', error)
            }
          }
        }
      } catch (error) {
        console.error('❌ Erro ao salvar novo nó automaticamente:', error)
      }
    }
    
    saveNewNodeToDatabase()
  }, [setNodes, nodes.length, getViewportCenter, flowId])

  // Selecionar e editar nó
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation()
    setSelectedNode(node)
    setShowNodeEditor(true)
  }, [])

  // Editar nó (duplo clique)
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    event.stopPropagation()
    setSelectedNode(node)
    setShowNodeEditor(true)
  }, [])

  // Salvar fluxo
  const handleSave = useCallback(() => {
    const flow = {
      nodes,
      edges,
      viewport: { x: 0, y: 0, zoom: 1 },
    }
    onSave(flow)
  }, [nodes, edges, onSave])

  // Atualizar nó selecionado
  const updateNode = useCallback(async (updatedNode: Node) => {
    try {
      console.log('💾 Salvando nó automaticamente no backend:', updatedNode.id)
      
      // Salvar dados do nó no backend
      if (flowId && updatedNode.data?.realId) {
        const nodeData = {
          title: updatedNode.data.label,
          message: updatedNode.data.message,
          nodeType: updatedNode.type === 'start' ? 'MESSAGE' :
                   updatedNode.type === 'end' ? 'MESSAGE' :
                   updatedNode.type === 'choice' ? 'OPTION' : 'MESSAGE',
          isStart: updatedNode.type === 'start',
          isEnd: updatedNode.type === 'end',
          position: updatedNode.position
        }
        
        console.log('📤 Enviando dados do nó:', nodeData)
        await api.put(`/flows/${flowId}/nodes/${updatedNode.data.realId}`, nodeData)
        console.log('✅ Nó salvo no backend com sucesso')
        
        // Salvar opções se existirem
        if (updatedNode.data.options && updatedNode.data.options.length > 0) {
          console.log('📋 Salvando opções do nó:', updatedNode.data.options.length)
          
          for (const option of updatedNode.data.options) {
            try {
              if (option.id && option.id.startsWith('option_')) {
                // Criar nova opção
                console.log('➕ Criando nova opção:', option.text)
                const response = await api.post(`/flows/nodes/${updatedNode.data.realId}/options`, {
                  text: option.text,
                  targetNodeId: option.targetNodeId || null
                })
                console.log('✅ Opção criada:', response.data)
              } else if (option.id) {
                // Atualizar opção existente
                console.log('🔄 Atualizando opção existente:', option.id, option.text)
                await api.put(`/flows/options/${option.id}`, {
                  text: option.text,
                  targetNodeId: option.targetNodeId || null
                })
                console.log('✅ Opção atualizada:', option.id)
              }
            } catch (error) {
              console.error('❌ Erro ao salvar opção:', error)
            }
          }
        }
      }
      
      // Atualizar estado local
      setNodes((nds: Node[]) => {
        const newNodes = nds.map((node: Node) => (node.id === updatedNode.id ? updatedNode : node))
        return newNodes
      })
      setSelectedNode(null)
      setShowNodeEditor(false)
      
    } catch (error) {
      console.error('❌ Erro ao salvar nó automaticamente:', error)
      // Mesmo com erro, atualizar o estado local
      setNodes((nds: Node[]) => {
        const newNodes = nds.map((node: Node) => (node.id === updatedNode.id ? updatedNode : node))
        return newNodes
      })
      setSelectedNode(null)
      setShowNodeEditor(false)
    }
  }, [setNodes, flowId])

  // Excluir nó
  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds: Node[]) => nds.filter((node: Node) => node.id !== nodeId))
    setEdges((eds: Edge[]) => eds.filter((edge: Edge) => 
      edge.source !== nodeId && edge.target !== nodeId
    ))
    setSelectedNode(null)
  }, [setNodes, setEdges])

  // Funções mobile-friendly
  const handleZoomIn = useCallback(() => {
    setCurrentZoom(prev => Math.min(prev + 0.1, 2))
  }, [])

  const handleZoomOut = useCallback(() => {
    setCurrentZoom(prev => Math.max(prev - 0.1, 0.1))
  }, [])

  const handleResetView = useCallback(() => {
    setCurrentZoom(1)
  }, [])

  const handleFitView = useCallback(() => {
    // Implementar fit view
  }, [])

  const handleTogglePan = useCallback(() => {
    setIsPanMode(prev => !prev)
  }, [])

  const handleAddNode = useCallback((type: string) => {
    addNode(type)
  }, [addNode])

  // Debug removido para limpeza

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white shadow-sm">
        <div>
          <h2 className="text-xl font-bold">Editor de Fluxo do Chatbot</h2>
          <p className="text-sm text-gray-600">Crie seu chatbot arrastando e conectando os nós</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
            <Save className="h-4 w-4 mr-2" />
            Salvar e Voltar
          </Button>
          <Button onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-72 bg-white border-r border-gray-200 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Elementos do Fluxo</h3>
            <p className="text-sm text-gray-600 mb-3">Clique para adicionar elementos</p>
             <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
               <p className="text-xs text-blue-800 font-medium mb-1">💡 Dicas:</p>
               <ul className="text-xs text-blue-700 space-y-1">
                 <li>• <strong>Clique em qualquer card</strong> para editar a mensagem</li>
                 <li>• <strong>Arraste os cards</strong> para organizá-los no canvas</li>
                 <li>• <strong>Conecte os cards</strong> arrastando dos círculos coloridos</li>
                 <li>• <strong>Opções de escolha:</strong> arraste as setinhas laranja para conectar</li>
                 <li>• <strong>Setinhas verdes</strong> indicam opções já conectadas</li>
                 <li>• <strong>Configure mensagens</strong> específicas para cada tipo de nó</li>
                 <li>• <strong>Use zoom e controles</strong> para navegar no canvas</li>
               </ul>
             </div>
          </div>
          
          <div className="space-y-3">
            <Button
              onClick={() => addNode('start')}
              className="w-full justify-start h-14 p-4 border-2 border-green-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 bg-white shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Início</div>
                  <div className="text-xs text-gray-600">Ponto de partida</div>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => addNode('message')}
              className="w-full justify-start h-14 p-4 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 bg-white shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Mensagem</div>
                  <div className="text-xs text-gray-600">Enviar texto</div>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => addNode('choice')}
              className="w-full justify-start h-14 p-4 border-2 border-purple-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 bg-white shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Escolha</div>
                  <div className="text-xs text-gray-600">Opções múltiplas</div>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => addNode('action')}
              className="w-full justify-start h-14 p-4 border-2 border-orange-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 bg-white shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Ação</div>
                  <div className="text-xs text-gray-600">Executar tarefa</div>
                </div>
              </div>
            </Button>
            
            <Button
              onClick={() => addNode('end')}
              className="w-full justify-start h-14 p-4 border-2 border-red-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 bg-white shadow-sm"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <Square className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-gray-900">Fim</div>
                  <div className="text-xs text-gray-600">Finalizar conversa</div>
                </div>
              </div>
            </Button>
          </div>
          
          <div className="mt-8 p-4 bg-gray-50 rounded-xl">
            <h4 className="font-bold text-gray-900 mb-3">Estatísticas</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nós:</span>
                <span className="font-semibold text-gray-900">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Conexões:</span>
                <span className="font-semibold text-gray-900">{edges.length}</span>
              </div>
            </div>
          </div>

          {selectedNode && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <h4 className="font-bold text-blue-900 mb-2">Nó Selecionado</h4>
              <p className="text-sm text-blue-700 mb-3">{selectedNode.data.label}</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => setShowNodeEditor(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Nó
                </Button>
                <Button 
                  onClick={() => {
                    if (confirm(`Tem certeza que deseja excluir o nó "${selectedNode.data.label}"?`)) {
                      setNodes((nds: Node[]) => nds.filter((node: Node) => node.id !== selectedNode.id))
                      setEdges((eds: Edge[]) => eds.filter((edge: Edge) => 
                        edge.source !== selectedNode.id && edge.target !== selectedNode.id
                      ))
                      setSelectedNode(null)
                    }
                  }}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  <X className="h-4 w-4 mr-2" />
                  Excluir Nó
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Editor Principal */}
        <div className="flex-1 relative" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={memoizedOnNodesChange}
              onEdgesChange={memoizedOnEdgesChange}
              onConnect={memoizedOnConnect}
              onNodeClick={onNodeClick}
              onNodeDoubleClick={onNodeDoubleClick}
              nodeTypes={nodeTypes}
              // edgeTypes removido - usando edges padrão
              fitView
              attributionPosition="bottom-left"
              className="bg-gray-50"
              defaultViewport={defaultViewport}
              snapToGrid={true}
              snapGrid={snapGrid}
              nodesDraggable={true}
              nodesConnectable={true}
              elementsSelectable={true}
              selectNodesOnDrag={false}
              connectionMode="loose"
              deleteKeyCode={null}
              multiSelectionKeyCode="Control"
              panOnDrag={true}
              panOnScroll={true}
              zoomOnScroll={true}
              preventScrolling={false}
            >
            <Controls 
              position="top-right"
              showInteractive={false}
            />
            <MiniMap
              nodeStrokeColor={(n: Node) => {
                if (n.type === 'start') return '#10b981'
                if (n.type === 'message') return '#3b82f6'
                if (n.type === 'choice') return '#8b5cf6'
                if (n.type === 'action') return '#f59e0b'
                if (n.type === 'end') return '#ef4444'
                return '#6b7280'
              }}
              nodeColor={(n: Node) => {
                if (n.type === 'start') return '#dcfce7'
                if (n.type === 'message') return '#dbeafe'
                if (n.type === 'choice') return '#f3e8ff'
                if (n.type === 'action') return '#fef3c7'
                if (n.type === 'end') return '#fee2e2'
                return '#f9fafb'
              }}
              position="bottom-right"
              pannable
              zoomable
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="#e5e7eb"
            />
          </ReactFlow>
        </div>
      </div>

      {/* Mobile Controls */}
      <MobileFlowControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        onFitView={handleFitView}
        onAddNode={handleAddNode}
        onTogglePan={handleTogglePan}
        isPanMode={isPanMode}
        currentZoom={currentZoom}
      />

      {/* Mobile Node Editor */}
      {isMobile && showNodeEditor && selectedNode && (
        <MobileNodeEditor
          node={selectedNode}
          onSave={updateNode}
          onClose={() => {
            setSelectedNode(null)
            setShowNodeEditor(false)
          }}
          onDelete={deleteNode}
        />
      )}

          {/* Editor de Nó */}
          {!isMobile && showNodeEditor && selectedNode && (
            <NodeEditor
                node={selectedNode}
                allNodes={nodes}
                onSave={updateNode}
                onDelete={deleteNode}
                onClose={() => {
                  setSelectedNode(null)
                  setShowNodeEditor(false)
                }}
              />
          )}

          {/* Modal de seleção de opções removido */}
    </div>
  )
}

// Editor de Nó
function NodeEditor({ node, onSave, onClose, onDelete, allNodes = [] }: { 
  node: Node; 
  onSave: (node: Node) => void; 
  onClose: () => void;
  onDelete?: (nodeId: string) => void;
  allNodes?: Node[];
}) {
  const [nodeData, setNodeData] = useState({
    ...node.data,
    options: node.data.options?.map((opt: any) => ({
      id: opt.id || `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: opt.text || opt.label || '',
      label: opt.text || opt.label || '',
      actionType: opt.actionType || 'message',
      targetNodeId: opt.targetNodeId || null,
      transferMessage: opt.transferMessage || null,
      waitTime: opt.waitTime || null
    })) || []
  })

  const handleSave = () => {
    console.log('💾 Salvando nó no NodeEditor:', node.id, 'com dados:', nodeData)
    if (nodeData.options) {
      console.log('📋 Opções sendo salvas:', nodeData.options.map((opt: any, index: number) => ({
        index: index + 1,
        text: opt.text,
        actionType: opt.actionType,
        actionTarget: opt.actionTarget,
        id: opt.id
      })))
    }
    onSave({ ...node, data: nodeData })
  }

  const getNodeTitle = () => {
    switch (node.type) {
      case 'start': return 'Mensagem de Início'
      case 'message': return 'Mensagem do Chatbot'
      case 'choice': return 'Pergunta com Opções'
      case 'action': return 'Ação do Chatbot'
      case 'end': return 'Mensagem Final'
      default: return 'Editar Nó'
    }
  }

  const getNodeDescription = () => {
    switch (node.type) {
      case 'start': return 'Configure a mensagem de boas-vindas do chatbot'
      case 'message': return 'Configure a mensagem que o chatbot enviará'
      case 'choice': return 'Configure a pergunta e as opções de resposta'
      case 'action': return 'Configure a ação que o chatbot executará'
      case 'end': return 'Configure a mensagem de encerramento'
      default: return 'Configure as propriedades deste nó'
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-[500px] max-h-[600px] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">{getNodeTitle()}</CardTitle>
              <CardDescription>{getNodeDescription()}</CardDescription>
            </div>
            <Button onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Campo de mensagem principal para todos os tipos */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              {node.type === 'choice' ? 'Pergunta' : 'Mensagem'}
            </label>
            <textarea
              value={nodeData.message || ''}
              onChange={(e) => setNodeData({ ...nodeData, message: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder={
                node.type === 'start' ? 'Ex: Olá! Como posso ajudar você hoje?' :
                node.type === 'message' ? 'Ex: Entendi sua solicitação. Vou verificar isso para você.' :
                node.type === 'choice' ? 'Ex: Qual é o seu problema?' :
                node.type === 'action' ? 'Ex: Processando sua solicitação...' :
                node.type === 'end' ? 'Ex: Obrigado por entrar em contato! Até logo!' :
                'Digite a mensagem...'
              }
            />
            <p className="text-xs text-gray-500 mt-1">
              Esta mensagem será enviada para o usuário quando o chatbot chegar neste ponto da conversa.
            </p>
          </div>

          {/* Opções específicas para nó de escolha */}
          {node.type === 'choice' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Opções de Resposta
              </label>
              <div className="space-y-4">
                {(nodeData.options || []).map((option: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm font-medium text-gray-600 w-6">{index + 1}.</span>
                      <input
                        type="text"
                        value={option.text || option.label || ''}
                        onChange={(e) => {
                          const newOptions = [...(nodeData.options || [])]
                          newOptions[index] = { ...option, text: e.target.value, label: e.target.value }
                          setNodeData({ ...nodeData, options: newOptions })
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Opção ${index + 1}`}
                      />
                      <Button
                        onClick={() => {
                          const newOptions = (nodeData.options || []).filter((_: any, i: number) => i !== index)
                          setNodeData({ ...nodeData, options: newOptions })
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {/* Status da conexão da opção */}
                    <div className="ml-8 space-y-2">
                      <label className="text-xs font-medium text-gray-600 block mb-2">
                        🎯 Status da conexão:
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Arraste uma linha no editor visual para conectar esta opção a outro nó
                      </p>
                      
                      {option.targetNodeId ? (
                        <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-700">
                            Conectado ao nó: {allNodes.find(n => n.id === option.targetNodeId)?.data?.label || option.targetNodeId}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs text-yellow-700">
                            Não conectado - arraste uma linha no editor para conectar
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                 ))}
                 
                 {/* Botão para adicionar nova opção */}
                 <Button
                   onClick={() => {
                     const newOption = {
                       id: `option_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                       text: '', 
                       label: '', 
                       actionType: 'message',
                       targetNodeId: null
                     }
                     setNodeData({
                       ...nodeData,
                       options: [...(nodeData.options || []), newOption]
                     })
                   }}
                   className="w-full border-dashed border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
                 >
                   <Plus className="h-4 w-4 mr-2" />
                   Adicionar Opção
                 </Button>
               </div>
               <p className="text-xs text-gray-500 mt-2">
                 Crie opções e conecte-as a outros nós arrastando linhas no editor visual.
               </p>
              
              {/* Preview das conexões */}
              {nodeData.options && nodeData.options.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">📋 Preview das Conexões</h4>
                  <div className="space-y-1">
                    {nodeData.options.map((opt: any, index: number) => {
                      const targetInfo = opt.targetNodeId ? 
                        allNodes.find(n => n.id === opt.targetNodeId) : null
                      
                      return (
                        <div key={index} className="text-xs text-blue-800 flex items-center space-x-2">
                          <span className="font-medium">{index + 1}.</span>
                          <span>{opt.text || opt.label || `Opção ${index + 1}`}</span>
                          <span className="text-blue-600">→</span>
                          {targetInfo ? (
                            <span className="text-blue-600">
                              {targetInfo.data.label || targetInfo.type}
                            </span>
                          ) : (
                            <span className="text-yellow-600">
                              Não conectado
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Opções específicas para nó de ação */}
          {node.type === 'action' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Tipo de Ação
              </label>
              <select
                value={nodeData.action || 'wait'}
                onChange={(e) => setNodeData({ ...nodeData, action: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="wait">Esperar (pausa)</option>
                <option value="send_email">Enviar E-mail</option>
                <option value="http_request">Fazer Requisição HTTP</option>
                <option value="save_data">Salvar Dados</option>
              </select>
              
              {nodeData.action === 'wait' && (
                <div className="mt-3">
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Duração da Pausa (milissegundos)
                  </label>
                  <input
                    type="number"
                    value={nodeData.duration || 1000}
                    onChange={(e) => setNodeData({ ...nodeData, duration: parseInt(e.target.value) || 1000 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="100"
                    max="10000"
                    step="100"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tempo de espera antes de continuar (1000ms = 1 segundo)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="h-4 w-4 mr-2" />
              Salvar Alterações
            </Button>
            <Button 
              onClick={() => {
                if (confirm(`Tem certeza que deseja excluir o nó "${node.data.label}"?`)) {
                  onDelete?.(node.id)
                  onClose()
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              <X className="h-4 w-4 mr-2" />
              Excluir
            </Button>
            <Button onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
