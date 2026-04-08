const express = require('express');
const router = express.Router();

const {
    getProducts,
    getProductById,
    getCategories
} = require('../controllers/productController');

// ==============================
// 🛒 PUBLIC PRODUCT ROUTES
// ==============================

// ✅ Get all products
router.get('/', getProducts);

// ✅ Get single product
router.get('/:id', getProductById);

// ✅ Get categories
router.get('/categories/all', getCategories);

module.exports = router;