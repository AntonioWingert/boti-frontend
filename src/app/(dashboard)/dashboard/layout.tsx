import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Boti | Painel de Controle',
  description: 'Acesse seu painel de controle Boti e gerencie seus chatbots, conversas e equipe.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
