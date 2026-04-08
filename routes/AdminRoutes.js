const express = require('express');
const router = express.Router();

const {
    addproduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    toggleAvailability
} = require('../controllers/adminController');

const { isAuthorized, isAdmin } = require('../middleware/IsAutherized');

// multer
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ==============================
// 🛒 PRODUCT ROUTES
// ==============================

// ✅ Add Product (Admin only)
router.post(
    '/',
    isAuthorized,
    isAdmin,
    upload.array('productImages', 5),
    addproduct
);

// ✅ Get all products (Public)
router.get('/', getAllProducts);

// ✅ Get single product
router.get('/:id', getSingleProduct);

// ✅ Update product (Admin)
router.put('/:id', isAuthorized, isAdmin, updateProduct);

// ✅ Delete product (Admin)
router.delete('/:id', isAuthorized, isAdmin, deleteProduct);

// ✅ Update stock
router.patch('/:id/stock', isAuthorized, isAdmin, updateStock);

// ✅ Toggle availability
router.patch('/:id/availability', isAuthorized, isAdmin, toggleAvailability);

module.exports = router;