const User = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const { setUser } = require('../services/Auth');
require('dotenv/config')

function generateOTP() {
    const otp = Math.floor(Math.random() * 900000 + 100000).toString()
    return otp
}
async function handleLogin(req, res) {
    try {
        const { email, password } = req.body
        const normalizedEmail = email.toLowerCase().trim()

        const user = await User.findOne({ email: normalizedEmail })

        if (!user) {
            return res.status(401).json({ err: `invalid email` })
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ err: `invalid passoword` })
        }
        const token = setUser(user)
        return res.status(200).json({ token: token, message: 'login successfully' })
    } catch (error) {
        console.log(error)
    }
}
async function handleSignup(req, res) {
    try {
        const { name, phone, email, password } = req.body
        
        const normalizedEmail = email.toLowerCase().trim()

        const existingUser = await User.findOne({ email:normalizedEmail })
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name,
            email: normalizedEmail,
            phone: phone,
            password: hashedPassword
        });
        const token = setUser(user)
        // const OTP = generateOTP()
        // console.log(OTP)
        // const hashedOTP = await bcrypt.hash(OTP, 5);
        // also send otp to user

        // const otpToken = jwt.sign(
        //     {
        //         email,
        //         name,
        //         password: hashedPassword,
        //         otp: hashedOTP
        //     },
        //     process.env.JWT_SECRET,
        //     { expiresIn: "5m" }
        // );
        return res.status(201).json({
            token: token,
            message: "Signup successfull",
        });

    } catch (error) {
        console.error(error)
    }
}
async function handleForgetPassword(req, res) {
    try {
        const { email, password } = req.body
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.findOneAndUpdate({ email: email }, {
            $set: {
                password: hashedPassword
            }
        },
            { new: true }
        )
        if (!user) {
            return res.status(404).json({ message: "Invalid email" })
        }
        return res.status(200).json({ message: "Password updated" })
    } catch (error) {
        console.log(error)
        return
    }

}
module.exports = { handleLogin, handleSignup, handleForgetPassword }