const Offer = require('../models/OfferModel');
const { uploadBuffer, deleteImage, extractPublicId } = require('../services/cloudinary');

// ==============================
// 📋 GET ALL OFFERS (ADMIN)
// ==============================
async function getAllOffers(req, res) {
    try {
        const offers = await Offer.find({}).sort({ order: 1 });
        return res.status(200).json({ success: true, offers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// ➕ CREATE OFFER
// ==============================
async function createOffer(req, res) {
    try {
        const { title, tag, discount, desc, color, order, active } = req.body;

        if (!title || !discount) {
            return res.status(400).json({ success: false, message: 'Title and discount are required' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Offer image is required' });
        }

        const imageUrl = await uploadBuffer(req.file.buffer, 'buildmore/offers');

        const offer = await Offer.create({
            title,
            tag: tag || undefined,
            discount,
            desc: desc || undefined,
            color: color || 'from-orange-600 to-red-700',
            image: imageUrl,
            order: order != null ? Number(order) : 0,
            active: active !== undefined ? active === 'true' || active === true : true,
        });

        return res.status(201).json({ success: true, offer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// ✏️ UPDATE OFFER
// ==============================
async function updateOffer(req, res) {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        const { title, tag, discount, desc, color, order, active } = req.body;

        if (title !== undefined) offer.title = title;
        if (tag !== undefined) offer.tag = tag;
        if (discount !== undefined) offer.discount = discount;
        if (desc !== undefined) offer.desc = desc;
        if (color !== undefined) offer.color = color;
        if (order !== undefined) offer.order = Number(order);
        if (active !== undefined) offer.active = active === 'true' || active === true;

        if (req.file) {
            const oldPublicId = extractPublicId(offer.image);
            if (oldPublicId) await deleteImage(oldPublicId).catch(() => {});
            offer.image = await uploadBuffer(req.file.buffer, 'buildmore/offers');
        }

        await offer.save();
        return res.status(200).json({ success: true, offer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// ❌ DELETE OFFER
// ==============================
async function deleteOffer(req, res) {
    try {
        const offer = await Offer.findByIdAndDelete(req.params.id);
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        const publicId = extractPublicId(offer.image);
        if (publicId) await deleteImage(publicId).catch(() => {});

        return res.status(200).json({ success: true, message: 'Offer deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔁 TOGGLE ACTIVE
// ==============================
async function toggleOffer(req, res) {
    try {
        const offer = await Offer.findById(req.params.id);
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        offer.active = !offer.active;
        await offer.save();

        return res.status(200).json({ success: true, offer });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔢 REORDER OFFERS
// Body: { order: [{ id, order }, ...] }
// ==============================
async function reorderOffers(req, res) {
    try {
        const { order } = req.body;

        if (!Array.isArray(order) || order.length === 0) {
            return res.status(400).json({ success: false, message: 'order array is required' });
        }

        await Promise.all(
            order.map(({ id, order: newOrder }) =>
                Offer.findByIdAndUpdate(id, { order: Number(newOrder) })
            )
        );

        const offers = await Offer.find({}).sort({ order: 1 });
        return res.status(200).json({ success: true, offers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    getAllOffers,
    createOffer,
    updateOffer,
    deleteOffer,
    toggleOffer,
    reorderOffers,
};
