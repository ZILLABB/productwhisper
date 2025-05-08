const { verifyToken } = require('../config/jwt');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN format
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
  
  // Add user info to request
  req.user = { id: decoded.userId };
  next();
};

module.exports = {
  authenticateToken
};
