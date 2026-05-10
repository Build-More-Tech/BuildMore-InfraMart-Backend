const multer = require('multer');

/**
 * MEMORY STORAGE
 */
const storage = multer.memoryStorage();

/**
 * FILE FILTER
 */
const fileFilter = (req, file, cb) => {

    const allowedMimeTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'application/pdf'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {

        return cb(
            new Error('Unsupported file type'),
            false
        );
    }

    cb(null, true);
};

/**
 * MULTER CONFIG
 */
const upload = multer({
    storage,

    limits: {
        fileSize: 10 * 1024 * 1024
    },

    fileFilter
});

module.exports = upload;