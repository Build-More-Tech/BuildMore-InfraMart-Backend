const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    fileName: {
        type: String,
        required: true,
        trim: true
    },

    originalName: {
        type: String,
        trim: true
    },

    fileUrl: {
        type: String,
        required: true
    },

    mimeType: {
        type: String,
        required: true
    },

    size: {
        type: Number,
        required: true
    },

    folder: {
        type: String,
        default: 'general'
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    provider: {
        type: String,
        enum: ['CLOUDINARY', 'S3', 'SPACES'],
        default: 'CLOUDINARY'
    },

    publicId: {
        type: String
    }

}, { timestamps: true });

/**
 * PERFORMANCE INDEXES
 */
mediaSchema.index({
    folder: 1,
    createdAt: -1
});

mediaSchema.index({
    uploadedBy: 1
});

module.exports = mongoose.model('Media', mediaSchema);