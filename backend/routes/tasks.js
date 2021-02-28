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
    createTask
} = require('../schemas/task');
const { fileChanged } = require('../schemas/notification');
const { findOrganizationByIdUpt, updatePackageDetails } = require('../schemas/organization');

const {
    findRecById,
    findRecByIdDel,
    deleteRec,
    updateRecName
} = require('../schemas/recordings');

const {
    deleteSharedNote, updateSharedNoteName, updateNoteUptS
} = require('../schemas/sharedTask');

const { findUserById, updateStorage } = require('../schemas/user');
const { deleteDiscussions } = require('../schemas/discussion');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionNotes, collectionRecs] = [
            await soda.createCollection('notes'), await soda.createCollection('recrs')
        ];

        const {
            name, org, _id, title, editable, due, status,
            text, color, fileList, recId, catList
        } = req.body;

        const noteData = {
            title: title, org: org, text: text, postedby: req.token._id,
            color: color, attachment: fileList, recId: recId, editable,
            catList: catList, updated: false, isTask: true,
            created: Date.now(), date: new Date(), due, status, time_due: new Date(due),
        };

        let note = await findNoteByName(name, _id, false, collectionNotes);

        if (!note) {
            await createTask(noteData, collectionNotes);

            if (recId) await updateRecName(recId, title, collectionRecs);
            res.json({ note: noteData });
        } else throw new Error('Note already exists');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.get('/fetchNotes', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');

        const { _id, offset, type, status, due } = req.query;
        var p1 = getAllNoteLimit(_id, offset, true, type, status, due, collectionNotes);
        var p2 = getAllNoteCount(_id, true, type, status, due, collectionNotes);
        var [notes, count] = [await p1, await p2];

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
        var p1 = getAllNoteQueryLimit(_id, offset, string, true, type, status, due, collectionNotes);
        var p2 = getAllNoteQueryCount(_id, string, true, type, status, due, collectionNotes);
        var [notes, count] = [await p1, await p2];

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

        const [collectionNotes, collectionRecs, collectionFiles, collectionSharedN, collectionCats, collectionUser] = [
            await soda.createCollection('notes'), await soda.createCollection('recrs'),
            await soda.createCollection('user_files'), await soda.createCollection('shrs_note'),
            await soda.createCollection('user_cats'), await soda.createCollection('users')
        ];

        const { _id, title, text, color, fileList, recId, editable, catList, status, due, isEdt } = req.body;

        if (isEdt) await updateNoteUpt(_id, true, collectionNotes);
        else await updateNoteUptS(_id, true, collectionSharedN);
        [await updateNote(_id, title, text, color, fileList, recId, editable, catList, status, due, collectionNotes), await updateSharedNoteName(_id, title, due, status, collectionSharedN)];
        const note = await findNoteByIdF(_id, collectionNotes, collectionFiles, collectionCats, collectionUser);

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

        const [collectionNotes, collectionRecs, collectionUser, collectionSharedN, collectionOrg, collectionNotif, collectionD] = [
            await soda.createCollection('notes'), await soda.createCollection('recrs'),
            await soda.createCollection('users'), await soda.createCollection('shrs_note'),
            await soda.createCollection('orgs'), await soda.createCollection('notifs'),
            await soda.createCollection('discussions')
        ];

        const { _id } = req.body;
        const note = await findNoteByIdP(_id, collectionNotes, collectionUser);
        if (note && note.recId) {
            const rec = await findRecByIdDel(note.recId, collectionRecs);
            if (rec && rec.url) {
                const [user, org] = [await findUserById(req.token._id, collectionUser), await findOrganizationByIdUpt(req.token.org, collectionOrg)];
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
            }
            await deleteRec(note.recId, collectionRecs);
        }
        [await deleteNote(_id, collectionNotes), await deleteSharedNote(_id, collectionSharedN), await fileChanged(_id, collectionNotif), await deleteDiscussions(_id, collectionD)];

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


module.exports = router;