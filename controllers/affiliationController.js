const Affiliation = require('../models/AffiliationModel');

/**
 * CREATE AFFILIATION
 */
exports.createAffiliation = async (req, res) => {
    try {

        const affiliation = await Affiliation.create({
            ...req.body,
            createdBy: req.user?._id || null
        });

        return res.status(201).json({
            success: true,
            message: 'Affiliation created successfully',
            affiliation
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET ALL AFFILIATIONS
 */
exports.getAffiliations = async (req, res) => {
    try {

        const {
            page = 1,
            limit = 10,
            search = '',
            featured,
            status = 'ACTIVE',
            partnershipType
        } = req.query;

        const query = {
            isDeleted: false
        };

        if (status) {
            query.status = status;
        }

        if (featured !== undefined) {
            query.featured = featured === 'true';
        }

        if (partnershipType) {
            query.partnershipType = partnershipType;
        }

        if (search) {
            query.$text = {
                $search: search
            };
        }

        const affiliations = await Affiliation.find(query)
            .sort({
                displayOrder: 1,
                createdAt: -1
            })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Affiliation.countDocuments(query);

        return res.status(200).json({
            success: true,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            affiliations
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET SINGLE AFFILIATION
 */
exports.getSingleAffiliation = async (req, res) => {
    try {

        const affiliation = await Affiliation.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!affiliation) {
            return res.status(404).json({
                success: false,
                message: 'Affiliation not found'
            });
        }

        return res.status(200).json({
            success: true,
            affiliation
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * UPDATE AFFILIATION
 */
exports.updateAffiliation = async (req, res) => {
    try {

        const affiliation = await Affiliation.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!affiliation) {
            return res.status(404).json({
                success: false,
                message: 'Affiliation not found'
            });
        }

        Object.assign(affiliation, {
            ...req.body,
            updatedBy: req.user?._id || null
        });

        await affiliation.save();

        return res.status(200).json({
            success: true,
            message: 'Affiliation updated successfully',
            affiliation
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * DELETE AFFILIATION (SOFT DELETE)
 */
exports.deleteAffiliation = async (req, res) => {
    try {

        const affiliation = await Affiliation.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!affiliation) {
            return res.status(404).json({
                success: false,
                message: 'Affiliation not found'
            });
        }

        affiliation.isDeleted = true;

        await affiliation.save();

        return res.status(200).json({
            success: true,
            message: 'Affiliation deleted successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};