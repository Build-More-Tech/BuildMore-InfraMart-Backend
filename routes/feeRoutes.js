const express = require('express');
const router = express.Router();
const { getEnabledFees } = require('../controllers/feeController');

// GET /api/fees — public, no auth required
router.get('/', getEnabledFees);

module.exports = router;
