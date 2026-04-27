const express = require('express');
const router = express.Router();
const { isAuthorized, isAdmin } = require('../services/isAuthorized');
const {
    createRFQ,
    getUserRFQs,
    getRFQById,
    addItem,
    removeItem,
    submitRFQ,
    respondToRFQ,
    adminGetAllRFQs,
    adminUpdateRFQ
} = require('../controllers/rfqController');

// ==============================
// 📋 USER RFQ ROUTES
// ==============================

// POST /api/rfqs — create a new draft RFQ
router.post('/', isAuthorized, createRFQ);

// GET /api/rfqs — get all user's RFQs
router.get('/', isAuthorized, getUserRFQs);

// GET /api/rfqs/:id — get single RFQ
router.get('/:id', isAuthorized, getRFQById);

// POST /api/rfqs/:id/items — add item to RFQ
router.post('/:id/items', isAuthorized, addItem);

// DELETE /api/rfqs/:id/items/:itemId — remove item from RFQ
router.delete('/:id/items/:itemId', isAuthorized, removeItem);

// PATCH /api/rfqs/:id/submit — submit RFQ for review
router.patch('/:id/submit', isAuthorized, submitRFQ);

// PATCH /api/rfqs/:id/respond — accept or reject a QUOTED RFQ
router.patch('/:id/respond', isAuthorized, respondToRFQ);

// ==============================
// 🔐 ADMIN RFQ ROUTES
// ==============================

// GET /api/rfqs/admin/all — get all RFQs (admin)
router.get('/admin/all', isAuthorized, isAdmin, adminGetAllRFQs);

// PATCH /api/rfqs/admin/:id — update status/quotes (admin)
router.patch('/admin/:id', isAuthorized, isAdmin, adminUpdateRFQ);

module.exports = router;
