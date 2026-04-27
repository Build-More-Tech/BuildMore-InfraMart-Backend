const Products = require('../models/ProductModel');

// ==============================
// 🛒 GET ALL PRODUCTS (PUBLIC)
// ==============================
async function getProducts(req, res) {
    try {
        const { search, categoryId, subcategory, page = 1, limit = 20 } = req.query;

        const filter = {};

        if (search) {
            filter.$text = { $search: search };
        }
        if (categoryId) filter.category = categoryId;
        if (subcategory) filter.subcategory = subcategory;

        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            Products.find(filter).populate('category', 'name slug').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
            Products.countDocuments(filter)
        ]);

        return res.status(200).json({
            success: true,
            count: products.length,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
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

        const product = await Products.findById(id).populate('category', 'name slug');

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

module.exports = {
    getProducts,
    getProductById
};