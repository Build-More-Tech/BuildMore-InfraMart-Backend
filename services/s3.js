const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');

const path = require('path');

const s3 = new S3Client({
    region: process.env.SPACES_REGION,

    endpoint: process.env.SPACES_ENDPOINT,

    credentials: {
        accessKeyId: process.env.SPACES_KEY,
        secretAccessKey: process.env.SPACES_SECRET
    }
});

/**
 * UPLOAD FILE
 */
exports.uploadToS3 = async (
    file,
    folder = 'general'
) => {

    const extension = path.extname(file.originalname);

    const fileName = `${folder}/${Date.now()}${extension}`;

    const params = {

        Bucket: process.env.SPACES_BUCKET,

        Key: fileName,

        Body: file.buffer,

        ContentType: file.mimetype,

        ACL: 'public-read'
    };

    await s3.send(
        new PutObjectCommand(params)
    );

    const fileUrl =
        `${process.env.SPACES_CDN_ENDPOINT}/${fileName}`;

    return {
        fileName,
        fileUrl
    };
};

/**
 * DELETE FILE
 */
exports.deleteFromS3 = async (key) => {

    const params = {

        Bucket: process.env.SPACES_BUCKET,

        Key: key
    };

    return s3.send(
        new DeleteObjectCommand(params)
    );
};