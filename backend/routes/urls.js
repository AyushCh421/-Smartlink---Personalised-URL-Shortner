const express = require('express');
const router = express.Router();
const {
  createUrl, getUserUrls, getUrlById, updateUrl,
  deleteUrl, getDashboardStats, verifyPassword
} = require('../controllers/urlController');
const { protect, flexibleAuth } = require('../middleware/auth');
const { createUrlLimiter, apiLimiter } = require('../middleware/rateLimiter');

router.use(apiLimiter);

router.post('/', flexibleAuth, createUrlLimiter, createUrl);
router.get('/', protect, getUserUrls);
router.get('/stats', protect, getDashboardStats);
router.get('/:id', protect, getUrlById);
router.put('/:id', protect, updateUrl);
router.delete('/:id', protect, deleteUrl);
router.post('/verify-password', verifyPassword);

module.exports = router;
