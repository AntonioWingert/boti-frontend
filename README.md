# 🤖 Chatbot Frontend

Frontend do sistema de chatbot desenvolvido com Next.js 14 e shadcn/ui.

## 🚀 Início Rápido

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Acessar: http://localhost:3000
```

### Com Docker

```bash
# Na raiz do projeto
./scripts.sh dev

# Acessar: http://localhost:3001
```

## 🛠️ Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **shadcn/ui** - Componentes UI
- **Zustand** - Gerenciamento de estado
- **Axios** - Cliente HTTP
- **React Hook Form** - Formulários
- **Zod** - Validação

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router (Next.js 14)
│   ├── globals.css        # Estilos globais
│   ├── layout.tsx         # Layout raiz
│   └── page.tsx           # Página inicial
├── components/            # Componentes reutilizáveis
│   └── ui/               # Componentes shadcn/ui
├── lib/                  # Utilitários e configurações
│   ├── api.ts            # Cliente da API
│   └── utils.ts          # Funções utilitárias
├── stores/               # Estado global (Zustand)
├── types/                # Definições TypeScript
└── hooks/                # Custom hooks
```

## 🎨 Componentes

### shadcn/ui
- Button
- Input
- Card
- Dialog
- Table
- E muito mais...

### Componentes Customizados
- Layout principal
- Navegação
- Formulários
- Tabelas de dados

## 🔧 Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
```

## 🌐 Variáveis de Ambiente

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📱 Funcionalidades

- ✅ **Layout Responsivo** - Mobile-first design
- ✅ **Autenticação** - Sistema de login/logout
- ✅ **Dashboard** - Visão geral do sistema
- ✅ **Gerenciamento** - CRUD de entidades
- ✅ **Formulários** - Validação com Zod
- ✅ **Estado Global** - Zustand para estado
- ✅ **API Integration** - Axios com interceptors

## 🚀 Deploy

### Docker
```bash
# Build da imagem
docker build -t chatbot-frontend .

# Executar container
docker run -p 3000:3000 chatbot-frontend
```

### Vercel
```bash
# Deploy automático
vercel --prod
```

## 📚 Documentação

- [Next.js](https://nextjs.org/docs)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand](https://zustand-demo.pmnd.rs/)