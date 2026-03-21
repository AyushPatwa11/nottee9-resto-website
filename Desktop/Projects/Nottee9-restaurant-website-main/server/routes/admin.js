/**
 * Admin Auth Routes  — /api/admin
 */
const express = require('express');
const router  = express.Router();
const { login, getProfile, getDashboardStats } = require('../controllers/adminController');
const { protect } = require('../middleware/auth');

router.post('/login',  login);
router.get('/me',      protect, getProfile);
router.get('/stats',   protect, getDashboardStats);

module.exports = router;
