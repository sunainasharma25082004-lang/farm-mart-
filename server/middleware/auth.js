import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'sfarmart_jwt_access_secret_2026_super_secure_key';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ok: false,
        success: false,
        code: 'AUTH_REQUIRED',
        message: 'Authentication token is required'
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_ACCESS_SECRET);
    } catch (jwtErr) {
      const code = jwtErr.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN';
      return res.status(401).json({
        ok: false,
        success: false,
        code,
        message: jwtErr.name === 'TokenExpiredError' ? 'Access token has expired' : 'Invalid token'
      });
    }

    const userId = decoded.sub || decoded.id;
    if (!userId) {
      return res.status(401).json({
        ok: false,
        success: false,
        code: 'INVALID_TOKEN',
        message: 'Token subject missing'
      });
    }

    // Load full user doc if customer, or populate basic info
    if (decoded.role === 'VENDOR') {
      req.user = {
        _id: userId,
        id: userId,
        vendorId: decoded.vendorId || userId,
        role: 'VENDOR',
        phone: decoded.phone,
        name: decoded.name,
        status: 'ACTIVE'
      };
      return next();
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({
        ok: false,
        success: false,
        code: 'USER_NOT_FOUND',
        message: 'User account no longer exists'
      });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        ok: false,
        success: false,
        code: 'ACCOUNT_INACTIVE',
        message: `Your account is ${user.status.toLowerCase()}. Please contact support.`
      });
    }

    req.user = user;
    req.user.id = user._id;
    next();
  } catch (err) {
    console.error('requireAuth middleware error:', err);
    return res.status(500).json({
      ok: false,
      success: false,
      code: 'SERVER_ERROR',
      message: 'Authentication check failed'
    });
  }
};

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        ok: false,
        success: false,
        code: 'FORBIDDEN',
        message: `Access denied. Requires one of roles: [${roles.join(', ')}]`
      });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
      const userId = decoded.sub || decoded.id;
      if (userId) {
        if (decoded.role === 'VENDOR') {
          req.user = { _id: userId, id: userId, vendorId: decoded.vendorId || userId, role: 'VENDOR' };
        } else {
          const user = await User.findById(userId);
          if (user && user.status === 'ACTIVE') {
            req.user = user;
            req.user.id = user._id;
          }
        }
      }
    }
  } catch (e) {
    // optional auth passes silently
  }
  next();
};

// Backward-compatibility export
export const verifyToken = requireAuth;
