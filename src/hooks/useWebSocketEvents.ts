import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';

interface WhatsAppSession {
  id: string;
  sessionName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'FAILED';
  qrCode?: string;
  phoneNumber?: string;
  lastSeen?: string;
  error?: string;
  chatbotId?: string;
  chatbot?: {
    id: string;
    name: string;
  };
}

interface WebSocketEvent {
  type: string;
  data: any;
  timestamp: string;
}

interface UseWebSocketEventsReturn {
  isConnected: boolean;
  sessions: WhatsAppSession[];
  lastEvent: WebSocketEvent | null;
  error: string | null;
  reconnect: () => void;
}

export function useWebSocketEvents(): UseWebSocketEventsReturn {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Usar ref para evitar re-renders desnecessários
  const socketRef = useRef<Socket | null>(null);
  const isConnectingRef = useRef(false);
  const fallbackIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [useFallback, setUseFallback] = useState(false);

  const connect = () => {
    if (!user?.companyId || !token) {
      return;
    }

    if (isConnectingRef.current) {
      return;
    }

    if (socketRef.current && socketRef.current.connected) {
      return;
    }

    // Desconectar socket anterior se existir
    if (socketRef.current) {
      console.log('🧹 Cleaning up previous socket...');
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    isConnectingRef.current = true;
    console.log('🔌 Connecting to WebSocket...');
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const newSocket = io(`${apiUrl}/whatsapp-events`, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 10000, // Reduzir timeout
      reconnection: true,
      reconnectionAttempts: 3, // Reduzir tentativas
      reconnectionDelay: 2000, // Aumentar delay entre tentativas
      reconnectionDelayMax: 10000, // Máximo delay
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
      setError(null);
      isConnectingRef.current = false;
      
      // Entrar na sala da empresa
      newSocket.emit('join-company');
      
      // Solicitar sessões iniciais
      newSocket.emit('get-sessions');
    });

    newSocket.on('disconnect', (reason: string) => {
      setIsConnected(false);
      isConnectingRef.current = false;
    });

    newSocket.on('connect_error', (err: Error) => {
      console.error('WebSocket connection error:', err);
      setError(err.message);
      setIsConnected(false);
      isConnectingRef.current = false;
      
      // Fallback: usar HTTP polling se WebSocket falhar
      setUseFallback(true);
      startFallbackPolling();
    });

    // Eventos específicos do WhatsApp
    newSocket.on('session-status-change', (event: WebSocketEvent) => {
      console.log('📱 Session status change:', event);
      setLastEvent(event);
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === event.data.id 
            ? { ...session, ...event.data }
            : session
        )
      );
    });

    newSocket.on('qr-code-generated', (event: WebSocketEvent) => {
      console.log('🔲 QR Code generated:', event);
      setLastEvent(event);
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === event.data.sessionId 
            ? { ...session, qrCode: event.data.qrCode, status: 'CONNECTING' }
            : session
        )
      );
    });

    newSocket.on('connection-success', (event: WebSocketEvent) => {
      setLastEvent(event);
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === event.data.sessionId 
            ? { 
                ...session, 
                status: 'CONNECTED', 
                phoneNumber: event.data.phoneNumber,
                qrCode: undefined,
                error: undefined
              }
            : session
        )
      );
    });

    newSocket.on('connection-error', (event: WebSocketEvent) => {
      setLastEvent(event);
      
      setSessions(prevSessions => 
        prevSessions.map(session => 
          session.id === event.data.sessionId 
            ? { 
                ...session, 
                status: 'FAILED', 
                error: event.data.error,
                qrCode: undefined
              }
            : session
        )
      );
    });

    newSocket.on('sessions-updated', (event: WebSocketEvent) => {
      console.log('📋 Sessions updated:', event);
      console.log('📋 Sessions data:', event.data.sessions);
      setLastEvent(event);
      const newSessions = event.data.sessions || [];
      console.log('📋 Setting sessions to:', newSessions.length, 'sessions');
      setSessions(newSessions);
    });

    socketRef.current = newSocket;
  };

  const disconnect = () => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
      isConnectingRef.current = false;
    }
  };

  const startFallbackPolling = () => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
    }
    
    console.log('🔄 Starting HTTP fallback polling...');
    fallbackIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/whatsapp/sessions/company/${user?.companyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        }
      } catch (error) {
        console.error('HTTP fallback error:', error);
      }
    }, 5000); // Polling a cada 5 segundos
  };

  const stopFallbackPolling = () => {
    if (fallbackIntervalRef.current) {
      clearInterval(fallbackIntervalRef.current);
      fallbackIntervalRef.current = null;
      console.log('🛑 Stopped HTTP fallback polling');
    }
  };

  const reconnect = () => {
    disconnect();
    setUseFallback(false);
    stopFallbackPolling();
    setTimeout(connect, 1000);
  };

  // Conectar quando o usuário estiver disponível
  useEffect(() => {
    if (user?.companyId && token) {
      // Debounce para evitar múltiplas conexões
      const timeoutId = setTimeout(() => {
        connect();
      }, 500);

      return () => {
        clearTimeout(timeoutId);
        disconnect();
        stopFallbackPolling();
      };
    }

    return () => {
      disconnect();
      stopFallbackPolling();
    };
  }, [user?.companyId, token]); // Apenas dependências estáveis

  return {
    isConnected,
    sessions,
    lastEvent,
    error,
    reconnect,
  };
}