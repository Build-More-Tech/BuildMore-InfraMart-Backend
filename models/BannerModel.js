const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
    image: { type: String, required: true },
    tag: { type: String },
    headline: { type: String, required: true },
    headlineAccent: { type: String },
    sub: { type: String },
    cta: { type: String, default: 'Shop Now' },
    ctaTo: { type: String, default: '/products' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
