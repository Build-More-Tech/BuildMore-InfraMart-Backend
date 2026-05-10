const express = require('express');

const router = express.Router();

const upload = require('../middlewares/upload');

const {
    uploadFile
} = require('../controllers/mediaController');

const {
    isAuthorized
} = require('../services/isAuthorized');

/**
 * UPLOAD FILE
 */
router.post(
    '/upload',

    isAuthorized,

    upload.single('file'),

    uploadFile
);

module.exports = router;