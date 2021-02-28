const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

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
} = require('../schemas/notification');

const {
    getEmpReqCount,
    getEmpReqLimit,
    removeEmpReq
} = require('../schemas/empReq');

const {
    getAllUptNoteCountS
} = require('../schemas/sharedNote');

const {
    getAllUptFileCountS
} = require('../schemas/sharedFile');

const {
    getAllUptNoteCount
} = require('../schemas/note');

const Task = require('../schemas/task');

const {
    getAllUptCatCountS
} = require('../schemas/sharedCat');

const {
    getAllCCatUptCountS
} = require('../schemas/clientsCategory');
const { getAllUptCatCountSC } = require('../schemas/userCategory');

router.get('/list', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionNotifs, collectionUser] = [await soda.createCollection('notifs'), await soda.createCollection('users')];

        const { limit } = req.query;
        
        await updatedChangedAll(req.token._id, collectionNotifs);
        var p1 = getUserNotifLimit(req.token._id, limit, collectionNotifs, collectionUser);
        var p2 = getUserNotifCount(req.token._id, collectionNotifs);
        var p3 = getAllUnread(req.token._id, collectionNotifs);
        var [notifs, notifCount, count] = [await p1, await p2, await p3];

        res.json({ notifs: notifs, notifCount: notifCount, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/requests', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionEmpReq, collectionUser] = [await soda.createCollection('emp_reqs'), await soda.createCollection('users')];

        const { limit } = req.query;
        var p1 = getEmpReqLimit(req.token.org, limit, collectionEmpReq, collectionUser);
        var p2 = getEmpReqCount(req.token.org, collectionEmpReq);
        var [reqs, reqCount] = [await p1, await p2];

        res.json({ reqs: reqs, reqCount: reqCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteRequest', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionEmpReq, collectionUser] = [await soda.createCollection('emp_reqs'), await soda.createCollection('users')];

        await removeEmpReq(req.body._id, collectionEmpReq);
        var p1 = getEmpReqLimit(req.token.org, 0, collectionEmpReq, collectionUser);
        var p2 = getEmpReqCount(req.token.org, collectionEmpReq);
        var [reqs, reqCount] = [await p1, await p2];

        res.json({ reqs: reqs, reqCount: reqCount });
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

        const [collectionSNotes, collectionFile, collectionCats, collectionNotes, collectionCCat, collectionMCat] = [
            await soda.createCollection('shrs_note'), await soda.createCollection('shrs'), await soda.createCollection('shrs_cat'),
            await soda.createCollection('notes'), await soda.createCollection('client_cats'), await soda.createCollection('user_cats')
        ];

        let { _id } = req.token;

        let [countSN, countF, countC, countN, countCF, countST, countT, countM] = [
            await getAllUptNoteCountS(_id, true, collectionSNotes), await getAllUptFileCountS(_id, collectionFile),
            await getAllUptCatCountS(_id, collectionCats), await getAllUptNoteCount(_id, true, collectionNotes),
            await getAllCCatUptCountS(_id, collectionCCat), await getAllUptNoteCountS(_id, false, collectionSNotes),
            await Task.getAllUptNoteCount(_id, true, collectionNotes), await getAllUptCatCountSC(_id, collectionMCat)
        ];

        res.json({ countN: countN, countF: countF, countC: countC, countSN: countSN, countCF: countCF, countT: countT, countST: countST, countM: countM });
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

        const [collectionNotifs, collectionUser] = [await soda.createCollection('notifs'), await soda.createCollection('users')];

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

        const [collectionNotifs, collectionUser] = [await soda.createCollection('notifs'), await soda.createCollection('users')];

        const { _id } = req.params;
        var p1 = getNotification(_id, collectionNotifs, collectionUser);
        var p2 = updateRead(_id, collectionNotifs);
        var [notif, upt] = [await p1, await p2];
        var count = await getAllUnread(req.token._id, collectionNotifs);

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

        const [collectionNotifs, collectionUser] = [await soda.createCollection('notifs'), await soda.createCollection('users')];

        await readAllNotification(req.token._id, collectionNotifs);
        var p1 = getUserNotifLimit(req.token._id, 0, collectionNotifs, collectionUser);
        var p2 = getUserNotifCount(req.token._id, collectionNotifs);
        var p3 = getAllUnread(req.token._id, collectionNotifs);
        var [notifs, notifCount, count] = [await p1, await p2, await p3];

        res.json({ notifs: notifs, notifCount: notifCount, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;