const express = require('express');
const router = express.Router();

const {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder
} = require('../controllers/orderController');

const { isAuthorized } = require('../services/isAuthorized');

// ==============================
// 🛒 ORDER ROUTES
// ==============================

router.post('/', isAuthorized, createOrder);
router.get('/', isAuthorized, getOrders);
router.get('/:id', isAuthorized, getOrderById);
router.patch('/:id/cancel', isAuthorized, cancelOrder);

module.exports = router;