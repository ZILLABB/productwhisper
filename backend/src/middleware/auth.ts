import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../config/jwt';
import { userRepository } from '../repositories';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token is required' });
    }
    
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Check if user exists
    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Check if user is active
    if (user.is_active === false) {
      return res.status(401).json({ error: 'Account is inactive' });
    }
    
    // Attach user to request
    req.user = { id: user.id };
    
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

/**
 * Middleware to check if user has admin role
 */
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    // Get user with roles
    const user = await userRepository.getUserWithRoles(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has admin role
    if (!user.roles || !user.roles.includes('admin')) {
      return res.status(403).json({ error: 'Access denied. Admin role required' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * Middleware to check if user has moderator role
 */
export const isModerator = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    
    // Get user with roles
    const user = await userRepository.getUserWithRoles(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user has moderator or admin role
    if (!user.roles || (!user.roles.includes('moderator') && !user.roles.includes('admin'))) {
      return res.status(403).json({ error: 'Access denied. Moderator role required' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};
