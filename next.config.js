/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Ignorar erros de ESLint no build de produção
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: process.env.NEXT_PUBLIC_API_URL?.startsWith('https') ? 'https' : 'http',
        hostname: (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/^https?:\/\//, '').replace(/:[0-9]+$/, ''),
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
}

module.exports = nextConfig
