import { apiService } from './api';
import { Notification } from '../types/notification';

class NotificationService {
  /**
   * Get user notifications
   * @param limit - Maximum number of notifications to return
   * @param offset - Number of notifications to skip
   * @param unreadOnly - Whether to return only unread notifications
   */
  async getNotifications(limit = 20, offset = 0, unreadOnly = false): Promise<{ notifications: Notification[] }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());
    params.append('unread_only', unreadOnly.toString());

    return apiService.get(`/notifications?${params.toString()}`);
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<{ count: number }> {
    return apiService.get('/notifications/unread-count');
  }

  /**
   * Mark notification as read
   * @param notificationId - Notification ID
   */
  async markAsRead(notificationId: number): Promise<{ notification: Notification }> {
    return apiService.put(`/notifications/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ count: number }> {
    return apiService.put('/notifications/mark-all-read');
  }

  /**
   * Delete notification
   * @param notificationId - Notification ID
   */
  async deleteNotification(notificationId: number): Promise<{ message: string }> {
    return apiService.delete(`/notifications/${notificationId}`);
  }
}

export const notificationService = new NotificationService();
