const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { setUser } = require('../services/Auth');

// ==============================
// 🔐 LOGIN CONTROLLER
// ==============================
async function handleLogin(req, res) {
    try {
        const { email, password } = req.body;

        // ✅ Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // ✅ Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check user exists
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email"
            });
        }

        // Check password
        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            });
        }

        // Generate token
        const token = setUser(user);

        // Success response
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// ==============================
// 📝 SIGNUP CONTROLLER
// ==============================
async function handleSignup(req, res) {
    try {
        const { name, phone, email, password } = req.body;

        // ✅ Required fields validation
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, email, password, phone) are required"
            });
        }

        // ✅ Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // ✅ Password length validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Check if user already exists
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await User.create({
            name,
            email: normalizedEmail,
            phone,
            password: hashedPassword
        });

        // Generate token
        const token = setUser(user);

        // Success response
        return res.status(201).json({
            success: true,
            message: "Signup successful",
            token
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// ==============================
// 🔁 FORGOT PASSWORD CONTROLLER
// ==============================
async function handleForgetPassword(req, res) {
    try {
        const { email, password } = req.body;

        // ✅ Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required"
            });
        }

        // ✅ Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format"
            });
        }

        // ✅ Password length validation
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long"
            });
        }

        // Normalize email
        const normalizedEmail = email.toLowerCase().trim();

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update user password
        const user = await User.findOneAndUpdate(
            { email: normalizedEmail },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        // If user not found
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid email"
            });
        }

        // Success response
        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

// ==============================
// EXPORTS
// ==============================
module.exports = {
    handleLogin,
    handleSignup,
    handleForgetPassword
};