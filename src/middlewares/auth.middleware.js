import { jwttoken } from '#utils/jwt';
import logger from '#config/logger';

export const authenticateToken = async (req, res, next) => {
  try {
    const token =
      req.cookies?.token || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      logger.warn('Access denied: No token provided', {
        ip: req.ip,
        path: req.path,
      });
      return res
        .status(401)
        .json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwttoken.verify(token);
    req.user = decoded;

    logger.info('User authenticated successfully', {
      userId: decoded.id,
      email: decoded.email,
    });
    next();
  } catch (error) {
    logger.error('Token verification failed:', error.message, {
      ip: req.ip,
      path: req.path,
    });
    return res.status(403).json({ error: 'Invalid token.' });
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      logger.warn('Access denied: Admin role required', {
        userId: req.user?.id,
        role: req.user?.role,
      });
      return res
        .status(403)
        .json({ error: 'Access denied. Admin role required.' });
    }
    next();
  } catch (error) {
    logger.error('Admin authorization error:', error.message);
    return res.status(500).json({ error: 'Authorization error.' });
  }
};
