import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

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
  authors: [{ name: 'Boti' }],
  creator: 'Boti',
  publisher: 'Boti',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://boti.com.br',
    title: 'Boti - Plataforma de Chatbots WhatsApp',
    description: 'Plataforma completa para criação e gerenciamento de chatbots WhatsApp. Automatize conversas, gerencie equipes e aumente vendas.',
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
  verification: {
    google: 'your-google-verification-code',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}