const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    desc: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description too long']
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    productImages: [
        {
            type: String
        }
    ],
    materialSpecifications: {
        type: String,
    },
    stock: {
        type: Number,
        required: true,
    },
    availability: {
        type: Boolean,
        default: true
    },
    tier: {
        type: String,
        enum: ['Standard Export', 'Bulk Distribution', 'LTL Freight Only', 'Custom Fab'],
        default: 'Standard Export'
    },
    bulkInfo: {
        type: String
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        default: null
    },
    reviews: {
        type: Number,
        min: 0,
        default: 0
    }
}, { timestamps: true })

productSchema.index({ productName: 'text', category: 'text' });

module.exports = mongoose.model('product', productSchema)