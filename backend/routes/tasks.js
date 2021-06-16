const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');
const { deleteObject } = require('../middlewares/oci-sdk');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getAllNoteCount,
    getAllNoteLimit,
    getAllNoteQueryCount,
    getAllNoteQueryLimit,
    findNoteByIdF,
    updateNote,
    findNoteByIdP,
    deleteNote,
    updateNoteUpt,
    getAllUptNoteCount,
    findNoteByName,
    createTask,
    findNoteById,
    updateNoteN
} = require('../schemas/task');

const { fileChanged, createNotification } = require('../schemas/notification');
const { findOrganizationByIdUpt, updatePackageDetails } = require('../schemas/organization');

const {
    findRecById,
    findRecByIdDel,
    deleteRec,
    updateRecName
} = require('../schemas/recordings');

const {
    deleteSharedNote, updateSharedNoteName, updateNoteUptS, createSharedN, deleteAssigned
} = require('../schemas/sharedTask');

const { findUserById, updateStorage } = require('../schemas/user');
const { deleteDiscussions } = require('../schemas/discussion');
const { createDesc, removeDesc, updateDescription, getDescById } = require('../schemas/description');
const { findNoteByNameEQ } = require('../schemas/note');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');
        const collectionRecs = await soda.createCollection('recrs');

        const collectionDesc = await soda.createCollection('note_desc');

        const {
            org, title, editable, due, status, text, color, fileList, recId, catList, icon
        } = req.body;

        let noteData = {
            title: title, org: org, text: '', postedby: req.token._id,
            color: color, attachment: fileList, recId: recId, editable,
            catList: catList, updated: false, isTask: true,
            created: Date.now(), date: new Date(), due, status, time_due: new Date(due),
            icon: icon
        };

        let note = await findNoteByName(title, req.token._id, true, collectionNotes);

        if (!note) {
            let descData = {
                postedby: req.token._id, org: org, text: text
            };

            let keyD = await createDesc(descData, collectionDesc);

            noteData.text = keyD;

            let key = await createTask(noteData, collectionNotes);

            if (recId) await updateRecName(recId, title, collectionRecs);

            res.json({ note: key });
        } else throw new Error('Note already exists');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.post('/transfer', JWT, async (req, res) => {
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

        const { userId, noteId } = req.body;

        let user = await findUserById(req.token._id, collectionUser);

        let note = await updateNoteN(noteId, userId, collectionNotes);

        if (!note) throw new Error('Note could not be transfered');

        await deleteAssigned(userId, noteId, collectionSharedN);

        note = await findNoteByIdP(noteId, collectionNotes, collectionUser);

        if (!note) throw new Error('Note not found');

        let sharedData = {
            sharedWName: user.name, sharedWith: req.token._id, sharedBy: note.postedby._id, created: Date.now(), date: new Date(),
            sharedByName: note.postedby.name, noteId: noteId, noteTitle: note.title, org: note.org, updated: true,
            isTask: true, time_due: note.time_due, status: note.status, due: note.due
        };

        await createSharedN(sharedData, collectionSharedN);

        let date = parseDate();
        let title = `${note.postedby.name} has shared a task with you.`, message = `A new task ${note.title} has been shared by ${note.postedby.name} with you on ${date} in File-O.`;
        await generateNotification(note.org, note.postedby._id, title, message, 4, 1, note._id, date, '', req.token._id, collectionNotif);


        res.json({ success: true });
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

router.get('/fetchNotes', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');

        const { _id, offset, type, status, due } = req.query;
        let notes = await getAllNoteLimit(_id, offset, true, type, status, due, collectionNotes);
        let count = await getAllNoteCount(_id, true, type, status, due, collectionNotes);

        res.json({ noteList: notes, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchNotesSearch', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');

        const { _id, offset, string, type, status, due } = req.query;
        let notes = await getAllNoteQueryLimit(_id, offset, string, true, type, status, due, collectionNotes);
        let count = await getAllNoteQueryCount(_id, string, true, type, status, due, collectionNotes);

        res.json({ noteList: notes, count: count });
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
        const collectionNotes = await soda.createCollection('notes');

        let count = await getAllUptNoteCount(req.token._id, true, collectionNotes);
        res.json({ noteCount: count });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateNote', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');
        const collectionRecs = await soda.createCollection('recrs');
        const collectionFiles = await soda.createCollection('user_files');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');
        const collectionDesc = await soda.createCollection('note_desc');

        const { _id, title, text, color, fileList, recId, editable, catList, status, due, isEdt, icon } = req.body;

        let note = await findNoteById(_id, collectionNotes);

        if (isEdt) await updateNoteUpt(_id, true, collectionNotes);
        else await updateNoteUptS(_id, true, req.token._id, collectionSharedN);

        await updateNote(_id, title, color, fileList, recId, editable, catList, status, due, icon, collectionNotes);

        await updateSharedNoteName(_id, title, due, status, collectionSharedN);

        await updateDescription(note.text, text, collectionDesc);

        note = await findNoteByIdF(_id, collectionNotes, collectionFiles, collectionCats, collectionUser);


        let textI = await getDescById(note.text, collectionDesc);

        note.text = textI;

        if (!note) throw new Error('Note not found.')
        if (note && note.recId) {
            await updateRecName(note.recId, title, collectionRecs);
            var rec = await findRecById(note.recId, collectionRecs);
        }

        res.json({ note: note, rec: rec ? rec : '' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteNote', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');
        const collectionRecs = await soda.createCollection('recrs');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');
        const collectionDesc = await soda.createCollection('note_desc');
        const collectionD = await soda.createCollection('discussions');

        const { _id } = req.body;
        const note = await findNoteByIdP(_id, collectionNotes, collectionUser);
        if (note && note.recId) {
            const rec = await findRecByIdDel(note.recId, collectionRecs);
            if (rec && rec.url) {
                let user = await findUserById(req.token._id, collectionUser);
                let org = await findOrganizationByIdUpt(req.token.org, collectionOrg);

                var uploaded_data = Number(org.data_uploaded)
                var available = Number(org.available);
                var combined_plan = Number(org.combined_plan);
                var percent_left, percent_used;
                var userUploaded = Number(user.storageUploaded);
                var userAvailable = Number(user.storageAvailable);
                var limit = Number(user.storageLimit);

                if (org) {
                    uploaded_data = uploaded_data - Number(rec.size);
                    available = available + Number(rec.size);
                    if (uploaded_data < 0) uploaded_data = 0;
                    if (available > combined_plan) available = Number(combined_plan);
                    percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
                    if (percent_used > 100) percent_used = 100;
                    percent_left = 100 - Number(percent_used);
                    if (percent_left < 0) percent_left = 0;
                    userUploaded = userUploaded - Number(rec.size);
                    userAvailable = userAvailable + Number(rec.size);
                    if (userAvailable > limit) userAvailable = Number(limit);
                    if (userUploaded < 0) userUploaded = 0;
                    if (percent_left && percent_used) await updatePackageDetails(org._id, uploaded_data, available, percent_left, percent_used, collectionOrg);
                    await updateStorage(user._id, userUploaded, userAvailable, collectionUser);
                    await deleteObject(rec.url, req.token.bucket);
                }
            };

            await removeDesc(note.text, collectionDesc);
            await deleteRec(note.recId, collectionRecs);
        }
        await deleteNote(_id, collectionNotes);
        await deleteSharedNote(_id, collectionSharedN);
        await fileChanged(_id, collectionNotif);
        await deleteDiscussions(_id, collectionD);

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


module.exports = router;