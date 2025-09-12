/* global process */
import jwt from 'jsonwebtoken';
import { User } from '../database.js';

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // Development fallback to prevent 500s if env is missing during local runs
    if (process.env.NODE_ENV !== 'production') {
      return 'dev-secret';
    }
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
};

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, getJWTSecret(), (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    
    // Add user info to request object
    req.user = decoded;
    next();
  });
};

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, getJWTSecret(), { expiresIn: '24h' });
};

// Middleware to verify user exists
export const verifyUser = async (req, res, next) => {
  try {
    const user = User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    req.userInfo = user;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
