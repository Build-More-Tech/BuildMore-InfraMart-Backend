const Media = require('../models/MediaModel');

const {
    uploadBuffer,
    uploadRawFile
} = require('../services/cloudinary');

/**
 * UPLOAD FILE
 */
exports.uploadFile = async (req, res) => {

    try {

        if (!req.file) {

            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const folder = req.body.folder || 'general';

        let fileUrl;

        /**
         * IMAGE UPLOAD
         */
        if (
            req.file.mimetype.startsWith('image/')
        ) {

            fileUrl = await uploadBuffer(
                req.file.buffer,
                folder
            );

        } else {

            /**
             * RAW FILE UPLOAD
             */
            fileUrl = await uploadRawFile(
                req.file.buffer,
                folder,
                Date.now().toString()
            );
        }

        /**
         * SAVE MEDIA
         */
        const media = await Media.create({

            fileName: Date.now().toString(),

            originalName: req.file.originalname,

            fileUrl,

            mimeType: req.file.mimetype,

            size: req.file.size,

            folder,

            uploadedBy: req.user?._id || null,

            provider: 'CLOUDINARY'
        });

        return res.status(201).json({

            success: true,

            message: 'File uploaded successfully',

            media
        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message
        });
    }
};