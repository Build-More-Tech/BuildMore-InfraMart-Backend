const express = require('express');
const router = express.Router();

const { getAllCategories, getCategoryById } = require('../controllers/categoryController');

// ==============================
// PUBLIC CATEGORY ROUTES
// ==============================

// Get all categories (with subcategories)
router.get('/', getAllCategories);

// Get single category by ID (includes subcategories)
router.get('/:id', getCategoryById);

module.exports = router;
