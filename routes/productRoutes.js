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

// ✅ Get categories (must be before /:id to avoid being caught as an id param)
router.get('/categories/all', getCategories);

// ✅ Get single product
router.get('/:id', getProductById);

module.exports = router;