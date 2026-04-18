const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Uploads a buffer to Cloudinary and returns the secure URL.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder  - Cloudinary folder name
 * @returns {Promise<string>} Secure URL
 */
function uploadBuffer(buffer, folder = 'buildmore') {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
}

/**
 * Deletes an image from Cloudinary by its public_id.
 * @param {string} publicId
 */
function deleteImage(publicId) {
    return cloudinary.uploader.destroy(publicId);
}

/**
 * Uploads a raw file (any type) as a raw resource.
 * @param {Buffer} buffer
 * @param {string} folder
 * @param {string} filename
 * @returns {Promise<string>} Secure URL
 */
function uploadRawFile(buffer, folder = 'buildmore-docs', filename = 'document') {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'raw', public_id: filename },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
}

module.exports = { uploadBuffer, deleteImage, uploadRawFile };
