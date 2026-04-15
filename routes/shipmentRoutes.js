const express = require('express');
const router = express.Router();
const { isAuthorized, isAdmin } = require('../services/isAuthorized');
const {
    getUserShipments,
    trackShipment,
    adminCreateShipment,
    adminUpdateShipment,
    adminGetAllShipments
} = require('../controllers/shipmentController');

// ==============================
// 📦 USER SHIPMENT ROUTES
// ==============================

// GET /api/shipments — get current user's shipments
router.get('/', isAuthorized, getUserShipments);

// GET /api/shipments/track/:identifier — track by tracking number or ID
router.get('/track/:identifier', isAuthorized, trackShipment);

// ==============================
// 🔐 ADMIN SHIPMENT ROUTES
// ==============================

// GET /api/shipments/admin/all
router.get('/admin/all', isAuthorized, isAdmin, adminGetAllShipments);

// POST /api/shipments/admin — create shipment
router.post('/admin', isAuthorized, isAdmin, adminCreateShipment);

// PATCH /api/shipments/admin/:id — update status + add event
router.patch('/admin/:id', isAuthorized, isAdmin, adminUpdateShipment);

module.exports = router;
