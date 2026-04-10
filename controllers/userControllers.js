const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const { setUser } = require('../services/auth');

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

        // ✅ Validation (VERY IMPORTANT)
        if (!name || !email || !password || !phone) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, email, password, phone) are required"
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
// 👤 GET USER PROFILE
// ==============================
async function getUserProfile(req, res) {
    try {
        const userId = req.user._id; // comes from JWT middleware

        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            user
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
// ✏️ UPDATE USER PROFILE
// ==============================
async function updateUserProfile(req, res) {
    try {
        const userId = req.user._id;

        const { name, phone } = req.body;

        // ✅ validation
        if (!name && !phone) {
            return res.status(400).json({
                success: false,
                message: "At least one field (name or phone) is required"
            });
        }

        const updates = {};

        if (name) updates.name = name;
        if (phone) updates.phone = phone;

        const user = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user
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
    handleForgetPassword,
    getUserProfile,
    updateUserProfile
};