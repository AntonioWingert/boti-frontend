/**
 * Utilitários para manipulação de QR Codes
 */

import QRCode from 'qrcode';

/**
 * Converte uma string QR para base64 (data URL)
 */
export async function qrStringToBase64(qrString: string): Promise<string> {
  try {
    // Se já é base64, retorna como está
    if (qrString.startsWith('data:image/')) {
      return qrString;
    }

    // Gerar QR Code real usando a biblioteca qrcode
    const qrCodeDataURL = await QRCode.toDataURL(qrString, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    });

    return qrCodeDataURL;
  } catch (error) {
    console.error('Error converting QR string to base64:', error);
    // Retornar um placeholder em caso de erro
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgdmlld0JveD0iMCAwIDI1NiAyNTYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiBmaWxsPSIjRjVGNUY1Ii8+Cjx0ZXh0IHg9IjEyOCIgeT0iMTI4IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjNjY2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5RUiBDb2RlPC90ZXh0Pgo8L3N2Zz4K';
  }
}

/**
 * Verifica se uma string é um QR Code válido
 */
export function isValidQRCode(qrString: string): boolean {
  return qrString && qrString.length > 0;
}
