const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({

    clientName: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Client name too long']
    },

    company: {
        type: String,
        trim: true,
        maxlength: [150, 'Company name too long']
    },

    designation: {
        type: String,
        trim: true,
        maxlength: [100, 'Designation too long']
    },

    message: {
        type: String,
        required: true,
        trim: true,
        minlength: [10, 'Message too short'],
        maxlength: [3000, 'Message too long']
    },

    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5
    },

    image: {
        type: String,
        default: null
    },

    companyLogo: {
        type: String,
        default: null
    },

    featured: {
        type: Boolean,
        default: false
    },

    verified: {
        type: Boolean,
        default: false
    },

    status: {
        type: String,
        enum: ['ACTIVE', 'INACTIVE'],
        default: 'ACTIVE'
    },

    displayOrder: {
        type: Number,
        default: 0
    },

    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],

    source: {
        type: String,
        enum: ['WEBSITE', 'GOOGLE', 'LINKEDIN', 'MANUAL'],
        default: 'MANUAL'
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

/**
 * TEXT SEARCH INDEX
 */
testimonialSchema.index({
    clientName: 'text',
    company: 'text',
    message: 'text',
    tags: 'text'
});

/**
 * PERFORMANCE INDEXES
 */
testimonialSchema.index({
    featured: 1,
    status: 1,
    displayOrder: 1,
    createdAt: -1
});

testimonialSchema.index({
    isDeleted: 1
});

module.exports = mongoose.model('Testimonial', testimonialSchema);