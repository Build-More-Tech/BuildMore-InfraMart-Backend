const express = require('express');
const router = express.Router();

const {
    getProducts,
    getProductById,
    getCategories,
    getSubcategories
} = require('../controllers/productController');

// ==============================
// 🛒 PUBLIC PRODUCT ROUTES
// ==============================

// ✅ Get all products
router.get('/', getProducts);

// ✅ Get categories (must be before /:id to avoid being caught as an id param)
router.get('/categories/all', getCategories);

// ✅ Get subcategories for a category
router.get('/categories/subcategories', getSubcategories);

// ✅ Get single product
router.get('/:id', getProductById);

module.exports = router;