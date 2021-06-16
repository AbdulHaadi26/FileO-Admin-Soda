const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    findNoteByIdP,
} = require('../schemas/note');

const {
    createNotification, fileChangedU, fileChanged
} = require('../schemas/notification');

const {
    getAllUserNoteIds,
    isExist,
    createSharedN,
    getAllAssignedCount,
    getAllAssignedLimit,
    getAllAssignedQueryCount,
    getAllAssignedQueryLimit,
    getAllNoteCount,
    getAllNoteLimit,
    getAllNoteQueryLimit,
    getAllNoteQueryCount,
    deleteAssigned,
    getAllUptNoteCountS,
    deleteAssignedAll
} = require('../schemas/sharedNote');

const {
    findNoteById
} = require('../schemas/note');

const {
    findUserById,
    getAllUserSharedCountP,
    getAllUserSharedLimitP,
    getAllUserSharedQueryCountP,
    getAllUserSharedQueryLimitP
} = require('../schemas/user');

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collectionNotif = await soda.createCollection('notifs');

        const { sWith, name, noteId } = req.body;
        let note = await findNoteByIdP(noteId, collectionNotes, collectionUser);
        let arrId = await getAllUserNoteIds(noteId, collectionSharedN, collectionUser);
        let isEx = await isExist(sWith, noteId, collectionSharedN);
        let user = await findUserById(sWith, collectionUser);

        arrId.push(user.email);

        if (!isEx) {

            let sharedData = {
                sharedWName: name, sharedWith: sWith, sharedBy: note.postedby._id, created: Date.now(), date: new Date(),
                sharedByName: note.postedby.name, noteId: noteId, noteTitle: note.title, org: note.org, updated: true,
                isTask: false, sharedWEmail: user.email
            };

            await createSharedN(sharedData, collectionSharedN);
        }

        let userCount = await getAllUserSharedCountP(note.org, arrId, req.token._id, collectionUser);
        let userList = await getAllUserSharedLimitP(0, note.org, arrId, req.token._id, collectionUser);
        let assignedCount = await getAllAssignedCount(noteId, collectionSharedN);
        let assignedList = await getAllAssignedLimit(noteId, 0, collectionSharedN, collectionUser);

        let date = parseDate();
        let title = `${note.postedby.name} has shared a note with you.`, message = `A new note ${note.title} has been shared by ${note.postedby.name} with you on ${date} in File-O.`;
        await generateNotification(note.org, note.postedby._id, title, message, 4, 1, note._id, date, '', sWith, collectionNotif);

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function generateNotification(org, pBy, title, message, t, uT, fileId, dt, mime, sWT, collectionNotif) {
    let data = {
        postedBy: pBy, title: title, message: message, recievedBy: sWT, type: t, isRead: false,
        userType: uT, org: org, id: fileId, date: dt, mimeType: mime, created: Date.now()
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
        const collectionSharedN = await soda.createCollection('shrs_note');

        const { _id, nId } = req.query;
        let arrId = await getAllUserNoteIds(nId, collectionSharedN, collectionUser);
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
        const collectionSharedN = await soda.createCollection('shrs_note');

        const { offset, _id, nId } = req.query;
        let arrId = await getAllUserNoteIds(nId, collectionSharedN, collectionUser);
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

        const { string, _id, nId } = req.query;

        const collectionUser = await soda.createCollection('users');
        const collectionSharedN = await soda.createCollection('shrs_note');

        let arrId = await getAllUserNoteIds(nId, collectionSharedN, collectionUser);
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
        const collectionSharedN = await soda.createCollection('shrs_note');

        const { offset, string, _id, nId } = req.query;
        let arrId = await getAllUserNoteIds(nId, collectionSharedN, collectionUser);
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

        const collectionSharedN = await soda.createCollection('shrs_note');

        const { _id } = req.query;
        let count = await getAllAssignedCount(_id, collectionSharedN);

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

        const { limit, _id } = req.query;

        const collectionUser = await soda.createCollection('users');
        const collectionSharedN = await soda.createCollection('shrs_note');

        let userList = await getAllAssignedLimit(_id, limit, collectionSharedN, collectionUser);

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
        if (!soda) throw new Error('Soda database has not been intialized yet.');;

        const collectionSharedN = await soda.createCollection('shrs_note');

        const { string, _id } = req.query;
        let count = await getAllAssignedQueryCount(_id, string, collectionSharedN);

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
        const collectionSharedN = await soda.createCollection('shrs_note');

        const { limit, string, _id } = req.query;
        let userList = await getAllAssignedQueryLimit(_id, limit, string, collectionSharedN, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getNoteCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSharedN = await soda.createCollection('shrs_note');

        const { _id, search } = req.query;
        let count = await getAllNoteCount(_id, search, true, collectionSharedN);

        return res.json({ noteCount: count });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getNote', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedN = await soda.createCollection('shrs_note');

        const { limit, _id, search } = req.query;
        let noteList = await getAllNoteLimit(_id, search, limit, true, collectionSharedN, collectionNotes, collectionUser);

        return res.json({ notes: noteList });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchNoteCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSharedN = await soda.createCollection('shrs_note');

        const { string, _id, search } = req.query;
        let count = await getAllNoteQueryCount(_id, string, search, true, collectionSharedN);

        return res.json({ noteCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchNote', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedN = await soda.createCollection('shrs_note');

        const { limit, string, _id, search } = req.query;
        let noteList = await getAllNoteQueryLimit(_id, limit, string, search, true, collectionSharedN, collectionNotes, collectionUser);

        return res.json({ notes: noteList });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/updateNoteCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('shrs_note');

        let count = await getAllUptNoteCountS(req.token._id, false, collectionNotes);
        res.json({ noteCount: count });
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

        const collectionNotes = await soda.createCollection('notes');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collectionNotif = await soda.createCollection('notifs');

        const { sWith, noteId } = req.body;

        await deleteAssigned(sWith, noteId, collectionSharedN);
        await fileChangedU(noteId, [sWith], collectionNotif);

        let note = await findNoteById(noteId, collectionNotes);
        let arrId = await getAllUserNoteIds(noteId, collectionSharedN, collectionUser);

        let userCount = await getAllUserSharedCountP(note.org, arrId, req.token._id, collectionUser);
        let userList = await getAllUserSharedLimitP(0, note.org, arrId, req.token._id, collectionUser);
        let assignedCount = await getAllAssignedCount(noteId, collectionSharedN);
        let assignedList = await getAllAssignedLimit(noteId, 0, collectionSharedN, collectionUser);

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

        const collectionNotes = await soda.createCollection('notes');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collectionNotif = await soda.createCollection('notifs');

        const { noteId } = req.body;
        await deleteAssignedAll(noteId, collectionSharedN);
        await fileChanged(noteId, collectionNotif);

        let note = await findNoteById(noteId, collectionNotes);
        let arrId = await getAllUserNoteIds(noteId, collectionSharedN, collectionUser);

        let userCount = await getAllUserSharedCountP(note.org, arrId, req.token._id, collectionUser);
        let userList = await getAllUserSharedLimitP(0, note.org, arrId, req.token._id, collectionUser);
        let assignedCount = await getAllAssignedCount(noteId, collectionSharedN);
        let assignedList = await getAllAssignedLimit(noteId, 0, collectionSharedN, collectionUser);

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;