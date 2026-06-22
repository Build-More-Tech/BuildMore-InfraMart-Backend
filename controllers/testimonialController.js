const Testimonial = require('../models/TestimonialModel');

/**
 * CREATE TESTIMONIAL
 */
exports.createTestimonial = async (req, res) => {
    try {

        const testimonial = await Testimonial.create({
            ...req.body,
            createdBy: req.user?._id || null
        });

        return res.status(201).json({
            success: true,
            message: 'Testimonial created successfully',
            testimonial
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET ALL TESTIMONIALS
 */
exports.getTestimonials = async (req, res) => {
    try {

        const {
            page = 1,
            limit = 10,
            search = '',
            featured,
            status = 'ACTIVE'
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

        if (search) {
            query.$text = {
                $search: search
            };
        }

        const testimonials = await Testimonial.find(query)
            .sort({
                displayOrder: 1,
                createdAt: -1
            })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        const total = await Testimonial.countDocuments(query);

        return res.status(200).json({
            success: true,
            total,
            currentPage: Number(page),
            totalPages: Math.ceil(total / limit),
            testimonials
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * GET SINGLE TESTIMONIAL
 */
exports.getSingleTestimonial = async (req, res) => {
    try {

        const testimonial = await Testimonial.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        return res.status(200).json({
            success: true,
            testimonial
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * UPDATE TESTIMONIAL
 */
exports.updateTestimonial = async (req, res) => {
    try {

        const testimonial = await Testimonial.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        Object.assign(testimonial, {
            ...req.body,
            updatedBy: req.user?._id || null
        });

        await testimonial.save();

        return res.status(200).json({
            success: true,
            message: 'Testimonial updated successfully',
            testimonial
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * DELETE TESTIMONIAL (SOFT DELETE)
 */
exports.deleteTestimonial = async (req, res) => {
    try {

        const testimonial = await Testimonial.findOne({
            _id: req.params.id,
            isDeleted: false
        });

        if (!testimonial) {
            return res.status(404).json({
                success: false,
                message: 'Testimonial not found'
            });
        }

        testimonial.isDeleted = true;

        await testimonial.save();

        return res.status(200).json({
            success: true,
            message: 'Testimonial deleted successfully'
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};