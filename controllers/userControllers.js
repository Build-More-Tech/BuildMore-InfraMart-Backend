const crypto = require('crypto');
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
// 📧 REQUEST PASSWORD RESET (step 1)
// ==============================
async function handleRequestReset(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required' });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (user) {
            const otp = crypto.randomInt(100000, 999999).toString();
            const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
            await User.findByIdAndUpdate(user._id, { resetToken: otp, resetTokenExpiry: expiry });

            // TODO: send OTP via email (e.g. nodemailer / SendGrid)
            // In development only — remove before production
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[DEV] Reset OTP for ${normalizedEmail}: ${otp}`);
            }
        }

        // Always return the same message to prevent email enumeration
        return res.status(200).json({
            success: true,
            message: 'If this email is registered, a reset code has been sent'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔁 RESET PASSWORD (step 2 — requires OTP from step 1)
// ==============================
async function handleForgetPassword(req, res) {
    try {
        const { email, otp, password } = req.body;

        if (!email || !otp || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email, OTP and new password are required'
            });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user || !user.resetToken || !user.resetTokenExpiry) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset request' });
        }

        if (new Date() > user.resetTokenExpiry) {
            return res.status(400).json({ success: false, message: 'Reset code has expired' });
        }

        if (user.resetToken !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid reset code' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            $unset: { resetToken: '', resetTokenExpiry: '' }
        });

        return res.status(200).json({ success: true, message: 'Password updated successfully' });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 👤 GET PROFILE
// ==============================
async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// ✏️ UPDATE PROFILE (name / phone)
// ==============================
async function updateProfile(req, res) {
    try {
        const { name, phone } = req.body;
        const updates = {};
        if (name) updates.name = name;
        if (phone) updates.phone = phone;
        updates.updatedAt = new Date();

        const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        return res.status(200).json({ success: true, user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 📍 ADD ADDRESS
// ==============================
async function addAddress(req, res) {
    try {
        const { building, area, landmark, city, state, pincode, country, alternatephone } = req.body;

        if (!area || !city || !state || !pincode || !country) {
            return res.status(400).json({ success: false, message: 'area, city, state, pincode and country are required' });
        }

        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $push: { address: { building, area, landmark, city, state, pincode, country, alternatephone } } },
            { new: true }
        ).select('-password');

        return res.status(201).json({ success: true, address: user.address });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// ✏️ UPDATE ADDRESS
// ==============================
async function updateAddress(req, res) {
    try {
        const { addressId } = req.params;
        const { building, area, landmark, city, state, pincode, country, alternatephone } = req.body;

        const update = {};
        if (building !== undefined) update['address.$.building'] = building;
        if (area)       update['address.$.area'] = area;
        if (landmark !== undefined) update['address.$.landmark'] = landmark;
        if (city)       update['address.$.city'] = city;
        if (state)      update['address.$.state'] = state;
        if (pincode)    update['address.$.pincode'] = pincode;
        if (country)    update['address.$.country'] = country;
        if (alternatephone !== undefined) update['address.$.alternatephone'] = alternatephone;

        const user = await User.findOneAndUpdate(
            { _id: req.user._id, 'address._id': addressId },
            { $set: update },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ success: false, message: 'Address not found' });
        return res.status(200).json({ success: true, address: user.address });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// ❌ DELETE ADDRESS
// ==============================
async function deleteAddress(req, res) {
    try {
        const { addressId } = req.params;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { $pull: { address: { _id: addressId } } },
            { new: true }
        ).select('-password');

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        return res.status(200).json({ success: true, address: user.address });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// EXPORTS
// ==============================
module.exports = {
    handleLogin,
    handleSignup,
    handleRequestReset,
    handleForgetPassword,
    getProfile,
    updateProfile,
    addAddress,
    updateAddress,
    deleteAddress
};