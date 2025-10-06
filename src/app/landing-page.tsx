'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Wifi, 
  MessageSquare, 
  Check, 
  Star,
  Shield,
  BarChart3,
  Palette,
  Key,
  Code,
  ArrowRight,
  Play
} from 'lucide-react'
import Logo from '@/components/Logo'
import Header from '@/components/Header'

const features = [
  {
    icon: MessageSquare,
    title: 'Chatbot Automatizado',
    description: 'Crie fluxos de conversação personalizados sem limitação de disparos'
  },
  {
    icon: Users,
    title: 'Gestão de Equipe',
    description: 'Controle de usuários com diferentes níveis de acesso'
  },
  {
    icon: Wifi,
    title: 'WhatsApp Integrado',
    description: 'Conecte múltiplos números do WhatsApp'
  },
  {
    icon: MessageSquare,
    title: 'Disparos em Massa',
    description: 'Campanhas promocionais e follow-ups automatizados'
  }
]

const premiumFeatures = [
  {
    icon: BarChart3,
    title: 'Analytics Avançado',
    description: 'Relatórios detalhados de performance e conversões'
  },
  {
    icon: Shield,
    title: 'Segurança Enterprise',
    description: 'Criptografia de ponta a ponta e compliance LGPD'
  },
  {
    icon: Palette,
    title: 'Personalização Total',
    description: 'Temas customizados e branding da sua empresa'
  },
  {
    icon: Key,
    title: 'API Completa',
    description: 'Integração com seus sistemas existentes'
  }
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 'R$ 97',
    period: '/mês',
    description: 'Perfeito para pequenas empresas',
    features: [
      '1 chatbot ativo',
      '1.000 disparos/mês',
      'Suporte por email',
      'Templates básicos'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: 'R$ 297',
    period: '/mês',
    description: 'Ideal para empresas em crescimento',
    features: [
      '5 chatbots ativos',
      '10.000 disparos/mês',
      'Suporte prioritário',
      'Analytics básico'
    ],
    popular: true
  }
]

const testimonials = [
  {
    name: 'Maria Silva',
    company: 'Loja Virtual Plus',
    content: 'O Boti revolucionou nosso atendimento. Aumentamos as vendas em 40% em apenas 2 meses!',
    rating: 5
  },
  {
    name: 'João Santos',
    company: 'Clínica Saúde Total',
    content: 'Automatizamos 80% das consultas. Nossos pacientes adoram a praticidade!',
    rating: 5
  },
  {
    name: 'Ana Costa',
    company: 'Academia FitLife',
    content: 'Conseguimos captar 3x mais leads com os chatbots. ROI incrível!',
    rating: 5
  }
]

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-boti-bg">
      <Header onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <Logo size={80} />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-boti-text font-poppins mb-6">
              Automatize suas{' '}
              <span className="text-boti-primary">conversas</span> no WhatsApp
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Crie chatbots inteligentes, gerencie equipes e aumente suas vendas com a plataforma mais completa do Brasil.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-boti-primary hover:bg-boti-primary/90 text-white px-8 py-4 text-lg"
                asChild
              >
                <Link href="/register">
                  Começar Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 lg:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-boti-text font-poppins mb-4">
              Tudo que você precisa para automatizar
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Nossa plataforma oferece todas as ferramentas necessárias para criar chatbots profissionais
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-boti-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-boti-primary" />
                  </div>
                  <CardTitle className="text-xl font-poppins">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Features */}
      <section className="py-20 px-4 lg:px-6 bg-boti-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-boti-text font-poppins mb-4">
              Recursos Premium
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Funcionalidades avançadas para empresas que querem ir além
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {premiumFeatures.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mx-auto w-12 h-12 bg-boti-secondary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-boti-secondary" />
                  </div>
                  <CardTitle className="text-xl font-poppins">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 lg:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-boti-text font-poppins mb-4">
              Planos que cabem no seu bolso
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Escolha o plano ideal para o seu negócio
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'ring-2 ring-boti-primary' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-boti-primary text-white px-4 py-1">
                      Mais Popular
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl font-poppins">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-boti-text">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-2">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-boti-primary hover:bg-boti-primary/90' : 'bg-gray-900 hover:bg-gray-800'}`}
                    asChild
                  >
                    <Link href="/register">
                      Escolher Plano
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 lg:px-6 bg-boti-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-boti-text font-poppins mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Mais de 10.000 empresas já confiam na Boti
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold text-boti-text">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 lg:px-6 bg-boti-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-poppins mb-4">
            Pronto para automatizar suas conversas?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Junte-se a mais de 10.000 empresas que já usam a Boti
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-boti-primary hover:bg-gray-100 px-8 py-4 text-lg"
              asChild
            >
              <Link href="/register">
                Começar Grátis Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Logo textColor="white" />
            </div>
            <p className="text-gray-400 max-w-md mx-auto">
              A plataforma mais completa para criação de chatbots WhatsApp no Brasil.
            </p>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Boti. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
