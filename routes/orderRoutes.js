const express = require('express');
const router = express.Router();
const { isAuthorized, isAdmin } = require('../services/isAuthorized');
const {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    adminGetAllOrders,
    adminUpdateOrderStatus
} = require('../controllers/orderController');

// ==============================
// 🛒 USER ORDER ROUTES
// ==============================

// POST /api/orders — place an order
router.post('/', isAuthorized, createOrder);

// GET /api/orders — get current user's orders
router.get('/', isAuthorized, getUserOrders);

// ==============================
// 🔐 ADMIN ORDER ROUTES
// ==============================

// GET /api/orders/admin/all — get all orders (admin)
router.get('/admin/all', isAuthorized, isAdmin, adminGetAllOrders);

// PATCH /api/orders/admin/:id/status — update order status (admin)
router.patch('/admin/:id/status', isAuthorized, isAdmin, adminUpdateOrderStatus);

// ==============================
// 🛒 USER ORDER PARAMETERIZED ROUTES
// ==============================

// GET /api/orders/:id — get single order
router.get('/:id', isAuthorized, getOrderById);

// PATCH /api/orders/:id/cancel — cancel an order
router.patch('/:id/cancel', isAuthorized, cancelOrder);

module.exports = router;
