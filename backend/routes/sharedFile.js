const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    createNotification, fileChanged, fileChangedU
} = require('../schemas/notification');

const {
    findUserById,
    getAllUserSharedCountP,
    getAllUserSharedLimitP,
    getAllUserSharedQueryCountP,
    getAllUserSharedQueryLimitP
} = require('../schemas/user');

const {
    getAllAssignedCount,
    getAllAssignedLimit,
    getAllAssignedQueryCount,
    getAllAssignedQueryLimit,
    getAllUserFileIds,
    isExist,
    createSharedF,
    deleteAssigned,
    getAllFileCount,
    getAllFileLimit,
    getAllFileQueryCount,
    getAllFileQueryLimit,
    getAllUptFileCountS,
    deleteAssignedAll
} = require('../schemas/sharedFile');

const {
    findFileByIdP,
    findFileById,
} = require('../schemas/userFile');


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

router.get('/updateFileCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('shrs');

        let count = await getAllUptFileCountS(req.token._id, collectionFile);
        res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');
        const collectionNotif = await soda.createCollection('notifs');

        const { sWith, name, fileId } = req.body;
        let file = await findFileByIdP(fileId, collectionFile, collectionUser);
        let arrId = await getAllUserFileIds(fileId, collectionSharedF, collectionUser);
        let isEx = await isExist(sWith, fileId, collectionSharedF, collectionUser);
        let user = await findUserById(sWith, collectionUser);

        arrId.push(user.email);

        if (!isEx) {
            var sharedData = {
                sharedWName: name, type: file.type, sharedWith: sWith, updated: true,
                sharedBy: file.postedby._id, sharedByName: file.postedby.name, fileId: file.versionId,
                fileName: file.name, org: file.org, date: new Date(), created: Date.now(),
                sharedWEmail: user.email
            };
            await createSharedF(sharedData, collectionSharedF);
        }

        let userCount = await getAllUserSharedCountP(file.org, arrId, req.token._id, collectionUser);
        let userList = await getAllUserSharedLimitP(0, file.org, arrId, req.token._id, collectionUser);
        let assignedCount = await getAllAssignedCount(fileId, collectionSharedF);
        let assignedList = await getAllAssignedLimit(fileId, 0, collectionSharedF, collectionUser);

        let date = parseDate();
        let title = `${file.postedby.name} has shared a file with you.`, message = `A new file ${file.name} has been shared by ${file.postedby.name} with you on ${date} in File-O.`;
        await generateNotification(file.org, file.postedby._id, title, message, 3, 1, file._id, date, file.type, sWith, collectionNotif);

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function generateNotification(org, pBy, title, message, t, uT, fileId, dt, mime, sWT, collectionNotif) {
    var data = {
        postedBy: pBy, title: title, message: message, recievedBy: sWT, type: t, userType: uT,
        org: org, id: fileId, date: dt, mimeType: mime, created: Date.now(), isRead: false
    };
    await createNotification(data, collectionNotif);
}

function parseDate() {
    var serverDate = new Date(Date.now());
    var dt = new Date(Date.parse(serverDate));
    var hours = dt.getHours();
    var minutes = dt.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = `${`${serverDate.toString().slice(0, 10)} at `}${hours}:${minutes} ${ampm}`;
    return strTime;
}

router.get('/getEmployeeCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');

        const { _id, fId } = req.query;

        let arrId = await getAllUserFileIds(fId, collectionSharedF, collectionUser);
        let count = await getAllUserSharedCountP(_id, arrId, req.token._id, collectionUser);

        return res.json({ userCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getEmployees', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');

        const { offset, _id, fId } = req.query;

        let arrId = await getAllUserFileIds(fId, collectionSharedF, collectionUser);
        let userList = await getAllUserSharedLimitP(offset, _id, arrId, req.token._id, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchEmployeeCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');

        const { string, _id, fId } = req.query;

        let arrId = await getAllUserFileIds(fId, collectionSharedF, collectionUser);
        let count = await getAllUserSharedQueryCountP(string, _id, arrId, req.token._id, collectionUser);

        return res.json({ userCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchEmployees', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');

        const { offset, string, _id, fId } = req.query;

        let arrId = await getAllUserFileIds(fId, collectionSharedF, collectionUser);

        let userList = await getAllUserSharedQueryLimitP(offset, string, _id, arrId, req.token._id, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getAssignedCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSharedF = await soda.createCollection('shrs');

        const { _id } = req.query;

        let count = await getAllAssignedCount(_id, collectionSharedF);

        return res.json({ userCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getAssigned', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');

        const { limit, _id } = req.query;

        let userList = await getAllAssignedLimit(_id, limit, collectionSharedF, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchAssignedCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSharedF = await soda.createCollection('shrs');

        const { string, _id } = req.query;

        let count = await getAllAssignedQueryCount(_id, string, collectionSharedF);

        return res.json({ userCount: count });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchAssigned', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');

        const { limit, string, _id } = req.query;

        let userList = await getAllAssignedQueryLimit(_id, limit, string, collectionSharedF, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFileCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSharedF = await soda.createCollection('shrs');

        const { _id, type } = req.query;
        let count = await getAllFileCount(_id, type, collectionSharedF);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');

        const { limit, _id, type } = req.query;
        let fileList = await getAllFileLimit(_id, limit, type, collectionSharedF, collectionFile, collectionUser);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFileCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSharedF = await soda.createCollection('shrs');

        const { string, _id, type, search } = req.query;

        let count = await getAllFileQueryCount(_id, string, type, search, collectionSharedF);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');

        const { limit, string, _id, type, search } = req.query;
        let fileList = await getAllFileQueryLimit(_id, limit, string, type, search, collectionSharedF, collectionFile, collectionUser);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionSharedF = await soda.createCollection('shrs');

        const { _id, type, search, string } = req.query;
        let fileList;

        if (string) fileList = await getAllFileQueryLimit(_id, string, type, search, collectionSharedF, collectionFile);
        else fileList = await getAllFileLimit(_id, search, type, collectionSharedF, collectionFile);

        return res.json({ files: fileList });
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');
        const collectionNotif = await soda.createCollection('notifs');

        const { sWith, fileId } = req.body;
        await deleteAssigned(sWith, fileId, collectionSharedF);
        await fileChangedU(fileId, [sWith], collectionNotif);

        let file = await findFileById(fileId, collectionFile);
        let arrId = await getAllUserFileIds(fileId, collectionFile, collectionUser);

        let userCount = await getAllUserSharedCountP(file.org, arrId, req.token._id, collectionUser);
        let userList = await getAllUserSharedLimitP(0, file.org, arrId, req.token._id, collectionUser);
        let assignedCount = await getAllAssignedCount(fileId, collectionSharedF);
        let assignedList = await getAllAssignedLimit(fileId, 0, collectionSharedF, collectionUser);

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedF = await soda.createCollection('shrs');
        const collectionNotif = await soda.createCollection('notifs');

        const { fileId } = req.body;
        await deleteAssignedAll(fileId, collectionSharedF);
        await fileChanged(fileId, collectionNotif);

        let file = await findFileById(fileId, collectionFile);
        let arrId = await getAllUserFileIds(fileId, collectionFile, collectionUser);

        let userCount = await getAllUserSharedCountP(file.org, arrId, req.token._id, collectionUser);
        let userList = await getAllUserSharedLimitP(0, file.org, arrId, req.token._id, collectionUser);
        let assignedCount = await getAllAssignedCount(fileId, collectionSharedF);
        let assignedList = await getAllAssignedLimit(fileId, 0, collectionSharedF, collectionUser);

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;