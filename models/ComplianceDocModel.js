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

// Auto-compute status before save
complianceDocSchema.pre('save', function (next) {
    if (this.expiresAt) {
        const now = new Date();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000;
        if (this.expiresAt < now) {
            this.status = 'EXPIRED';
        } else if ((this.expiresAt - now) < thirtyDays) {
            this.status = 'EXPIRING_SOON';
        } else {
            this.status = 'ACTIVE';
        }
    }
    next();
});

module.exports = mongoose.model('compliancedoc', complianceDocSchema);
