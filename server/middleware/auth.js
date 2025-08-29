const User = require('../models/User');
const jwt = require('jsonwebtoken');


const authMiddleware = async (req, res, next) => {
  try {
    // Development bypass - remove this in production
    if (process.env.NODE_ENV === 'development' || !process.env.JWT_SECRET) {
      // Create a mock user for development
      req.user = {
        id: '507f1f77bcf86cd799439011',
        username: 'admin',
        email: 'admin@security-platform.com',
        role: 'admin'
      }
      return next();
    }

    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token.' });
  }
}

module.exports = authMiddleware;