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

module.exports = { addproduct };