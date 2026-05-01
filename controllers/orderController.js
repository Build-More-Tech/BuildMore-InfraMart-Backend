const Order = require('../models/orderModel');
const Product = require('../models/ProductModel');
const { sendOrderConfirmation, sendOrderStatusUpdate } = require('../services/emailService');
const User = require('../models/userModel');

// ==============================
// ➕ CREATE ORDER (Checkout)
// ==============================
async function createOrder(req, res) {
    try {
        const { items, shippingAddress, notes, paymentMethod } = req.body;
        const userId = req.user._id;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Order items are required' });
        }

        if (!shippingAddress || !shippingAddress.area || !shippingAddress.city ||
            !shippingAddress.state || !shippingAddress.pincode || !shippingAddress.country) {
            return res.status(400).json({ success: false, message: 'Complete shipping address is required' });
        }

        for (const item of items) {
            if (!item.product || !item.quantity || item.quantity < 1) {
                return res.status(400).json({ success: false, message: 'Invalid item data' });
            }
        }

        // Fetch all products in one query (fixes N+1)
        const productIds = items.map(i => i.product);
        const products = await Product.find({ _id: { $in: productIds } });
        const productMap = new Map(products.map(p => [p._id.toString(), p]));

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
            paymentMethod: paymentMethod || 'COD',
            notes
        });

        // Send confirmation email (non-blocking — don't fail the request)
        User.findById(userId).then(user => {
            if (user?.email) sendOrderConfirmation(user.email, order).catch(() => {});
        }).catch(() => {});

        return res.status(201).json({ success: true, order });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
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
        return res.status(500).json({ success: false, message: 'Internal server error' });
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
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// ❌ CANCEL ORDER (user)
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
        await Promise.all(
            order.items.map(item =>
                Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
            )
        );

        order.status = 'CANCELLED';
        order.cancelledAt = new Date();
        order.cancelReason = reason || '';
        await order.save();

        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: GET ALL ORDERS
// ==============================
async function adminGetAllOrders(req, res) {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const filter = status ? { status } : {};
        const [orders, total] = await Promise.all([
            Order.find(filter)
                .populate('user', 'name email phone')
                .sort({ createdAt: -1 })
                .skip((Number(page) - 1) * Number(limit))
                .limit(Number(limit)),
            Order.countDocuments(filter)
        ]);
        return res.status(200).json({ success: true, orders, total, page: Number(page) });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
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

        const order = await Order.findById(req.params.id).populate('user', 'email');
        if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

        const prevStatus = order.status;

        // If admin is cancelling an order that wasn't already cancelled, restore stock
        if (status === 'CANCELLED' && prevStatus !== 'CANCELLED') {
            await Promise.all(
                order.items.map(item =>
                    Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } })
                )
            );
            order.cancelledAt = new Date();
        }

        order.status = status;
        await order.save();

        // Send status update email (non-blocking)
        if (order.user?.email) {
            sendOrderStatusUpdate(order.user.email, order).catch(() => {});
        }

        return res.status(200).json({ success: true, order });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
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
