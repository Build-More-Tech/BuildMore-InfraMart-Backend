const Banner = require('../models/BannerModel');
const { uploadBuffer, deleteImage, extractPublicId } = require('../services/cloudinary');

// ==============================
// 📋 GET ALL BANNERS (ADMIN)
// ==============================
async function getAllBanners(req, res) {
    try {
        const banners = await Banner.find({}).sort({ order: 1 });
        return res.status(200).json({ success: true, banners });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// ➕ CREATE BANNER
// ==============================
async function createBanner(req, res) {
    try {
        const { tag, headline, headlineAccent, sub, cta, ctaTo, order, active } = req.body;

        if (!headline) {
            return res.status(400).json({ success: false, message: 'Headline is required' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Banner image is required' });
        }

        const imageUrl = await uploadBuffer(req.file.buffer, 'buildmore/banners');

        const banner = await Banner.create({
            image: imageUrl,
            tag: tag || undefined,
            headline,
            headlineAccent: headlineAccent || undefined,
            sub: sub || undefined,
            cta: cta || 'Shop Now',
            ctaTo: ctaTo || '/products',
            order: order != null ? Number(order) : 0,
            active: active !== undefined ? active === 'true' || active === true : true,
        });

        return res.status(201).json({ success: true, banner });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// ✏️ UPDATE BANNER
// ==============================
async function updateBanner(req, res) {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        const { tag, headline, headlineAccent, sub, cta, ctaTo, order, active } = req.body;

        if (tag !== undefined) banner.tag = tag;
        if (headline !== undefined) banner.headline = headline;
        if (headlineAccent !== undefined) banner.headlineAccent = headlineAccent;
        if (sub !== undefined) banner.sub = sub;
        if (cta !== undefined) banner.cta = cta;
        if (ctaTo !== undefined) banner.ctaTo = ctaTo;
        if (order !== undefined) banner.order = Number(order);
        if (active !== undefined) banner.active = active === 'true' || active === true;

        if (req.file) {
            // Delete old image from Cloudinary
            const oldPublicId = extractPublicId(banner.image);
            if (oldPublicId) await deleteImage(oldPublicId).catch(() => {});

            banner.image = await uploadBuffer(req.file.buffer, 'buildmore/banners');
        }

        await banner.save();
        return res.status(200).json({ success: true, banner });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// ❌ DELETE BANNER
// ==============================
async function deleteBanner(req, res) {
    try {
        const banner = await Banner.findByIdAndDelete(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        const publicId = extractPublicId(banner.image);
        if (publicId) await deleteImage(publicId).catch(() => {});

        return res.status(200).json({ success: true, message: 'Banner deleted' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔁 TOGGLE ACTIVE
// ==============================
async function toggleBanner(req, res) {
    try {
        const banner = await Banner.findById(req.params.id);
        if (!banner) {
            return res.status(404).json({ success: false, message: 'Banner not found' });
        }

        banner.active = !banner.active;
        await banner.save();

        return res.status(200).json({ success: true, banner });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

// ==============================
// 🔢 REORDER BANNERS
// Body: { order: [{ id, order }, ...] }
// ==============================
async function reorderBanners(req, res) {
    try {
        const { order } = req.body;

        if (!Array.isArray(order) || order.length === 0) {
            return res.status(400).json({ success: false, message: 'order array is required' });
        }

        await Promise.all(
            order.map(({ id, order: newOrder }) =>
                Banner.findByIdAndUpdate(id, { order: Number(newOrder) })
            )
        );

        const banners = await Banner.find({}).sort({ order: 1 });
        return res.status(200).json({ success: true, banners });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
}

module.exports = {
    getAllBanners,
    createBanner,
    updateBanner,
    deleteBanner,
    toggleBanner,
    reorderBanners,
};
