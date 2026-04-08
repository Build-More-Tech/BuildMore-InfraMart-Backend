const Products = require('../models/ProductModel');

// ==============================
// 🛒 GET ALL PRODUCTS (PUBLIC)
// ==============================
async function getProducts(req, res) {
    try {
        const { search, category } = req.query;

        let filter = {};

        // 🔍 Search functionality
        if (search) {
            filter.productName = { $regex: search, $options: 'i' };
        }

        // 📂 Category filter
        if (category) {
            filter.category = category;
        }

        const products = await Products.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: products.length,
            products
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// 🔍 GET SINGLE PRODUCT
// ==============================
async function getProductById(req, res) {
    try {
        const { id } = req.params;

        const product = await Products.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// 📂 GET CATEGORIES
// ==============================
async function getCategories(req, res) {
    try {
        const categories = await Products.distinct("category");

        return res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    getProducts,
    getProductById,
    getCategories
};