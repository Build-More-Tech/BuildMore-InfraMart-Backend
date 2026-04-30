const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { isAuthorized, isAdmin } = require('../services/isAuthorized');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    adminGetAllOrders,
    adminUpdateOrderStatus
} = require('../controllers/orderController');

const orderLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' }
});

// ==============================
// 🔐 ADMIN ORDER ROUTES (must be before /:id)
// ==============================
router.get('/admin/all', isAuthorized, isAdmin, adminGetAllOrders);
router.patch('/admin/:id/status', isAuthorized, isAdmin, adminUpdateOrderStatus);

// ==============================
// 🛒 USER ORDER ROUTES
// ==============================
router.post('/', isAuthorized, orderLimiter, createOrder);
router.get('/', isAuthorized, getUserOrders);
router.get('/:id', isAuthorized, getOrderById);
router.patch('/:id/cancel', isAuthorized, cancelOrder);

module.exports = router;
