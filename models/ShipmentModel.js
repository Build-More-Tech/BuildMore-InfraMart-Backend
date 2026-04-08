const mongoose = require('mongoose');

const shipmentEventSchema = new mongoose.Schema({
    status: { type: String, required: true },
    location: String,
    description: String,
    timestamp: { type: Date, default: Date.now }
}, { _id: false });

const shipmentSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'order' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    trackingNumber: { type: String, unique: true },
    carrier: { type: String },
    status: {
        type: String,
        enum: ['PREPARING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'],
        default: 'PREPARING'
    },
    origin: String,
    destination: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    freightClass: String,
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    events: { type: [shipmentEventSchema], default: [] }
}, { timestamps: true });

// Auto-generate tracking number
shipmentSchema.pre('save', async function (next) {
    if (!this.trackingNumber) {
        const rand = Math.random().toString(36).substring(2, 10).toUpperCase();
        this.trackingNumber = `BM-TRK-${rand}`;
    }
    next();
});

module.exports = mongoose.model('shipment', shipmentSchema);
