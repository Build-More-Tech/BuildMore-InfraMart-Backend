const express = require('express');
const router = express.Router();
const {
    handleLogin,
    handleSignup,
    handleForgetPassword,
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress
} = require('../controllers/userControllers');
const { isAuthorized } = require('../services/isAuthorized');

// ==============================
// 🔓 PUBLIC AUTH ROUTES
// ==============================
router.post('/login', handleLogin);
router.post('/signup', handleSignup);
router.post('/forgetpassword', handleForgetPassword);

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