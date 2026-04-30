const ComplianceDoc = require('../models/ComplianceDocModel');
const { uploadRawFile, extractPublicId, deleteRawFile } = require('../services/cloudinary');

// ==============================
// ➕ UPLOAD COMPLIANCE DOCUMENT
// ==============================
async function uploadDoc(req, res) {
    try {
        const { title, type, productId, issuedBy, issuedAt, expiresAt, notes } = req.body;

        if (!title || !type) {
            return res.status(400).json({ success: false, message: 'title and type are required' });
        }

        let documentUrl;
        if (req.file) {
            const filename = `${req.user._id}_${Date.now()}_${title.replace(/\s+/g, '_')}`;
            documentUrl = await uploadRawFile(req.file.buffer, 'buildmore/compliance', filename);
        }

        const doc = await ComplianceDoc.create({
            user: req.user._id,
            product: productId || undefined,
            title,
            type,
            documentUrl,
            issuedBy,
            issuedAt: issuedAt ? new Date(issuedAt) : undefined,
            expiresAt: expiresAt ? new Date(expiresAt) : undefined,
            notes
        });

        return res.status(201).json({ success: true, doc });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 📦 GET USER COMPLIANCE DOCS
// ==============================
async function getUserDocs(req, res) {
    try {
        const { type, status } = req.query;
        const filter = { user: req.user._id };
        if (type) filter.type = type;
        if (status) filter.status = status;

        const docs = await ComplianceDoc.find(filter)
            .populate('product', 'productName category')
            .sort({ createdAt: -1 });

        return res.status(200).json({ success: true, docs });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔍 GET SINGLE DOC
// ==============================
async function getDocById(req, res) {
    try {
        const doc = await ComplianceDoc.findOne({ _id: req.params.id, user: req.user._id })
            .populate('product', 'productName category');
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
        return res.status(200).json({ success: true, doc });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// ❌ DELETE DOC
// ==============================
async function deleteDoc(req, res) {
    try {
        const doc = await ComplianceDoc.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

        if (doc.documentUrl) {
            const publicId = extractPublicId(doc.documentUrl);
            if (publicId) await deleteRawFile(publicId).catch(() => {});
        }

        return res.status(200).json({ success: true, message: 'Document deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: GET ALL DOCS
// ==============================
async function adminGetAllDocs(req, res) {
    try {
        const { type, status, page = 1, limit = 20 } = req.query;
        const filter = {};
        if (type) filter.type = type;
        if (status) filter.status = status;

        const docs = await ComplianceDoc.find(filter)
            .populate('user', 'name email')
            .populate('product', 'productName')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await ComplianceDoc.countDocuments(filter);
        return res.status(200).json({ success: true, docs, total });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: UPDATE COMPLIANCE DOC
// ==============================
async function adminUpdateDoc(req, res) {
    try {
        const { adminNotes, issuedBy, issuedAt, expiresAt } = req.body;

        const doc = await ComplianceDoc.findById(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

        if (adminNotes !== undefined) doc.adminNotes = adminNotes;
        if (issuedBy !== undefined) doc.issuedBy = issuedBy;
        if (issuedAt !== undefined) doc.issuedAt = new Date(issuedAt);
        if (expiresAt !== undefined) doc.expiresAt = new Date(expiresAt);

        await doc.save();
        return res.status(200).json({ success: true, doc });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔐 ADMIN: DELETE COMPLIANCE DOC
// ==============================
async function adminDeleteDoc(req, res) {
    try {
        const doc = await ComplianceDoc.findByIdAndDelete(req.params.id);
        if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

        if (doc.documentUrl) {
            const publicId = extractPublicId(doc.documentUrl);
            if (publicId) await deleteRawFile(publicId).catch(() => {});
        }

        return res.status(200).json({ success: true, message: 'Document deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = { uploadDoc, getUserDocs, getDocById, deleteDoc, adminGetAllDocs, adminUpdateDoc, adminDeleteDoc };
