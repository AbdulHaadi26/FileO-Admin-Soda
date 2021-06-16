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
    getAllCFileUptCount
} = require('../schemas/clientFile');

const {
    getAllUptCatCountSC
} = require('../schemas/userCategory');

const SharedTask = require('../schemas/sharedTask');
const { getAllPollCount } = require('../schemas/polls');

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

router.get('/requests', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionEmpReq = await soda.createCollection('emp_reqs');

        const { limit } = req.query;

        let reqs = await getEmpReqLimit(req.token.org, limit, collectionEmpReq, collectionUser);
        let reqCount = await getEmpReqCount(req.token.org, collectionEmpReq);

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

        const collectionUser = await soda.createCollection('users');
        const collectionEmpReq = await soda.createCollection('emp_reqs');

        await removeEmpReq(req.body._id, collectionEmpReq);
        let reqs = await getEmpReqLimit(req.token.org, 0, collectionEmpReq, collectionUser);
        let reqCount = await getEmpReqCount(req.token.org, collectionEmpReq);

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


        const collectionSNotes = await soda.createCollection('shrs_note');
        const collectionFile = await soda.createCollection('shrs');
        const collectionCats = await soda.createCollection('shrs_cat');
        const collectionNotes = await soda.createCollection('notes');
        const collectionCCat = await soda.createCollection('client_files');
        const collectionMCat = await soda.createCollection('user_cats');
        const collectionPoll = await soda.createCollection('polls');

        let { _id } = req.token;

        let countSN = await getAllUptNoteCountS(_id, false, collectionSNotes);
        let countF = await getAllUptFileCountS(_id, collectionFile);
        let countC = await getAllUptCatCountS(_id, collectionCats);
        let countN = await getAllUptNoteCount(_id, true, collectionNotes);
        let countCF = await getAllCFileUptCount(_id, collectionCCat);
        let countST = await SharedTask.getAllUptNoteCountS(_id, true, collectionSNotes);
        let countT = await Task.getAllUptNoteCount(_id, true, collectionNotes);
        let countM = await getAllUptCatCountSC(_id, collectionMCat);
        let countP = await getAllPollCount(req.token.org, _id, collectionPoll);

        res.json({ countN: countN, countF: countF, countC: countC, countSN: countSN, countCF: countCF, countT: countT, countST: countST, countM: countM, countP });
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