const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model to get full user data

// Protect routes - verify token and attach user
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization Header (Bearer token)
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // 2. Check Cookie (for web apps)
    else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3. Check query parameter (for special cases)
    else if (req.query?.token) {
      token = req.query.token;
    }

    // If no token found
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get full user from database (excluding password)
    const user = await User.findById(decoded.id).select('-password -__v');

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user account is active
    if (user.status === 'Inactive' || user.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: `Account is ${user.status}. Please contact admin.`
      });
    }

    // Attach full user object to request
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;

    // Update last active timestamp (optional)
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token signature'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
        expiredAt: error.expiredAt
      });
    }

    if (error.name === 'NotBeforeError') {
      return res.status(401).json({
        success: false,
        message: 'Token not active yet'
      });
    }

    // Generic error
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Role-based authorization middleware
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user.role} is not authorized to access this resource`
      });
    }

    next();
  };
};

// Admin only middleware
exports.admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }

  next();
};

// Manager or Admin middleware
exports.manager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'manager' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Manager or Admin access required'
    });
  }

  next();
};

// Customer only middleware
exports.customer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized'
    });
  }

  if (req.user.role !== 'customer') {
    return res.status(403).json({
      success: false,
      message: 'Customer access required'
    });
  }

  next();
};

// Optional: Allow both authenticated and unauthenticated users
exports.optional = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // If token is invalid, just continue without user
    next();
  }
};

// Check if user owns the resource or is admin
exports.isOwnerOrAdmin = (getResourceUserId) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized'
        });
      }

      // Admin can access everything
      if (req.user.role === 'admin') {
        return next();
      }

      const resourceUserId = await getResourceUserId(req);
      
      if (req.user._id.toString() !== resourceUserId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }

      next();
    } catch (error) {
      console.error('Owner check error:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking permissions'
      });
    }
  };
};

// Refresh token middleware
exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    req.newAccessToken = newAccessToken;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Logout middleware (can be used to blacklist tokens)
exports.logout = async (req, res, next) => {
  // In a production app, you might want to add the token to a blacklist
  // or implement token revocation
  
  res.clearCookie('token');
  next();
};