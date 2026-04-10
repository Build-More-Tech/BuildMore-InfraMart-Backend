const express = require('express');
const router = express.Router();

const {
    handleLogin,
    handleSignup,
    handleForgetPassword,
    getUserProfile,
    updateUserProfile
} = require('../controllers/userControllers');

// ✅ import middleware (FIX PATH if needed)
const { isAuthorized } = require('../services/isAuthorized');

// ==============================
// 🔐 AUTH ROUTES
// ==============================
router.post('/login', handleLogin);
router.post('/signup', handleSignup);
router.post('/forgetpassword', handleForgetPassword);

// ==============================
// 👤 PROFILE ROUTES
// ==============================

// ✅ Get logged-in user profile
router.get('/profile', isAuthorized, getUserProfile);

// ✅ Update profile
router.patch('/profile', isAuthorized, updateUserProfile);

module.exports = router;