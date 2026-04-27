const RFQ = require('../models/RFQModel');
const Product = require('../models/ProductModel');

// ==============================
// ➕ CREATE RFQ (empty draft)
// ==============================
async function createRFQ(req, res) {
    try {
        const { notes, expiresAt } = req.body;
        const rfq = await RFQ.create({
            user: req.user._id,
            notes,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined
        });
        return res.status(201).json({ success: true, rfq });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 📦 GET USER RFQs
// ==============================
async function getUserRFQs(req, res) {
    try {
        const { status } = req.query;
        const filter = { user: req.user._id };
        if (status) filter.status = status;
        const rfqs = await RFQ.find(filter).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, rfqs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔍 GET SINGLE RFQ
// ==============================
async function getRFQById(req, res) {
    try {
        const rfq = await RFQ.findOne({ _id: req.params.id, user: req.user._id });
        if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });
        return res.status(200).json({ success: true, rfq });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// ➕ ADD ITEM TO RFQ
// ==============================
async function addItem(req, res) {
    try {
        const { productId, productName, quantity, targetPrice, notes } = req.body;

        if (!productName || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'productName and quantity are required' });
        }

        let resolvedName = productName;
        if (productId) {
            const product = await Product.findById(productId);
            if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
            resolvedName = product.productName;
        }

        const rfq = await RFQ.findOne({ _id: req.params.id, user: req.user._id });
        if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });
        if (rfq.status !== 'DRAFT') {
            return res.status(400).json({ success: false, message: 'Can only add items to DRAFT RFQs' });
        }

        rfq.items.push({ product: productId || undefined, productName: resolvedName, quantity, targetPrice, notes });
        await rfq.save();
        return res.status(200).json({ success: true, rfq });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// ❌ REMOVE ITEM FROM RFQ
// ==============================
async function removeItem(req, res) {
    try {
        const rfq = await RFQ.findOne({ _id: req.params.id, user: req.user._id });
        if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });
        if (rfq.status !== 'DRAFT') {
            return res.status(400).json({ success: false, message: 'Can only modify DRAFT RFQs' });
        }

        rfq.items = rfq.items.filter(item => item._id.toString() !== req.params.itemId);
        await rfq.save();
        return res.status(200).json({ success: true, rfq });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 📨 SUBMIT RFQ
// ==============================
async function submitRFQ(req, res) {
    try {
        const rfq = await RFQ.findOne({ _id: req.params.id, user: req.user._id });
        if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });
        if (rfq.status !== 'DRAFT') {
            return res.status(400).json({ success: false, message: 'Only DRAFT RFQs can be submitted' });
        }
        if (rfq.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Add at least one item before submitting' });
        }

        rfq.status = 'SUBMITTED';
        await rfq.save();
        return res.status(200).json({ success: true, rfq });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// ✅ USER: RESPOND TO QUOTED RFQ (ACCEPT / REJECT)
// ==============================
async function respondToRFQ(req, res) {
    try {
        const { action } = req.body;

        if (!['ACCEPT', 'REJECT'].includes(action)) {
            return res.status(400).json({ success: false, message: 'action must be ACCEPT or REJECT' });
        }

        const rfq = await RFQ.findOne({ _id: req.params.id, user: req.user._id });
        if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });

        if (rfq.status !== 'QUOTED') {
            return res.status(400).json({ success: false, message: 'Only QUOTED RFQs can be accepted or rejected' });
        }

        rfq.status = action === 'ACCEPT' ? 'ACCEPTED' : 'REJECTED';
        await rfq.save();
        return res.status(200).json({ success: true, rfq });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: GET ALL RFQs
// ==============================
async function adminGetAllRFQs(req, res) {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = status ? { status } : {};
        const rfqs = await RFQ.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await RFQ.countDocuments(filter);
        return res.status(200).json({ success: true, rfqs, total });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: UPDATE RFQ STATUS + ADD QUOTED PRICES
// ==============================
async function adminUpdateRFQ(req, res) {
    try {
        const { status, adminNotes, quotedItems } = req.body;
        const validStatuses = ['UNDER_REVIEW', 'QUOTED', 'ACCEPTED', 'REJECTED', 'EXPIRED'];

        const rfq = await RFQ.findById(req.params.id);
        if (!rfq) return res.status(404).json({ success: false, message: 'RFQ not found' });

        if (status && validStatuses.includes(status)) rfq.status = status;
        if (adminNotes !== undefined) rfq.adminNotes = adminNotes;

        // Update quoted prices on items
        if (Array.isArray(quotedItems)) {
            for (const qi of quotedItems) {
                const item = rfq.items.id(qi.itemId);
                if (item) item.quotedPrice = qi.quotedPrice;
            }
        }

        await rfq.save();
        return res.status(200).json({ success: true, rfq });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createRFQ,
    getUserRFQs,
    getRFQById,
    addItem,
    removeItem,
    submitRFQ,
    respondToRFQ,
    adminGetAllRFQs,
    adminUpdateRFQ
};
