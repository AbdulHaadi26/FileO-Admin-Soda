const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');
const nodeMailer = require('nodemailer');

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
const { getSetting } = require('../schemas/setting');

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
} = require('../schemas/sharedTask');

const {
    findNoteById
} = require('../schemas/task');

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

        const [collectionNotes, collectionUser, collectionSharedN, collectionNotif, collectionSets] = [
            await soda.createCollection('notes'), await soda.createCollection('users'), await soda.createCollection('shrs_note'),
            await soda.createCollection('notifs'), await soda.createCollection('sets')
        ];

        const { sWith, name, noteId } = req.body;
        var p1 = findNoteByIdP(noteId, collectionNotes, collectionUser);
        var p2 = getAllUserNoteIds(noteId, collectionSharedN, collectionUser);
        var p3 = isExist(sWith, noteId, collectionSharedN);
        var p4 = findUserById(sWith, collectionUser);
        var [note, arrId, isEx, user] = [await p1, await p2, await p3, await p4];
        arrId.push(user.email);
        if (!isEx) {

            let sharedData = {
                sharedWName: name, sharedWith: sWith, sharedBy: note.postedby._id, created: Date.now(), date: new Date(),
                sharedByName: note.postedby.name, noteId: noteId, noteTitle: note.title, org: note.org, updated: true,
                isTask: true, time_due: note.time_due, status: note.status, due: note.due
            };

            await createSharedN(sharedData, collectionSharedN);
        }
        const p5 = getAllUserSharedCountP(note.org, arrId, req.token._id, collectionUser);
        const p6 = getAllUserSharedLimitP(0, note.org, arrId, req.token._id, collectionUser);
        const p7 = getAllAssignedCount(noteId, collectionSharedN);
        const p8 = getAllAssignedLimit(noteId, 0, collectionSharedN, collectionUser);
        const [userCount, userList, assignedCount, assignedList] = [await p5, await p6, await p7, await p8];

        const set = await getSetting(collectionSets);

        let transporter = nodeMailer.createTransport({
            service: set.service,
            auth: {
                user: set.email,
                pass: set.pass
            }
        });

        let html = `
            <img src="https://demo1.file-o.com/public/static/logo.png" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3 style="font-weight:400;">Hello <b>${user.name}</b>,</h3>
            
            <p>You have been assigned a task ${note.title} by ${note.postedby.name} in File-O which is due on ${note.due}.</p>

            <p><br/>Thank you for using File-O. Questions or concerns? Contact <a rel="noopener noreferrer" target="_blank" href="https://www.file-o.com/support">File-O Support</a>.</p>
            <br/>

            Sincerely,
            <br/>File-O Team<br/> <br/>

            <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
            <p>File-O is an affiliate of CWare Technologies.</p>`

        var mailOptions = {
            from: set.email,
            to: user.email,
            subject: 'File-O Task',
            html: html
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }

        });

        let date = parseDate();
        let title = `${note.postedby.name} has shared a task with you.`, message = `A new task ${note.title} has been shared by ${note.postedby.name} with you on ${date} in File-O.`;
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

        const [collectionUser, collectionSharedN] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note')
        ];

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

        const [collectionUser, collectionSharedN] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note')
        ];

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

        const [collectionUser, collectionSharedN] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note')
        ];

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

        const [collectionUser, collectionSharedN] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note')
        ];

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

        const [collectionUser, collectionSharedN] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note')
        ];

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
        var count = await getAllAssignedQueryCount(_id, string, collectionSharedN);

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

        const [collectionUser, collectionSharedN] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note')
        ];

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

        const { _id, type, status, due } = req.query;
        let count = await getAllNoteCount(_id, true, type, status, due, collectionSharedN);

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

        const [collectionUser, collectionSharedN, collectionNotes] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note'), await soda.createCollection('notes')
        ];

        const { limit, _id, type, status, due } = req.query;
        let noteList = await getAllNoteLimit(_id, limit, true, type, status, due, collectionSharedN, collectionNotes, collectionUser);

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

        const { string, _id, search, type, status, due } = req.query;
        let count = await getAllNoteQueryCount(_id, string, search, true, type, status, due, collectionSharedN);

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

        const [collectionUser, collectionSharedN, collectionNotes] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note'), await soda.createCollection('notes')
        ];

        const { limit, string, _id, search, type, status, due } = req.query;
        let noteList = await getAllNoteQueryLimit(_id, limit, string, search, true, type, status, due, collectionSharedN, collectionNotes, collectionUser);

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

        const [collectionUser, collectionSharedN, collectionNotes, collectionNotif] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note'), await soda.createCollection('notes'),
            await soda.createCollection('notifs')
        ];

        const { sWith, noteId } = req.body;
        [await deleteAssigned(sWith, noteId, collectionSharedN), await fileChangedU(noteId, [sWith], collectionNotif)];
        const p1 = findNoteById(noteId, collectionNotes);
        const p2 = getAllUserNoteIds(noteId, collectionSharedN, collectionUser);
        const [note, arrId] = [await p1, await p2];

        const p3 = getAllUserSharedCountP(note.org, arrId, req.token._id, collectionUser);
        const p4 = getAllUserSharedLimitP(0, note.org, arrId, req.token._id, collectionUser);
        const p5 = getAllAssignedCount(noteId, collectionSharedN);
        const p6 = getAllAssignedLimit(noteId, 0, collectionSharedN, collectionUser);
        const [userCount, userList, assignedCount, assignedList] = [await p3, await p4, await p5, await p6];

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

        const [collectionUser, collectionSharedN, collectionNotes, collectionNotif] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_note'), await soda.createCollection('notes'),
            await soda.createCollection('notifs')
        ];

        const { noteId } = req.body;
        [await deleteAssignedAll(noteId, collectionSharedN), await fileChanged(noteId, collectionNotif)];
        const p1 = findNoteById(noteId, collectionNotes);
        const p2 = getAllUserNoteIds(noteId, collectionSharedN, collectionUser);
        const [note, arrId] = [await p1, await p2];

        const p3 = getAllUserSharedCountP(note.org, arrId, req.token._id, collectionUser);
        const p4 = getAllUserSharedLimitP(0, note.org, arrId, req.token._id, collectionUser);
        const p5 = getAllAssignedCount(noteId, collectionSharedN);
        const p6 = getAllAssignedLimit(noteId, 0, collectionSharedN, collectionUser);
        const [userCount, userList, assignedCount, assignedList] = [await p3, await p4, await p5, await p6];

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;