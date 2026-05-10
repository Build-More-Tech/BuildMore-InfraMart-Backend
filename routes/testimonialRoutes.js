const express = require('express');

const router = express.Router();

const {
    createTestimonial,
    getTestimonials,
    getSingleTestimonial,
    updateTestimonial,
    deleteTestimonial
} = require('../controllers/testimonialController');

const {
    isAuthorized,
    isAdmin
} = require('../services/isAuthorized');

/**
 * PUBLIC ROUTES
 */
router.get('/', getTestimonials);

router.get('/:id', getSingleTestimonial);

/**
 * ADMIN ROUTES
 */
router.post(
    '/admin',
    isAuthorized,
    isAdmin,
    createTestimonial
);

router.put(
    '/admin/:id',
    isAuthorized,
    isAdmin,
    updateTestimonial
);

router.delete(
    '/admin/:id',
    isAuthorized,
    isAdmin,
    deleteTestimonial
);

module.exports = router;