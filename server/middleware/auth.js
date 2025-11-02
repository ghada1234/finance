import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'User not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const checkSubscription = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user can add transactions
    if (!user.canAddTransaction()) {
      return res.status(403).json({ 
        message: 'Subscription limit reached. Please upgrade your plan.',
        subscriptionStatus: user.subscription.status,
        needsUpgrade: true
      });
    }

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error checking subscription' });
  }
};

