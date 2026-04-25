const mongoose = require('mongoose');

const complianceDocSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    title: { type: String, required: true },
    type: {
        type: String,
        enum: ['ISO', 'CE', 'RoHS', 'REACH', 'SDS', 'AUDIT', 'OTHER'],
        required: true
    },
    documentUrl: String,
    issuedBy: String,
    issuedAt: Date,
    expiresAt: Date,
    status: {
        type: String,
        enum: ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED'],
        default: 'ACTIVE'
    },
    notes: String
}, { timestamps: true });

function computeStatus(doc) {
    if (!doc.expiresAt) return;
    const now = new Date();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;
    if (doc.expiresAt < now) {
        doc.status = 'EXPIRED';
    } else if ((doc.expiresAt - now) < thirtyDays) {
        doc.status = 'EXPIRING_SOON';
    } else {
        doc.status = 'ACTIVE';
    }
}

// Compute on save AND on every read so status never goes stale
complianceDocSchema.pre('save', function () { computeStatus(this); });
complianceDocSchema.post('init', function () { computeStatus(this); });

module.exports = mongoose.model('compliancedoc', complianceDocSchema);
