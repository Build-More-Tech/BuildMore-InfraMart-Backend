const mongoose = require('mongoose');

const affiliationSchema = new mongoose.Schema({
    organizationName: {
        type: String,
        required: true,
        trim: true,
        maxlength: [200, 'Organization name too long']
    },

    logo: {
        type: String
    },

    website: {
        type: String,
        trim: true
    },

    partnershipType: {
        type: String,
        enum: [
            'STRATEGIC',
            'TECHNOLOGY',
            'SUPPLIER',
            'CERTIFICATION',
            'INDUSTRY'
        ],
        default: 'STRATEGIC'
    },

    description: {
        type: String,
        trim: true,
        maxlength: [2000, 'Description too long']
    },

    active: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

/**
 * TEXT SEARCH INDEX
 */
affiliationSchema.index({
    organizationName: 'text',
    description: 'text'
});

/**
 * PERFORMANCE INDEX
 */
affiliationSchema.index({
    partnershipType: 1,
    active: 1,
    createdAt: -1
});

module.exports = mongoose.model('Affiliation', affiliationSchema);