const Products = require('../models/ProductModel');
const Category = require('../models/CategoryModel');
const { uploadBuffer, deleteImage, extractPublicId } = require('../services/cloudinary');

// ==============================
// ➕ ADD PRODUCT (ADMIN)
// ==============================
async function addproduct(req, res) {
    try {
        const { productName, desc, categoryId, subcategory, price, materialSpecifications, stock, originalPrice, tier, bulkInfo } = req.body;

        if (!productName || !categoryId || !desc || price == null || stock == null) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const categoryExists = await Category.findById(categoryId);
        if (!categoryExists) {
            return res.status(404).json({ message: "Category not found" });
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
            category: categoryId,
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
        const products = await Products.find().populate('category', 'name slug').sort({ createdAt: -1 });

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
        const { productName, desc, categoryId, subcategory, price, originalPrice,
            materialSpecifications, stock, tier, bulkInfo, keepImages } = req.body;

        const updates = {};
        if (productName !== undefined) updates.productName = productName;
        if (desc !== undefined) updates.desc = desc;
        if (categoryId !== undefined) {
            const categoryExists = await Category.findById(categoryId);
            if (!categoryExists) {
                return res.status(404).json({ message: "Category not found" });
            }
            updates.category = categoryId;
        }
        if (subcategory !== undefined) updates.subcategory = subcategory || null;
        if (price !== undefined) updates.price = Number(price);
        if (originalPrice !== undefined) updates.originalPrice = Number(originalPrice);
        if (materialSpecifications !== undefined) updates.materialSpecifications = materialSpecifications;
        if (stock !== undefined) updates.stock = Number(stock);
        if (tier !== undefined) updates.tier = tier;
        if (bulkInfo !== undefined) updates.bulkInfo = bulkInfo;

        // Handle images: keep existing + upload new ones
        if (keepImages !== undefined || (req.files && req.files.length > 0)) {
            const currentProduct = await Products.findById(req.params.id);
            if (!currentProduct) {
                return res.status(404).json({ message: "Product not found" });
            }

            // keepImages may be a single string or an array
            const keptUrls = keepImages
                ? (Array.isArray(keepImages) ? keepImages : [keepImages])
                : [];

            // Delete Cloudinary images that were removed
            const removedUrls = (currentProduct.productImages || []).filter(url => !keptUrls.includes(url));
            await Promise.allSettled(
                removedUrls.map(url => {
                    const publicId = extractPublicId(url);
                    return publicId ? deleteImage(publicId) : Promise.resolve();
                })
            );

            // Upload new images
            let newUrls = [];
            if (req.files && req.files.length > 0) {
                newUrls = await Promise.all(
                    req.files.map(file => uploadBuffer(file.buffer, 'buildmore/products'))
                );
            }

            updates.productImages = [...keptUrls, ...newUrls];
        }

        const product = await Products.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        ).populate('category', 'name slug');

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        return res.status(200).json({ success: true, product });

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
        const product = await Products.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        // Delete images from Cloudinary (non-blocking — don't fail the request)
        if (product.productImages && product.productImages.length > 0) {
            await Promise.allSettled(
                product.productImages.map(url => {
                    const publicId = extractPublicId(url);
                    return publicId ? deleteImage(publicId) : Promise.resolve();
                })
            );
        }

        return res.status(200).json({ success: true, message: "Deleted successfully" });

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