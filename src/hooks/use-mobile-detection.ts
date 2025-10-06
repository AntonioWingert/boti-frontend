import { useState, useEffect } from 'react';

export function useMobileDetection() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Detectar mobile por largura e user agent
      const isMobileWidth = width < 768;
      const isMobileUserAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Detectar tablet
      const isTabletWidth = width >= 768 && width < 1024;
      const isTabletUserAgent = /ipad|android(?!.*mobile)/i.test(userAgent);
      
      setIsMobile(isMobileWidth || isMobileUserAgent);
      setIsTablet((isTabletWidth || isTabletUserAgent) && !isMobile);
      setIsDesktop(width >= 1024 && !isMobile && !isTablet);
    };

    // Verificar no carregamento
    checkDevice();

    // Adicionar listener para mudanças de tamanho
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileOrTablet: isMobile || isTablet,
  };
}
