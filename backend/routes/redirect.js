const express = require('express');
const router = express.Router();
const { redirectUrl } = require('../controllers/redirectController');

// Only match short codes: 4-12 alphanumeric chars (excludes favicon.ico, undefined, etc.)
router.get('/:code([a-zA-Z0-9_-]{3,20})', redirectUrl);

module.exports = router;
