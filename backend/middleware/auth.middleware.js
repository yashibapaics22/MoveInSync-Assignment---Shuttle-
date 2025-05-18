const jwt = require('jsonwebtoken');
const config = require('../config/auth.config');
const User = require('../models/user.model');

// Debug middleware to log requests
exports.debugRequest = (req, res, next) => {
  console.log('======= DEBUG REQUEST =======');
  console.log('URL:', req.originalUrl);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('Body:', JSON.stringify(req.body));
  console.log('Params:', JSON.stringify(req.params));
  console.log('Query:', JSON.stringify(req.query));
  console.log('============================');
  next();
};

const verifyToken = (req, res, next) => {
  console.log('verifyToken middleware called');
  
  // Extract token from headers (support multiple formats)
  let token = null;
  const authHeader = req.headers.authorization || req.headers['x-access-token'];
  
  console.log('Auth header:', authHeader);
  
  if (authHeader) {
    // Check Bearer token format first
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Otherwise use the header value as is
      token = authHeader;
    }
  }
  
  if (!token) {
    console.log('No token found in request');
    return res.status(403).json({ message: 'No token provided' });
  }
  
  try {
    console.log('Verifying token:', token.substring(0, 20) + '...');
    const decoded = jwt.verify(token, config.secret);
    console.log('Decoded token:', JSON.stringify(decoded));
    req.userId = decoded.id;
    console.log('Token verified, user ID:', req.userId);
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({ message: 'Unauthorized', error: error.message });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Require Admin Role!' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const isStudent = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.role !== 'student') {
      return res.status(403).json({ message: 'Require Student Role!' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  verifyToken,
  isAdmin,
  isStudent,
  debugRequest: exports.debugRequest
};
