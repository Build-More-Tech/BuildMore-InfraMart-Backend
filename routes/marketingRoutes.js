const express = require('express');
const router = express.Router();
const { getBanners, getOffers } = require('../controllers/marketingController');

// ==============================
// 📢 PUBLIC MARKETING ROUTES
// ==============================

// Get active banners for Hero section
router.get('/banners', getBanners);

// Get active bumper offers
router.get('/offers', getOffers);

module.exports = router;
