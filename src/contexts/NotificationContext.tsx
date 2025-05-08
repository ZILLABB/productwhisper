import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSocket, SocketEvent } from './SocketContext';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';
import { toast } from '../components/common/Toast';
import { Notification, NotificationType, NotificationPriority } from '../types/notification';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  fetchNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { socket, isConnected } = useSocket();
  const { isAuthenticated } = useAuth();

  // Fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      fetchUnreadCount();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  // Listen for real-time notifications
  useEffect(() => {
    if (socket && isConnected && isAuthenticated) {
      socket.on(SocketEvent.USER_NOTIFICATION, (notification: Notification) => {
        // Add new notification to state
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast notification
        toast({
          title: notification.title,
          message: notification.message,
          type: getToastTypeFromPriority(notification.priority),
          duration: 5000,
        });
      });

      return () => {
        socket.off(SocketEvent.USER_NOTIFICATION);
      };
    }
  }, [socket, isConnected, isAuthenticated]);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.getNotifications();
      setNotifications(response.notifications);
    } catch (err) {
      setError('Failed to fetch notifications');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count from API
  const fetchUnreadCount = async () => {
    if (!isAuthenticated) return;

    try {
      const response = await notificationService.getUnreadCount();
      setUnreadCount(response.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: number) => {
    if (!isAuthenticated) return;

    try {
      await notificationService.markAsRead(notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
      throw err;
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!isAuthenticated) return;

    try {
      await notificationService.markAllAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, read: true }))
      );

      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: number) => {
    if (!isAuthenticated) return;

    try {
      await notificationService.deleteNotification(notificationId);

      // Update local state
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));

      // Update unread count if needed
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  };

  // Helper function to map notification priority to toast type
  const getToastTypeFromPriority = (priority: NotificationPriority) => {
    switch (priority) {
      case NotificationPriority.HIGH:
        return 'error';
      case NotificationPriority.MEDIUM:
        return 'warning';
      case NotificationPriority.LOW:
      default:
        return 'info';
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
