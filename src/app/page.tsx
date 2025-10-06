import type { Metadata } from 'next'
import LandingPage from './landing-page'

export const metadata: Metadata = {
  title: 'Boti - Plataforma de Chatbots WhatsApp | Automação de Conversas',
  description: 'Plataforma completa para criação e gerenciamento de chatbots WhatsApp. Automatize conversas, gerencie equipes e aumente vendas com nossa solução profissional.',
  keywords: [
    'chatbot whatsapp',
    'automação conversas',
    'bot whatsapp',
    'plataforma chatbot',
    'marketing digital',
    'atendimento automatizado',
    'vendas automatizadas',
    'boti'
  ],
  openGraph: {
    title: 'Boti - Plataforma de Chatbots WhatsApp',
    description: 'Plataforma completa para criação e gerenciamento de chatbots WhatsApp. Automatize conversas, gerencie equipes e aumente vendas.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://boti.com.br',
    siteName: 'Boti',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Boti - Plataforma de Chatbots WhatsApp',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Boti - Plataforma de Chatbots WhatsApp',
    description: 'Plataforma completa para criação e gerenciamento de chatbots WhatsApp.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://boti.com.br',
  },
}

export default function HomePage() {
  return <LandingPage />
}