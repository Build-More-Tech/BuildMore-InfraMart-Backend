const Fee = require('../models/FeeModel');

// ==============================
// GET /api/fees (public)
// ==============================
async function getEnabledFees(req, res) {
    try {
        const fees = await Fee.find({ enabled: true });
        res.json({ success: true, fees });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch fees' });
    }
}

// ==============================
// GET /api/admin/fees (admin)
// ==============================
async function getAllFees(req, res) {
    try {
        const fees = await Fee.find().sort({ createdAt: -1 });
        res.json({ success: true, fees });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to fetch fees' });
    }
}

// ==============================
// POST /api/admin/fees (admin)
// ==============================
async function createFee(req, res) {
    try {
        const { name, amount, enabled, condition, conditionValue } = req.body;

        if (!name || amount == null) {
            return res.status(400).json({ success: false, message: 'name and amount are required' });
        }

        if (isNaN(amount) || Number(amount) < 0) {
            return res.status(400).json({ success: false, message: 'amount must be a non-negative number' });
        }

        const fee = await Fee.create({
            name,
            amount: Number(amount),
            enabled: enabled !== undefined ? Boolean(enabled) : true,
            condition: condition || 'always',
            conditionValue: conditionValue != null ? Number(conditionValue) : null
        });

        res.status(201).json({ success: true, fee });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to create fee' });
    }
}

// ==============================
// PUT /api/admin/fees/:id (admin)
// ==============================
async function updateFee(req, res) {
    try {
        const { name, amount, enabled, condition, conditionValue } = req.body;

        if (amount != null && (isNaN(amount) || Number(amount) < 0)) {
            return res.status(400).json({ success: false, message: 'amount must be a non-negative number' });
        }

        const updates = {};
        if (name !== undefined) updates.name = name;
        if (amount !== undefined) updates.amount = Number(amount);
        if (enabled !== undefined) updates.enabled = Boolean(enabled);
        if (condition !== undefined) updates.condition = condition;
        if (conditionValue !== undefined) updates.conditionValue = conditionValue != null ? Number(conditionValue) : null;

        const fee = await Fee.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });

        if (!fee) {
            return res.status(404).json({ success: false, message: 'Fee not found' });
        }

        res.json({ success: true, fee });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to update fee' });
    }
}

// ==============================
// DELETE /api/admin/fees/:id (admin)
// ==============================
async function deleteFee(req, res) {
    try {
        const fee = await Fee.findByIdAndDelete(req.params.id);

        if (!fee) {
            return res.status(404).json({ success: false, message: 'Fee not found' });
        }

        res.json({ success: true, message: 'Fee deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to delete fee' });
    }
}

// ==============================
// PATCH /api/admin/fees/:id/toggle (admin)
// ==============================
async function toggleFee(req, res) {
    try {
        const fee = await Fee.findById(req.params.id);

        if (!fee) {
            return res.status(404).json({ success: false, message: 'Fee not found' });
        }

        fee.enabled = !fee.enabled;
        await fee.save();

        res.json({ success: true, fee });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to toggle fee' });
    }
}

module.exports = { getEnabledFees, getAllFees, createFee, updateFee, deleteFee, toggleFee };
