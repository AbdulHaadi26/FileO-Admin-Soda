const express = require('express');
const router = express.Router();
const JWT = require('../../../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../../middlewares/oracleDB');


router.post('/generate/link_upload', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionLinkC = await soda.createCollection('client_links');

        const { _id, cat } = req.body;

        await collectionLinkC.find().fetchArraySize(0).filter({ postedFor: _id, cat: cat }).remove();

        let date;
        if (req.body.date) {
            date = new Date(req.body.date);
            date.addHours(24);
        } else {
            date = new Date(Date.now());
            date = date.addHours(8760);
        }

        let data = {
            postedFor: _id,
            expired: date,
            category: cat,
            created: Date.now(),
            date: new Date()
        };

        await collectionLinkC.insertOneAndGet(data);

        return res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.post('/generate/link_category', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        collectionLinkC = await soda.createCollection('user_cat_links');

        const { cat } = req.body;

        await collectionLinkC.find().fetchArraySize(0).filter({ cat: cat }).remove();

        let date;
        if (req.body.date) {
            date = new Date(req.body.date);
            date.addHours(24);
        } else {
            date = new Date(Date.now());
            date = date.addHours(8760);
        }

        let data = {
            expired: date,
            category: cat,
            created: Date.now(),
            date: new Date()
        };

        await collectionLinkC.insertOneAndGet(data);

        return res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.post('/generate/link/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionLink = await soda.createCollection('links');

        const { _id } = req.params;
        await collectionLink.find().fetchArraySize(0).filter({ fileId: _id }).remove();

        let date;
        if (req.body.date) {
            date = new Date(req.body.date);
            date.addHours(24);
        } else {
            date = new Date(Date.now());
            date = date.addHours(8760);
        }

        const data = {
            fileId: _id,
            expired: date,
            created: Date.now(),
            date: new Date()
        };

        await collectionLink.insertOneAndGet(data);

        return res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

module.exports = router;