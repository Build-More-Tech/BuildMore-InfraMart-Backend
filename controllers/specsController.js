const SpecSheet = require('../models/SpecSheetModel');
const Product = require('../models/ProductModel');
const { uploadRawFile, extractPublicId, deleteRawFile } = require('../services/cloudinary');

// ==============================
// 📦 GET SPEC SHEETS FOR A PRODUCT
// ==============================
async function getSpecsByProduct(req, res) {
    try {
        const { productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        const specs = await SpecSheet.find({ product: productId })
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, specs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔍 GET ALL SPEC SHEETS (with product info)
// ==============================
async function getAllSpecs(req, res) {
    try {
        const { fileType, page = 1, limit = 20 } = req.query;
        const filter = fileType ? { fileType } : {};

        const specs = await SpecSheet.find(filter)
            .populate('product', 'productName category')
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await SpecSheet.countDocuments(filter);
        return res.status(200).json({ success: true, specs, total });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: UPLOAD SPEC SHEET
// ==============================
async function uploadSpecSheet(req, res) {
    try {
        const { productId, title, fileType, version, description } = req.body;

        if (!productId || !title) {
            return res.status(400).json({ success: false, message: 'productId and title are required' });
        }

        const product = await Product.findById(productId);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        let fileUrl, fileSize;
        if (req.file) {
            const filename = `${productId}_${Date.now()}_${title.replace(/\s+/g, '_')}`;
            fileUrl = await uploadRawFile(req.file.buffer, 'buildmore/specs', filename);
            fileSize = `${(req.file.size / 1024).toFixed(1)} KB`;
        }

        const spec = await SpecSheet.create({
            product: productId,
            title,
            fileUrl,
            fileType: fileType || 'PDF',
            fileSize,
            version: version || '1.0',
            description,
            uploadedBy: req.user._id
        });

        return res.status(201).json({ success: true, spec });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: DELETE SPEC SHEET
// ==============================
async function deleteSpecSheet(req, res) {
    try {
        const spec = await SpecSheet.findByIdAndDelete(req.params.id);
        if (!spec) return res.status(404).json({ success: false, message: 'Spec sheet not found' });

        if (spec.fileUrl) {
            const publicId = extractPublicId(spec.fileUrl);
            if (publicId) await deleteRawFile(publicId).catch(() => {});
        }

        return res.status(200).json({ success: true, message: 'Spec sheet deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = { getSpecsByProduct, getAllSpecs, uploadSpecSheet, deleteSpecSheet };
