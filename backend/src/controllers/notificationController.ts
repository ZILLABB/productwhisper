import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { notificationService } from '../services/notificationService';
import { responseOptimizer } from '../services/responseOptimizer';
import logger from '../services/loggerService';

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Get user notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Maximum number of notifications to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of notifications to skip
 *       - in: query
 *         name: unread_only
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Whether to return only unread notifications
 *     responses:
 *       200:
 *         description: List of notifications
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const unreadOnly = req.query.unread_only === 'true';
    
    const notifications = await notificationService.getUserNotifications(
      userId,
      limit,
      offset,
      unreadOnly
    );
    
    responseOptimizer.sendSuccess(res, { notifications });
  } catch (error) {
    logger.error('Error getting notifications:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notifications count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread notifications count
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    const count = await notificationService.getUnreadCount(userId);
    
    responseOptimizer.sendSuccess(res, { count });
  } catch (error) {
    logger.error('Error getting unread count:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
export const markAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);
    
    const notification = await notificationService.markAsRead(notificationId, userId);
    
    if (!notification) {
      return responseOptimizer.sendError(res, 'Notification not found', 404);
    }
    
    responseOptimizer.sendSuccess(res, { 
      message: 'Notification marked as read',
      notification 
    });
  } catch (error) {
    logger.error('Error marking notification as read:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export const markAllAsRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    const count = await notificationService.markAllAsRead(userId);
    
    responseOptimizer.sendSuccess(res, { 
      message: 'All notifications marked as read',
      count 
    });
  } catch (error) {
    logger.error('Error marking all notifications as read:', error);
    next(error);
  }
};

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Server error
 */
export const deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const notificationId = parseInt(req.params.id);
    
    const deleted = await notificationService.deleteNotification(notificationId, userId);
    
    if (!deleted) {
      return responseOptimizer.sendError(res, 'Notification not found', 404);
    }
    
    responseOptimizer.sendSuccess(res, { 
      message: 'Notification deleted' 
    });
  } catch (error) {
    logger.error('Error deleting notification:', error);
    next(error);
  }
};
