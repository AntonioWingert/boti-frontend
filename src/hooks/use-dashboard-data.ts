import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';

interface DashboardStats {
  connections: {
    total: number;
    active: number;
    inactive: number;
    change: number;
  };
  clients: {
    total: number;
    new: number;
    change: number;
  };
  chatbots: {
    total: number;
    active: number;
    change: number;
  };
  messages: {
    total: number;
    today: number;
    change: number;
  };
}

interface RecentConnection {
  id: string;
  sessionName: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'FAILED';
  companyName: string;
  lastSeen: string;
  phoneNumber?: string;
}

interface RecentMessage {
  id: string;
  content: string;
  sender: 'CLIENT' | 'SYSTEM' | 'AGENT' | 'CHATBOT';
  clientName: string;
  createdAt: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentConnections: RecentConnection[];
  recentMessages: RecentMessage[];
  loading: boolean;
  error: string | null;
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    connections: { total: 0, active: 0, inactive: 0, change: 0 },
    clients: { total: 0, new: 0, change: 0 },
    chatbots: { total: 0, active: 0, change: 0 },
    messages: { total: 0, today: 0, change: 0 },
  });
  const [recentConnections, setRecentConnections] = useState<RecentConnection[]>([]);
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Garantir que os dados sejam sempre definidos
  const safeStats = {
    connections: stats.connections || { total: 0, active: 0, inactive: 0, change: 0 },
    clients: stats.clients || { total: 0, new: 0, change: 0 },
    chatbots: stats.chatbots || { total: 0, active: 0, change: 0 },
    messages: stats.messages || { total: 0, today: 0, change: 0 },
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar estatísticas do dashboard
      const dashboardRes = await api.get('/dashboard/stats');
      const stats = dashboardRes.data;

      setStats(stats);

      // Buscar conexões recentes
      try {
        const connectionsResponse = await api.get('/dashboard/connections');
        setRecentConnections(connectionsResponse.data || []);
      } catch (err) {
        console.warn('Erro ao carregar conexões recentes:', err);
        setRecentConnections([]);
      }

      // Buscar mensagens recentes
      try {
        const messagesResponse = await api.get('/dashboard/messages');
        setRecentMessages(messagesResponse.data || []);
      } catch (err) {
        console.warn('Erro ao carregar mensagens recentes:', err);
        setRecentMessages([]);
      }

    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err);
      setError(err.response?.data?.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  return {
    stats: safeStats,
    recentConnections: recentConnections || [],
    recentMessages: recentMessages || [],
    loading,
    error,
  };
}
