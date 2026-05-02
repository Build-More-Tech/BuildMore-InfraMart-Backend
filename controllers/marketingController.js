const Banner = require('../models/BannerModel');
const Offer = require('../models/OfferModel');

// ==============================
// 📢 PUBLIC MARKETING APIs
// ==============================

async function getBanners(req, res) {
    try {
        const banners = await Banner.find({ active: true }).sort({ order: 1 });
        return res.status(200).json({ success: true, banners });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

async function getOffers(req, res) {
    try {
        const offers = await Offer.find({ active: true }).sort({ order: 1 });
        return res.status(200).json({ success: true, offers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
}

module.exports = {
    getBanners,
    getOffers
};
