const mongoose = require('mongoose');
const Counter = require('./CounterModel');

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
    building: String,
    area: { type: String, required: true },
    landmark: String,
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
    alternatephone: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    orderNumber: { type: String, unique: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
        default: 'PENDING'
    },
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
        type: String,
        enum: ['ONLINE', 'COD'],
        default: 'COD'
    },
    notes: String,
    cancelledAt: Date,
    cancelReason: String
}, { timestamps: true });

// Auto-generate order number before save (atomic — no race condition)
orderSchema.pre('save', async function () {
    if (!this.orderNumber) {
        const seq = await Counter.nextSequence('order');
        this.orderNumber = `BM-${String(seq).padStart(6, '0')}`;
    }
});

// Indexes for common query patterns
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('order', orderSchema);
