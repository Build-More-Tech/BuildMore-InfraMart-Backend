const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    title: { type: String, required: true },
    tag: { type: String },
    discount: { type: String, required: true },
    desc: { type: String },
    color: { type: String, default: 'from-orange-600 to-red-700' }, 
    image: { type: String, required: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
