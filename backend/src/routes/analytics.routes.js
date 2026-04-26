const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getDashboardStats,
  getReports,
} = require('../controllers/analytics.controller');

router.get('/dashboard', protect, getDashboardStats);
router.get('/reports', protect, getReports);

module.exports = router;