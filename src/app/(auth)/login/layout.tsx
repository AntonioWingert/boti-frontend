import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Boti | Acesse sua conta',
  description: 'Faça login na sua conta Boti e acesse sua plataforma de chatbots WhatsApp.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
