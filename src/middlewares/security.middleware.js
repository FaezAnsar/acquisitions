import aj from '#config/arcjet';
import logger from '#config/logger';
import { slidingWindow } from '@arcjet/node';

const securityMiddleware = async (req, res, next) => {
  try {
    const role = req.user?.role || 'guest';
    let limit;
    let message;

    switch (role) {
      case 'admin':
        limit = 20;
        message = 'Admin req limit exceeded (20 requests per minute)';
        break;
      case 'user':
        limit = 10;
        message = 'User req limit exceeded (10 requests per minute)';
        break;
      case 'guest':
        limit = 5;
        message = 'Guest req limit exceeded (5 requests per minute)';
        break;
    }
    const client = aj.withRule(
      slidingWindow({
        mode: 'LIVE',
        interval: 1,
        max: limit,
        name: `${role}-limit`,
      })
    );
    const decision = await client.protect(req);
    if (decision.isDenied() && decision.reason.isBot()) {
      logger.warn('Bot req blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Bot requests are not allowed' });
    }
    if (decision.isDenied() && decision.reason.isShield()) {
      logger.warn('Shield req blocked', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        method: req.method,
      });
      return res
        .status(403)
        .json({
          error: 'Forbidden',
          message: 'Shield requests are not allowed',
        });
    }
    if (decision.isDenied() && decision.reason.isRateLimit()) {
      logger.warn('Rate limit exceeded', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      return res
        .status(403)
        .json({ error: 'Forbidden', message: 'Rate limit exceeded' });
    }
    next();
  } catch (e) {
    console.error('Arcjet middleware error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export default securityMiddleware;
