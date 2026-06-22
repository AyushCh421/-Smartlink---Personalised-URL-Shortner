const rateLimit = require('express-rate-limit');

const createLimiter = (windowMs, max, message) =>
  rateLimit({
    windowMs,
    max,
    message: { success: false, message },
    standardHeaders: true,
    legacyHeaders: false
  });

const authLimiter = createLimiter(15 * 60 * 1000, 10, 'Too many auth attempts, try again in 15 minutes');
const apiLimiter = createLimiter(60 * 1000, 100, 'Too many requests, slow down');
const createUrlLimiter = createLimiter(60 * 1000, 20, 'URL creation limit reached, try again in a minute');

module.exports = { authLimiter, apiLimiter, createUrlLimiter };
