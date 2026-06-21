import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Driver from '../models/Driver.js';

// Middleware to protect routes with JWT
export const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hireme_secret_key_jwt_token_auth');
    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token validation failed' });
  }
};

// Middleware to restrict access by role
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Access denied. Role '${req.user?.role}' is not authorized.` });
    }
    next();
  };
};

// Helper to transition resting drivers to available after 8 hours
export const checkAndReleaseRestingDrivers = async () => {
  const REST_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
  const cutoffTime = new Date(Date.now() - REST_DURATION_MS);
  
  try {
    const result = await Driver.updateMany(
      {
        availability: 'Resting',
        lastTripCompletedAt: { $lte: cutoffTime }
      },
      {
        $set: { availability: 'Available' }
      }
    );
    if (result.modifiedCount > 0) {
      console.log(`Auto-released ${result.modifiedCount} resting drivers to 'Available'.`);
    }
  } catch (error) {
    console.error('Error auto-releasing resting drivers:', error.message);
  }
};
