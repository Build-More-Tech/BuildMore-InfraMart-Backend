const express = require('express');
const router = express.Router()
const {handleLogin, handleSignup, handleForgetPassword} = require('../controllers/userControllers')
//login route
router.post('/login',handleLogin)
//signup route
router.post('/signup',handleSignup)
router.post('/forgetpassword',handleForgetPassword)

module.exports = router