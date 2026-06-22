const express = require('express');
const router = express.Router();
const { getUrlAnalytics, getOverallAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.get('/overview', protect, getOverallAnalytics);
router.get('/:urlId', protect, getUrlAnalytics);

module.exports = router;
