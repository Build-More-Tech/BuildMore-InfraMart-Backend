const Products = require('../models/ProductModel');
const path = require('path');

async function addproduct(req, res) {
    try {
        const { productName, desc, category, price, materialSpecifications, stock } = req.body;

        // ✅ Required fields validation
        if (!productName || !category || !desc || price == null || stock == null) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // ✅ Price validation (must be number)
        if (isNaN(price) || Number(price) <= 0) {
            return res.status(400).json({ message: "Price must be a valid positive number" });
        }

        // ✅ Stock validation (no negative values)
        if (isNaN(stock) || Number(stock) < 0) {
            return res.status(400).json({ message: "Stock cannot be negative" });
        }

        // ✅ Image validation (VERY IMPORTANT)
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: "At least one product image is required" });
        }

        let filenames = [];

        req.files.forEach(item => {
            const filename = `${Date.now()}_${Math.round(Math.random() * 1E9)}${path.extname(item.originalname)}`;
            filenames.push(filename);
            // saving file to aws (future)
            // image data is in item.buffer
        });

        const product = await Products.create({
            productName,
            desc,
            category,
            price: Number(price), // ✅ ensure number
            materialSpecifications,
            stock: Number(stock), // ✅ ensure number
            productImages: filenames
        });

        return res.status(201).json({
            success: true,
            productid: product._id,
            message: "Product added successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Internal server error"
        });
    }
}

// ==============================
// 📦 GET ALL PRODUCTS
// ==============================
async function getAllProducts(req, res) {
    try {
        const products = await Products.find().sort({ createdAt: -1 });

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
async function getSingleProduct(req, res) {
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
// ✏️ UPDATE PRODUCT
// ==============================
async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const product = await Products.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// ❌ DELETE PRODUCT
// ==============================
async function deleteProduct(req, res) {
    try {
        const { id } = req.params;

        const product = await Products.findByIdAndDelete(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Product deleted successfully"
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// 📦 UPDATE STOCK
// ==============================
async function updateStock(req, res) {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (stock == null || stock < 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid stock value"
            });
        }

        const product = await Products.findByIdAndUpdate(
            id,
            { stock },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Stock updated",
            product
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

// ==============================
// 🔁 TOGGLE AVAILABILITY
// ==============================
async function toggleAvailability(req, res) {
    try {
        const { id } = req.params;

        const product = await Products.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        product.availability = !product.availability;
        await product.save();

        return res.status(200).json({
            success: true,
            message: "Availability updated",
            product
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

module.exports = {
    addproduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    toggleAvailability
};
