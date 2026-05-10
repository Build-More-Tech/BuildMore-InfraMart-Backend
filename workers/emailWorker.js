const { Worker } = require('bullmq');

const redisConnection = require('../services/redis');

const worker = new Worker(

    'emailQueue',

    async job => {

        console.log(
            'Processing Email Job:',
            job.data
        );

        /**
         * EMAIL LOGIC HERE
         */

        return {
            success: true
        };
    },

    {
        connection: redisConnection
    }
);

worker.on('completed', job => {

    console.log(
        `Job ${job.id} completed`
    );
});

worker.on('failed', (job, err) => {

    console.log(
        `Job ${job.id} failed`,
        err.message
    );
});