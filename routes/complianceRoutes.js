const express = require('express');
const router = express.Router();
const multer = require('multer');
const { isAuthorized, isAdmin } = require('../services/isAuthorized');
const { uploadDoc, getUserDocs, getDocById, deleteDoc, adminGetAllDocs, adminUpdateDoc, adminDeleteDoc } = require('../controllers/complianceController');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // 20 MB
});

// ==============================
// 🔐 ADMIN COMPLIANCE ROUTES (must be before /:id)
// ==============================

// GET /api/compliance/admin/all
router.get('/admin/all', isAuthorized, isAdmin, adminGetAllDocs);

// PATCH /api/compliance/admin/:id — update doc (add notes, fix dates)
router.patch('/admin/:id', isAuthorized, isAdmin, adminUpdateDoc);

// DELETE /api/compliance/admin/:id — delete any doc
router.delete('/admin/:id', isAuthorized, isAdmin, adminDeleteDoc);

// ==============================
// 📋 USER COMPLIANCE ROUTES
// ==============================

// POST /api/compliance — upload a compliance document
router.post('/', isAuthorized, upload.single('document'), uploadDoc);

// GET /api/compliance — get all user's compliance docs
router.get('/', isAuthorized, getUserDocs);

// GET /api/compliance/:id — get single doc
router.get('/:id', isAuthorized, getDocById);

// DELETE /api/compliance/:id — delete doc
router.delete('/:id', isAuthorized, deleteDoc);

module.exports = router;
