const express = require('express');
const router = express.Router();

const { getProducts, getProductById } = require('../controllers/productController');

// ==============================
// 🛒 PUBLIC PRODUCT ROUTES
// ==============================

// Get all products (supports search, categoryId, subcategory, page, limit query params)
router.get('/', getProducts);

// Get single product
router.get('/:id', getProductById);

module.exports = router;