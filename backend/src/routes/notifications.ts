import express from 'express';
import { param } from 'express-validator';
import * as notificationController from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

// Get user notifications
router.get('/', notificationController.getNotifications);

// Get unread notifications count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.put(
  '/:id/read',
  [
    param('id')
      .isInt()
      .withMessage('Notification ID must be an integer')
  ],
  notificationController.markAsRead
);

// Mark all notifications as read
router.put('/mark-all-read', notificationController.markAllAsRead);

// Delete notification
router.delete(
  '/:id',
  [
    param('id')
      .isInt()
      .withMessage('Notification ID must be an integer')
  ],
  notificationController.deleteNotification
);

export default router;
