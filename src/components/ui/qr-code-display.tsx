'use client'

import { useState, useEffect } from 'react'
import { qrStringToBase64 } from '@/lib/qrcode-utils'

interface QRCodeDisplayProps {
  qrString: string
  className?: string
  alt?: string
}

export function QRCodeDisplay({ qrString, className = '', alt = 'QR Code' }: QRCodeDisplayProps) {
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const dataURL = await qrStringToBase64(qrString)
        setQrCodeDataURL(dataURL)
      } catch (err) {
        console.error('Error generating QR code:', err)
        setError('Erro ao gerar QR Code')
      } finally {
        setLoading(false)
      }
    }

    if (qrString) {
      generateQRCode()
    }
  }, [qrString])

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Gerando QR Code...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <img 
      src={qrCodeDataURL} 
      alt={alt} 
      className={className}
      onError={(e) => {
        console.error('❌ Erro ao carregar QR Code:', e)
        setError('Erro ao exibir QR Code')
      }}
      onLoad={() => {
        console.log('✅ QR Code carregado com sucesso')
      }}
    />
  )
}
