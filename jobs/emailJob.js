const emailQueue = require('../queues/emailQueue');

/**
 * ADD EMAIL JOB
 */
exports.addEmailJob = async data => {

    await emailQueue.add(
        'sendEmail',
        data,
        {
            attempts: 3,

            backoff: {
                type: 'exponential',
                delay: 5000
            },

            removeOnComplete: true,

            removeOnFail: false
        }
    );
};