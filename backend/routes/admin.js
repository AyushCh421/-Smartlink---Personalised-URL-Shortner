const express = require('express');
const router = express.Router();
const { getPlatformStats, getAllUsers, toggleUserStatus, deleteUser, getAllUrls } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/toggle', toggleUserStatus);
router.delete('/users/:userId', deleteUser);
router.get('/urls', getAllUrls);

module.exports = router;
