const { Queue } = require('bullmq');

const redisConnection = require('../services/redis');

const emailQueue = new Queue(
    'emailQueue',
    {
        connection: redisConnection
    }
);

module.exports = emailQueue;