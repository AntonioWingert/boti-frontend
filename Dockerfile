# Dockerfile de produção (Next.js)
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache libc6-compat

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps --no-audit --no-fund && npm cache clean --force

# Copiar código fonte
COPY . .

# Variáveis de ambiente
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build de produção
RUN npm run build

# Expor porta
EXPOSE 3000

# Iniciar o app
CMD ["npm", "start"]
