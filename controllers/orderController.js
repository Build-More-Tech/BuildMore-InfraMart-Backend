const Order = require('../models/OrderModel');
const Product = require('../models/ProductModel');

// ==============================
// ➕ CREATE ORDER (Checkout)
// ==============================
async function createOrder(req, res) {
    try {
        const { items, shippingAddress, notes } = req.body;
        const userId = req.user._id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order items are required' });
        }

        if (!shippingAddress || !shippingAddress.area || !shippingAddress.city ||
            !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.country) {
            return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
        }

        // Validate item fields
        for (const item of items) {
            if (!item.product || !item.quantity || item.quantity < 1) {
                return res.status(400).json({ success: false, message: 'Invalid item data' });
            }
        }

        // Fetch all products in one query (fixes N+1)
        const productIds = items.map(i => i.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map(p => [p._id.toString(), p]));

        // Validate all products and build order items
        const orderItems = [];
        let totalAmount = 0;

        for (const item of items) {
            const product = productMap.get(item.product.toString());
            if (!product) {
                return res.status(404).json({ success: false, message: `Product ${item.product} not found` });
            }
            if (!product.availability) {
                return res.status(400).json({ success: false, message: `Product "${product.productName}" is not available` });
            }
            if (product.stock < item.quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for "${product.productName}". Available: ${product.stock}` });
            }

            orderItems.push({
                product: product._id,
                productName: product.productName,
                price: product.price,
                quantity: item.quantity
            });
            totalAmount += product.price * item.quantity;
        }

        // Atomically deduct stock — rolls back previous deductions if any item fails
        const deducted = [];
        for (const item of orderItems) {
            const updated = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } }
            );
            if (!updated) {
                // Roll back already-deducted stock
                await Promise.all(
                    deducted.map(d => Product.findByIdAndUpdate(d.product, { $inc: { stock: d.quantity } }))
                );
                const name = productMap.get(item.product.toString())?.productName;
                return res.status(400).json({ success: false, message: `Insufficient stock for "${name}". Please try again.` });
            }
            deducted.push(item);
        }

        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount,
            shippingAddress,
            notes
        });

        return res.status(201).json({ success: true, order });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 📦 GET USER ORDERS
// ==============================
async function getUserOrders(req, res) {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, orders });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔍 GET SINGLE ORDER
// ==============================
async function getOrderById(req, res) {
    try {
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// ❌ CANCEL ORDER
// ==============================
async function cancelOrder(req, res) {
    try {
        const { reason } = req.body;
        const order = await Order.findOne({ _id: req.params.id, user: req.user._id });

        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status)) {
            return res.status(400).json({ success: false, message: `Cannot cancel an order with status: ${order.status}` });
        }

        // Restore stock
        for (const item of order.items) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
        }

        order.status = 'CANCELLED';
        order.cancelledAt = new Date();
        order.cancelReason = reason || '';
        await order.save();

        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: GET ALL ORDERS
// ==============================
async function adminGetAllOrders(req, res) {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = status ? { status } : {};
        const orders = await Order.find(filter)
            .populate('user', 'name email phone')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Order.countDocuments(filter);
        return res.status(200).json({ success: true, orders, total, page: Number(page) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: UPDATE ORDER STATUS
// ==============================
async function adminUpdateOrderStatus(req, res) {
    try {
        const { status } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    cancelOrder,
    adminGetAllOrders,
    adminUpdateOrderStatus
};
