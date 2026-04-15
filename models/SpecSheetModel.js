const mongoose = require('mongoose');

const specSheetSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product', required: true },
    title: { type: String, required: true },
    fileUrl: String,
    fileType: {
        type: String,
        enum: ['PDF', 'CAD', 'XLSX', 'DWG', 'OTHER'],
        default: 'PDF'
    },
    fileSize: String,
    version: { type: String, default: '1.0' },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    description: String
}, { timestamps: true });

module.exports = mongoose.model('specsheet', specSheetSchema);
