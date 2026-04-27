const Category = require('../models/CategoryModel');
const Products = require('../models/ProductModel');
const { uploadBuffer, deleteImage, extractPublicId } = require('../services/cloudinary');

function toSlug(str) {
    return str.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// ==============================
// GET ALL CATEGORIES (PUBLIC)
// ==============================
async function getAllCategories(req, res) {
    try {
        const categories = await Category.find().sort({ name: 1 });
        return res.status(200).json({ success: true, categories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// ==============================
// GET SINGLE CATEGORY (PUBLIC)
// ==============================
async function getCategoryById(req, res) {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }
        return res.status(200).json({ success: true, category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// ==============================
// CREATE CATEGORY (ADMIN)
// ==============================
async function createCategory(req, res) {
    try {
        const { name, description } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, error: 'Category name is required' });
        }

        let image;
        if (req.file) {
            image = await uploadBuffer(req.file.buffer, 'buildmore/categories');
        }

        const category = await Category.create({ name, description, image });
        return res.status(201).json({ success: true, message: 'Category created', category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: 'Category name already exists' });
        }
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// ==============================
// UPDATE CATEGORY (ADMIN)
// ==============================
async function updateCategory(req, res) {
    try {
        const { name, description } = req.body;
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        if (name) category.name = name;
        if (description !== undefined) category.description = description;

        if (req.file) {
            if (category.image) {
                const publicId = extractPublicId(category.image);
                if (publicId) await deleteImage(publicId).catch(() => {});
            }
            category.image = await uploadBuffer(req.file.buffer, 'buildmore/categories');
        }

        await category.save();
        return res.status(200).json({ success: true, message: 'Category updated', category });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ success: false, error: 'Category name already exists' });
        }
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// ==============================
// DELETE CATEGORY (ADMIN)
// ==============================
async function deleteCategory(req, res) {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        const productCount = await Products.countDocuments({ category: category._id });
        if (productCount > 0) {
            return res.status(409).json({
                success: false,
                error: `Cannot delete — ${productCount} product(s) are linked to this category`
            });
        }

        if (category.image) {
            const publicId = extractPublicId(category.image);
            if (publicId) await deleteImage(publicId).catch(() => {});
        }

        await category.deleteOne();
        return res.status(200).json({ success: true, message: 'Category deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// ==============================
// ADD SUBCATEGORY (ADMIN)
// ==============================
async function addSubcategory(req, res) {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ success: false, error: 'Subcategory name is required' });
        }

        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        const slug = toSlug(name);
        if (category.subcategories.some(s => s.slug === slug)) {
            return res.status(409).json({ success: false, error: 'Subcategory already exists' });
        }

        category.subcategories.push({ name, slug });
        await category.save();

        return res.status(201).json({ success: true, message: 'Subcategory added', category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

// ==============================
// REMOVE SUBCATEGORY (ADMIN)
// ==============================
async function removeSubcategory(req, res) {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, error: 'Category not found' });
        }

        const subIndex = category.subcategories.findIndex(
            s => s._id.toString() === req.params.subId
        );
        if (subIndex === -1) {
            return res.status(404).json({ success: false, error: 'Subcategory not found' });
        }

        category.subcategories.splice(subIndex, 1);
        await category.save();

        return res.status(200).json({ success: true, message: 'Subcategory removed', category });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
}

module.exports = {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    removeSubcategory
};
