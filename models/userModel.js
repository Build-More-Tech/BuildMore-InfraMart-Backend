const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true ,min:8 },
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    phone: { type: String,required:true,max:10},
    address: [
        {
            building: String,
            area: { type: String, required: true },
            landmark: String,
            city: { type: String, required: true },
            state: { type: String, required: true },
            pincode: { type: String, required: true },
            country: { type: String, required: true },
            alternatephone: { type: String,max:10},
        }
    ],
    updatedAt: Date

}, { timestamps: true })

module.exports = mongoose.model('user', userSchema)