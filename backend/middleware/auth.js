const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);

    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated' });
    }

    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

const apiKeyAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) return next();

  const user = await User.findOne({ apiKey });
  if (user) req.user = user;
  next();
};

// accepts either a logged-in session (JWT) or a programmatic request (x-api-key)
// used on routes that should work both from the dashboard and from the public API
const flexibleAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];

  if (apiKey) {
    const user = await User.findOne({ apiKey });
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid or inactive API key' });
    }
    req.user = user;
    return next();
  }

  return protect(req, res, next);
};

module.exports = { protect, adminOnly, apiKeyAuth, flexibleAuth };
