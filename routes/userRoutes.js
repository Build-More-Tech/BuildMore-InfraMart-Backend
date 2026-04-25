const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const {
    handleLogin,
    handleSignup,
    handleRequestReset,
    handleForgetPassword,
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress
} = require('../controllers/userControllers');
const { isAuthorized } = require('../services/isAuthorized');

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' }
});

// ==============================
// 🔓 PUBLIC AUTH ROUTES
// ==============================
router.post('/login', authLimiter, handleLogin);
router.post('/signup', authLimiter, handleSignup);
router.post('/requestreset', authLimiter, handleRequestReset);
router.post('/forgetpassword', authLimiter, handleForgetPassword);

// ==============================
// 🔐 PROTECTED PROFILE ROUTES
// ==============================
router.get('/profile', isAuthorized, getProfile);
router.put('/profile', isAuthorized, updateProfile);

// ==============================
// 📍 ADDRESS ROUTES
// ==============================
router.post('/address', isAuthorized, addAddress);
router.put('/address/:addressId', isAuthorized, updateAddress);
router.delete('/address/:addressId', isAuthorized, deleteAddress);

module.exports = router;