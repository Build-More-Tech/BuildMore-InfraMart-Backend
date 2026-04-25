const Products = require('../models/ProductModel');
const { uploadBuffer } = require('../services/cloudinary');

// ==============================
// ➕ ADD PRODUCT (ADMIN)
// ==============================
async function addproduct(req, res) {
    try {
        const { productName, desc, category, subcategory, price, materialSpecifications, stock, originalPrice, tier, bulkInfo } = req.body;

        if (!productName || !category || !desc || price == null || stock == null) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (isNaN(price) || Number(price) <= 0) {
            return res.status(400).json({ message: "Invalid price" });
        }

        if (isNaN(stock) || Number(stock) < 0) {
            return res.status(400).json({ message: "Invalid stock" });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "Product images required" });
        }

        // Upload each image to Cloudinary and collect secure URLs
        const imageUrls = await Promise.all(
            req.files.map(file => uploadBuffer(file.buffer, 'buildmore/products'))
        );

        const product = await Products.create({
            productName,
            desc,
            category,
            subcategory: subcategory || null,
            price: Number(price),
            originalPrice: originalPrice ? Number(originalPrice) : undefined,
            materialSpecifications,
            stock: Number(stock),
            productImages: imageUrls,
            tier: tier || 'Standard Export',
            bulkInfo: bulkInfo || undefined
        });

        return res.status(201).json({
            success: true,
            productid: product._id,
            message: "Product added successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// 📦 ADMIN GET ALL PRODUCTS
// ==============================
async function getAllProducts(req, res) {
    try {
        const products = await Products.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            products
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// ✏️ UPDATE PRODUCT
// ==============================
async function updateProduct(req, res) {
    try {
        const product = await Products.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// ❌ DELETE PRODUCT
// ==============================
async function deleteProduct(req, res) {
    try {
        const product = await Products.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// 📦 UPDATE STOCK
// ==============================
async function updateStock(req, res) {
    try {
        const { stock } = req.body;

        if (stock == null || stock < 0) {
            return res.status(400).json({ message: "Invalid stock" });
        }

        const product = await Products.findByIdAndUpdate(
            req.params.id,
            { stock },
            { new: true }
        );

        return res.status(200).json({ success: true, product });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// 🔁 TOGGLE AVAILABILITY
// ==============================
async function toggleAvailability(req, res) {
    try {
        const product = await Products.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.availability = !product.availability;
        await product.save();

        return res.status(200).json({ success: true, product });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    addproduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    updateStock,
    toggleAvailability
};