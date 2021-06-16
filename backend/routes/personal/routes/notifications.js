const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT = require('../../../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../../middlewares/oracleDB');

const {
    getUserNotifCount,
    getUserNotifLimit,
    getAllUnread,
    deleteNotification,
    getNotification,
    readAllNotification,
    deleteAllNotification,
    updateRead,
    getAllUnreadList,
    updatedChangedAll
} = require('../../../schemas/personal/schemas/notification');

const {
    getAllCFileUptCount
} = require('../../../schemas/personal/schemas/clientFile');


router.get('/list', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionNotifs = await soda.createCollection('notifs');

        const { limit } = req.query;

        await updatedChangedAll(req.token._id, collectionNotifs);
        let notifs = await getUserNotifLimit(req.token._id, limit, collectionNotifs, collectionUser);
        let notifCount = await getUserNotifCount(req.token._id, collectionNotifs);
        let count = await getAllUnread(req.token._id, collectionNotifs);

        res.json({ notifs: notifs, notifCount: notifCount, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.get('/tabNav/count', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionCCat = await soda.createCollection('client_files');

        let { _id } = req.token;

        let countCF = await getAllCFileUptCount(_id, collectionCCat);

        res.json({ countCF });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/notifCount', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const token = req.headers['authorization'];
        const data = jwt.verify(token, process.env.SECRET);
        if (!data) return res.status(401).json({ error: 'Token is not valid' });


        const collectionUser = await soda.createCollection('users');
        const collectionNotifs = await soda.createCollection('notifs');

        let count = await getAllUnread(data._id, collectionNotifs);

        let list = await getAllUnreadList(data._id, collectionNotifs, collectionUser);

        res.json({ count: count, list: list });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getNotification/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id } = req.params;
        let notif = await getNotification(_id, collectionNotifs, collectionUser);
        await updateRead(_id, collectionNotifs);

        let count = await getAllUnread(req.token._id, collectionNotifs);

        res.json({ notification: notif, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/delete', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotifs = await soda.createCollection('notifs');

        const { _id } = req.body;

        await deleteNotification(_id, collectionNotifs);

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteAll', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotifs = await soda.createCollection('notifs');

        await deleteAllNotification(req.token._id, collectionNotifs);

        res.json({ notifs: [], notifCount: 0, count: 0 });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/readAll', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionNotifs = await soda.createCollection('notifs');

        await readAllNotification(req.token._id, collectionNotifs);

        let notifs = await getUserNotifLimit(req.token._id, 0, collectionNotifs, collectionUser);
        let notifCount = await getUserNotifCount(req.token._id, collectionNotifs);
        let count = await getAllUnread(req.token._id, collectionNotifs);

        res.json({ notifs: notifs, notifCount: notifCount, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;