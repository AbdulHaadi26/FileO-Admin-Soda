const express = require('express');
const router = express.Router();
const JWT = require('../../../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../../middlewares/oracleDB');


router.get('/bills', JWT, async (req, res) => {
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionBilling = await soda.createCollection('billing_ep');

        let list = [];

        let doc = await collectionBilling.find().filter({ orgId: req.token._id, status: req.query.status }).getDocuments();

        if (doc) {
            doc.map(i => {
                let content = i.getContent();
                content._id = i.key
                list.push(content);
            })
        };

        res.json({ list: list });
    }
    catch (e) {
        console.log(e);
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;