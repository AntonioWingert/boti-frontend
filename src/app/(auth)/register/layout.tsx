import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Cadastro - Boti | Crie sua conta gratuita',
  description: 'Cadastre-se gratuitamente na Boti e comece a criar seus chatbots WhatsApp hoje mesmo. Sem compromisso, sem cartão de crédito.',
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Cadastro Gratuito - Boti',
    description: 'Cadastre-se gratuitamente na Boti e comece a criar seus chatbots WhatsApp hoje mesmo.',
    type: 'website',
    locale: 'pt_BR',
    url: 'https://boti.com.br/register',
    siteName: 'Boti',
  },
}

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
