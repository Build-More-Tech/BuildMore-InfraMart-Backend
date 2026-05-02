const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' }
});

router.use(adminLimiter);

const {
    addproduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    updateStock,
    toggleAvailability
} = require('../controllers/adminController');

const {
    createCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    removeSubcategory
} = require('../controllers/categoryController');

const {
    getAllFees,
    createFee,
    updateFee,
    deleteFee,
    toggleFee
} = require('../controllers/feeController');

const {
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBanner,
    reorderBanners,
} = require('../controllers/bannerController');

const { isAuthorized, isAdmin } = require('../services/isAuthorized');

const multer = require('multer');
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB per image
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        const err = new Error('Only JPEG, PNG, and WEBP images are allowed');
        err.status = 400;
        cb(err, false);
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
router.put('/products/:id', isAuthorized, isAdmin, upload.array('images', 5), updateProduct);

// ❌ Delete product
router.delete('/products/:id', isAuthorized, isAdmin, deleteProduct);

// 📦 Update stock
router.patch('/products/:id/stock', isAuthorized, isAdmin, updateStock);

// 🔁 Toggle availability
router.patch('/products/:id/availability', isAuthorized, isAdmin, toggleAvailability);

// ==============================
// 🗂️ ADMIN CATEGORY ROUTES
// ==============================

// Create category (optional image)
router.post('/categories', isAuthorized, isAdmin, upload.single('image'), createCategory);

// Update category (optional new image)
router.put('/categories/:id', isAuthorized, isAdmin, upload.single('image'), updateCategory);

// Delete category (blocked if products exist)
router.delete('/categories/:id', isAuthorized, isAdmin, deleteCategory);

// Add subcategory to a category
router.post('/categories/:id/subcategories', isAuthorized, isAdmin, addSubcategory);

// Remove subcategory from a category
router.delete('/categories/:id/subcategories/:subId', isAuthorized, isAdmin, removeSubcategory);

// ==============================
// 💰 ADMIN FEE ROUTES
// ==============================

// Get all fees (admin)
router.get('/fees', isAuthorized, isAdmin, getAllFees);

// Create a fee
router.post('/fees', isAuthorized, isAdmin, createFee);

// Update a fee
router.put('/fees/:id', isAuthorized, isAdmin, updateFee);

// Delete a fee
router.delete('/fees/:id', isAuthorized, isAdmin, deleteFee);

// Toggle fee enabled/disabled
router.patch('/fees/:id/toggle', isAuthorized, isAdmin, toggleFee);

// ==============================
// 🖼️ ADMIN BANNER ROUTES
// ==============================

// Get all banners (incl. inactive)
router.get('/banners', isAuthorized, isAdmin, getAllBanners);

// Create banner with image upload
router.post('/banners', isAuthorized, isAdmin, upload.single('image'), createBanner);

// Update banner (optional new image)
router.put('/banners/:id', isAuthorized, isAdmin, upload.single('image'), updateBanner);

// Delete banner + Cloudinary cleanup
router.delete('/banners/:id', isAuthorized, isAdmin, deleteBanner);

// Toggle banner active/inactive
router.patch('/banners/:id/toggle', isAuthorized, isAdmin, toggleBanner);

// Reorder banners — body: { order: [{ id, order }, ...] }
router.patch('/banners/reorder', isAuthorized, isAdmin, reorderBanners);

module.exports = router;