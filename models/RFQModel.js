const mongoose = require('mongoose');
const Counter = require('./CounterModel');

const rfqItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    targetPrice: { type: Number, min: 0 },
    quotedPrice: { type: Number, min: 0 },
    notes: String
}, { _id: true });

const rfqSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    rfqNumber: { type: String, unique: true },
    items: { type: [rfqItemSchema], default: [] },
    status: {
        type: String,
        enum: ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED'],
        default: 'DRAFT'
    },
    totalEstimatedValue: { type: Number, default: 0 },
    notes: String,
    adminNotes: String,
    expiresAt: Date
}, { timestamps: true });

// Auto-generate RFQ number (atomic — no race condition)
rfqSchema.pre('save', async function () {
    if (!this.rfqNumber) {
        const seq = await Counter.nextSequence('rfq');
        this.rfqNumber = `RFQ-${String(seq).padStart(5, '0')}`;
    }
    // Recalculate estimated value
    this.totalEstimatedValue = this.items.reduce((sum, item) => {
        return sum + (item.targetPrice || 0) * item.quantity;
    }, 0);
});

module.exports = mongoose.model('rfq', rfqSchema);
