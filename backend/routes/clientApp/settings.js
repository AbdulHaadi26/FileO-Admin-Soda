const express = require('express');
const router = express.Router();

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../middlewares/oracleDB');

const {
    getSetting
} = require('../../schemas/clientApp/setting.js');

router.get('/settings', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSet = await soda.createCollection('sets');
        
        let set = await getSetting(collectionSet);
        
        if (!set) throw new Error('Settings not found');

        res.json({ setting: set });
    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;