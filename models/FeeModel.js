const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    enabled: { type: Boolean, default: true },
    condition: {
        type: String,
        enum: ['always', 'min_items', 'min_amount'],
        default: 'always'
    },
    conditionValue: { type: Number, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Fee', feeSchema);
