let cron = require('node-cron');

cron.schedule('0 0 1 * *', () => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log('Running Daily.');

    if(today.getDate() === 10) {
        console.log('Running on the 10th of each month');
    }

    if (today.getMonth() !== tomorrow.getMonth()) {
        console.log('Running on the last day.')
    }
});