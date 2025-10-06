import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { api } from '@/lib/api';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  read: boolean;
  createdAt: string;
  data?: any;
}

interface UseNotificationsReturn {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao carregar notificações');
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data);
    } catch (err: any) {
      console.error('Erro ao carregar contagem de notificações:', err);
    }
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err: any) {
      console.error('Erro ao marcar notificação como lida:', err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err: any) {
      console.error('Erro ao marcar todas como lidas:', err);
    }
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.delete(`/notifications/${id}`);
      const notification = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notification && !notification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err: any) {
      console.error('Erro ao excluir notificação:', err);
    }
  }, [notifications]);

  const refreshNotifications = useCallback(async () => {
    await Promise.all([fetchNotifications(), fetchUnreadCount()]);
  }, [fetchNotifications, fetchUnreadCount]);

  // Carregar notificações iniciais
  useEffect(() => {
    if (user) {
      refreshNotifications();
    }
  }, [user, refreshNotifications]);

  // Listener para notificações em tempo real via WebSocket
  useEffect(() => {
    if (!user) return;

    // Aqui você pode adicionar listeners do WebSocket quando implementar
    // Por exemplo:
    // const handleNewNotification = (notification: Notification) => {
    //   setNotifications(prev => [notification, ...prev]);
    //   setUnreadCount(prev => prev + 1);
    // };

    // socket.on('notification', handleNewNotification);
    // return () => socket.off('notification', handleNewNotification);
  }, [user]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };
}
