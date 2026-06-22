const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, regenerateApiKey } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.post('/api-key/regenerate', protect, regenerateApiKey);

module.exports = router;
