import express from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    body('username')
      .isString()
      .isLength({ min: 3, max: 30 })
      .withMessage('Username must be between 3 and 30 characters'),
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  authController.register
);

// Login
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Must be a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  authController.login
);

// Refresh token
router.post(
  '/refresh',
  [
    body('refreshToken')
      .isString()
      .withMessage('Refresh token is required')
  ],
  authController.refresh
);

// Get current user
router.get('/me', authenticateToken, authController.getMe);

export default router;
