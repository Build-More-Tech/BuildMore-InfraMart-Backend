const express = require('express');

const router = express.Router();

const {
    createAffiliation,
    getAffiliations,
    getSingleAffiliation,
    updateAffiliation,
    deleteAffiliation
} = require('../controllers/affiliationController');

const {
    isAuthorized,
    isAdmin
} = require('../services/isAuthorized');

/**
 * PUBLIC ROUTES
 */
router.get('/', getAffiliations);

router.get('/:id', getSingleAffiliation);

/**
 * ADMIN ROUTES
 */
router.post(
    '/admin',
    isAuthorized,
    isAdmin,
    createAffiliation
);

router.put(
    '/admin/:id',
    isAuthorized,
    isAdmin,
    updateAffiliation
);

router.delete(
    '/admin/:id',
    isAuthorized,
    isAdmin,
    deleteAffiliation
);

module.exports = router;