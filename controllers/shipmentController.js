const Shipment = require('../models/ShipmentModel');

// ==============================
// 📦 GET USER SHIPMENTS
// ==============================
async function getUserShipments(req, res) {
    try {
        const shipments = await Shipment.find({ user: req.user._id })
            .populate('order', 'orderNumber totalAmount status')
            .sort({ createdAt: -1 });
        return res.status(200).json({ success: true, shipments });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔍 TRACK SHIPMENT (by tracking number or ID)
// ==============================
async function trackShipment(req, res) {
    try {
        const { identifier } = req.params;
        const shipment = await Shipment.findOne({
            $or: [
                { trackingNumber: identifier },
                { _id: identifier.match(/^[0-9a-fA-F]{24}$/) ? identifier : null }
            ],
            user: req.user._id
        }).populate('order', 'orderNumber totalAmount');

        if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });
        return res.status(200).json({ success: true, shipment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: CREATE SHIPMENT
// ==============================
async function adminCreateShipment(req, res) {
    try {
        const { orderId, userId, carrier, origin, destination, estimatedDelivery, freightClass, weight, dimensions } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId is required' });
        }

        const shipment = await Shipment.create({
            order: orderId || undefined,
            user: userId,
            carrier,
            origin,
            destination,
            estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
            freightClass,
            weight,
            dimensions,
            events: [{ status: 'PREPARING', description: 'Shipment created and being prepared' }]
        });

        return res.status(201).json({ success: true, shipment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: UPDATE SHIPMENT STATUS + ADD EVENT
// ==============================
async function adminUpdateShipment(req, res) {
    try {
        const { status, location, description } = req.body;
        const validStatuses = ['PREPARING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'];

        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) return res.status(404).json({ success: false, message: 'Shipment not found' });

        if (status && validStatuses.includes(status)) {
            shipment.status = status;
            if (status === 'DELIVERED') shipment.deliveredAt = new Date();
        }

        shipment.events.push({
            status: status || shipment.status,
            location,
            description: description || `Status updated to ${status || shipment.status}`
        });

        await shipment.save();
        return res.status(200).json({ success: true, shipment });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: GET ALL SHIPMENTS
// ==============================
async function adminGetAllShipments(req, res) {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = status ? { status } : {};
        const shipments = await Shipment.find(filter)
            .populate('user', 'name email')
            .populate('order', 'orderNumber totalAmount')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Shipment.countDocuments(filter);
        return res.status(200).json({ success: true, shipments, total });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getUserShipments,
    trackShipment,
    adminCreateShipment,
    adminUpdateShipment,
    adminGetAllShipments
};
