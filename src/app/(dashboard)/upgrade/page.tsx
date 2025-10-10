'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Check, 
  Star, 
  BarChart3, 
  Palette, 
  Shield, 
  Key, 
  Code,
  Users,
  Bot,
  Wifi,
  MessageSquare,
  ArrowRight,
  Crown
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { api } from '@/lib/api'

interface CurrentPlan {
  planType: string
  daysLeft?: number
}

interface UsageData {
  currentUsers: number
  maxUsers: number
  currentDisparos: number
  maxDisparos: number
  currentDisparosDiarios: number
  maxDisparosDiarios: number
  currentConnections: number
  maxConnections: number
  currentChatbots: number
  maxChatbots: number
}

const plans = [
  {
    name: 'STARTER',
    price: 97,
    period: 'mês',
    description: 'Perfeito para pequenas empresas',
    features: [
      '1 Supervisor + 2 Agentes',
      '1 Chatbot (sem limite de mensagens)',
      '1 Conexão WhatsApp',
      '5.000 disparos/mês',
      '2.000 clientes',
      'Suporte por email'
    ],
    limitations: [
      'Analytics básicos',
      'Sem customização'
    ],
    cta: 'Plano Atual',
    popular: false,
    color: 'border-gray-200',
    current: true
  },
  {
    name: 'PROFESSIONAL',
    price: 297,
    period: 'mês',
    description: 'Para empresas em crescimento',
    features: [
      '2 Supervisores + 8 Agentes',
      '5 Chatbots (sem limite de mensagens)',
      '3 Conexões WhatsApp',
      '25.000 disparos/mês',
      '10.000 clientes',
      'Todos os recursos premium',
      'Suporte prioritário'
    ],
    limitations: [],
    cta: 'Fazer Upgrade',
    popular: true,
    color: 'border-purple-500',
    current: false
  },
]

const premiumFeatures = [
  {
    icon: BarChart3,
    title: 'Analytics Premium',
    description: 'Relatórios detalhados e métricas em tempo real',
    available: false
  },
  {
    icon: Palette,
    title: 'Customização',
    description: 'Branding personalizado e temas customizados',
    available: false
  },
  {
    icon: Shield,
    title: 'Segurança',
    description: 'SSO, criptografia e compliance LGPD',
    available: false
  },
  {
    icon: Key,
    title: 'Integrações',
    description: 'APIs dedicadas e webhooks personalizados',
    available: false
  },
  {
    icon: Code,
    title: 'Desenvolvimento',
    description: 'Suporte técnico prioritário e consultoria',
    available: false
  }
]

export default function UpgradePage() {
  const { user } = useAuth()
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null)
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentPlan()
    fetchUsage()
  }, [])

  const fetchCurrentPlan = async () => {
    try {
      const response = await api.get('/companies/current-plan')
      setCurrentPlan(response.data)
    } catch (error) {
      console.error('Erro ao carregar plano atual:', error)
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

  const handleUpgrade = async (planName: string) => {
    try {
      await api.post('/companies/upgrade', { planType: planName })
      alert('Upgrade realizado com sucesso!')
      fetchCurrentPlan()
    } catch (error) {
      console.error('Erro ao fazer upgrade:', error)
      alert('Erro ao fazer upgrade. Tente novamente.')
    }
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upgrade de Plano</h1>
        <p className="text-gray-600">Escolha o plano ideal para sua empresa</p>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-500" />
            Plano Atual: {currentPlan?.planType || 'FREE_TRIAL'}
          </CardTitle>
          <CardDescription>
            {currentPlan?.planType === 'FREE_TRIAL' 
              ? 'Trial gratuito ativo - experimente todos os recursos'
              : 'Gerencie seu plano e recursos'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPlan?.planType === 'FREE_TRIAL' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-blue-900">Trial Gratuito Ativo</h4>
                  <p className="text-sm text-blue-700">
                    {currentPlan.daysLeft} dias restantes
                  </p>
                </div>
                <Badge className="bg-blue-600">Trial</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.currentUsers || 0}</div>
            <div className="text-xs text-gray-500">
              de {usage?.maxUsers || 0} usuários
            </div>
            <Progress 
              value={(usage?.currentUsers || 0) / (usage?.maxUsers || 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Conexões</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.currentConnections || 0}</div>
            <div className="text-xs text-gray-500">
              de {usage?.maxConnections || 0} conexões
            </div>
            <Progress 
              value={(usage?.currentConnections || 0) / (usage?.maxConnections || 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Chatbots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.currentChatbots || 0}</div>
            <div className="text-xs text-gray-500">
              de {usage?.maxChatbots || 0} chatbots
            </div>
            <Progress 
              value={(usage?.currentChatbots || 0) / (usage?.maxChatbots || 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Disparos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usage?.currentDisparos || 0}</div>
            <div className="text-xs text-gray-500">
              de {usage?.maxDisparos || 0} disparos/mês
            </div>
            <Progress 
              value={(usage?.currentDisparos || 0) / (usage?.maxDisparos || 1) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>

      {/* Plans Comparison */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha seu novo plano</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-purple-500' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    <Star className="h-4 w-4 mr-1" />
                    Recomendado
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">R$ {plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <li key={limitationIndex} className="flex items-center text-gray-400">
                      <span className="h-5 w-5 mr-3 flex-shrink-0">•</span>
                      <span className="text-sm">{limitation}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full" 
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  disabled={plan.current}
                  onClick={() => !plan.current && handleUpgrade(plan.name)}
                >
                  {plan.current ? 'Plano Atual' : plan.cta}
                  {!plan.current && <ArrowRight className="h-4 w-4 ml-2" />}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Premium Features */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos Premium</CardTitle>
          <CardDescription>
            Funcionalidades avançadas disponíveis nos planos superiores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <feature.icon className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
