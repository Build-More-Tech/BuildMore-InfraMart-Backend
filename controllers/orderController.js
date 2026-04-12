const Order = require('../models/orderModel');
const Product = require('../models/ProductModel');

// ==============================
// 🛒 CREATE ORDER
// ==============================
async function createOrder(req, res) {
    try {
        const userId = req.user._id;
        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({
                message: "Order items required"
            });
        }

        let totalAmount = 0;
        let orderItems = [];

        // ✅ validate products + calculate total
        for (let item of items) {
            const product = await Product.findById(item.product);

            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    message: `Insufficient stock for ${product.productName}`
                });
            }

            totalAmount += product.price * item.quantity;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                price: product.price
            });

            // 🔻 reduce stock
            product.stock -= item.quantity;
            await product.save();
        }

        const order = await Order.create({
            user: userId,
            items: orderItems,
            totalAmount
        });

        return res.status(201).json({
            success: true,
            order
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// 📦 GET USER ORDERS
// ==============================
async function getOrders(req, res) {
    try {
        const userId = req.user._id;

        const orders = await Order.find({ user: userId })
            .populate('items.product')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            orders
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// 🔍 GET SINGLE ORDER
// ==============================
async function getOrderById(req, res) {
    try {
        const order = await Order.findById(req.params.id)
            .populate('items.product');

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        return res.status(200).json({
            success: true,
            order
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// ❌ CANCEL ORDER
// ==============================
async function cancelOrder(req, res) {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.status === 'CANCELLED') {
            return res.status(400).json({
                message: "Order already cancelled"
            });
        }

        order.status = 'CANCELLED';
        await order.save();

        return res.status(200).json({
            success: true,
            message: "Order cancelled"
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    createOrder,
    getOrders,
    getOrderById,
    cancelOrder
};