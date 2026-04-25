const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthorized, isAdmin } = require('../services/isAuthorized');
const { getSpecsByProduct, getAllSpecs, uploadSpecSheet, deleteSpecSheet } = require('../controllers/specsController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

// ==============================
// 📄 PUBLIC SPEC ROUTES
// ==============================

// GET /api/specs — get all spec sheets (public)
router.get('/', getAllSpecs);

// GET /api/specs/product/:productId — get spec sheets for a product
router.get('/product/:productId', getSpecsByProduct);

// ==============================
// 🔐 ADMIN SPEC ROUTES
// ==============================

// POST /api/specs/admin — upload spec sheet
router.post('/admin', isAuthorized, isAdmin, upload.single('file'), uploadSpecSheet);

// DELETE /api/specs/admin/:id — delete spec sheet
router.delete('/admin/:id', isAuthorized, isAdmin, deleteSpecSheet);

module.exports = router;
