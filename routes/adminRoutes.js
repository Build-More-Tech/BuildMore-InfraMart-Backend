const express = require('express');
const router = express.Router();

const {
    addproduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    updateStock,
    toggleAvailability
} = require('../controllers/adminController');

const { isAuthorized, isAdmin } = require('../services/isAuthorized');

const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per image
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        cb(new Error('Only JPEG, PNG, and WEBP images are allowed'));
    }
});

// ==============================
// 🔐 ADMIN PRODUCT ROUTES
// ==============================

// ➕ Add product
router.post('/products', isAuthorized, isAdmin, upload.array('images', 5), addproduct);

// 📦 Get all products (admin)
router.get('/products', isAuthorized, isAdmin, getAllProducts);

// ✏️ Update product
router.put('/products/:id', isAuthorized, isAdmin, updateProduct);

// ❌ Delete product
router.delete('/products/:id', isAuthorized, isAdmin, deleteProduct);

// 📦 Update stock
router.patch('/products/:id/stock', isAuthorized, isAdmin, updateStock);

// 🔁 Toggle availability
router.patch('/products/:id/availability', isAuthorized, isAdmin, toggleAvailability);

module.exports = router;