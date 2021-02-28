const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');
const { deleteObject } = require('../middlewares/oci-sdk');
const nodeMailer = require('nodemailer');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');
const { deleteDiscussions } = require('../schemas/discussion');

const {
    createNote,
    findNoteByName,
    getAllNoteCount,
    getAllNoteLimit,
    getAllNoteQueryCount,
    getAllNoteQueryLimit,
    findNoteByIdF,
    updateNote,
    findNoteByIdP,
    deleteNote,
    convertNote,
    updateNoteUpt,
    getAllUptNoteCount
} = require('../schemas/note');
const { fileChanged, updatedChanged } = require('../schemas/notification');
const { findOrganizationByIdUpt, updatePackageDetails } = require('../schemas/organization');

const {
    findRecById,
    findRecByIdDel,
    deleteRec,
    updateRecName
} = require('../schemas/recordings');
const { getSetting } = require('../schemas/setting');

const {
    convertSharedNote, updateSharedNoteName, updateNoteUptSU, updateNoteUptS, getAllAssignedAll, deleteSharedNote
} = require('../schemas/sharedNote');

const { findUserById, updateStorage } = require('../schemas/user');

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
            name, org, _id, title, editable,
            text, color, fileList, recId, catList
        } = req.body;

        const noteData = {
            title: title, org: org, text: text, postedby: req.token._id,
            color: color, attachment: fileList, recId: recId, editable,
            catList: catList, updated: false, isTask: false,
            created: Date.now(), date: new Date()
        };

        let note = await findNoteByName(name, _id, true, collectionNotes);

        if (!note) {
            await createNote(noteData, collectionNotes);

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

        const { _id, limit, search } = req.query;
        var p1 = getAllNoteLimit(_id, search, limit, true, collectionNotes);
        var p2 = getAllNoteCount(_id, search, true, collectionNotes);
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

        const { _id, limit, string, search } = req.query;
        var p1 = getAllNoteQueryLimit(_id, search, limit, string, true, collectionNotes);
        var p2 = getAllNoteQueryCount(_id, search, string, true, collectionNotes);
        var [notes, count] = [await p1, await p2];

        res.json({ noteList: notes, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getNote/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionNotes, collectionRecs, collectionFiles, collectionCats, collectionSNotes, collectionUser, collectionNotifs] = [
            await soda.createCollection('notes'), await soda.createCollection('recrs'), await soda.createCollection('user_files'),
            await soda.createCollection('user_cats'), await soda.createCollection('shrs_note'), await soda.createCollection('users'),
            await soda.createCollection('notifs')
        ];

        const { _id } = req.params;

        if (req.query.isEdt === 'false') await updateNoteUpt(_id, false, collectionNotes);
        else await updateNoteUptSU(req.token._id, _id, false, collectionSNotes);


        await updatedChanged(_id, req.token._id, collectionNotifs);

        let [note, count] = [await findNoteByIdF(_id, collectionNotes, collectionFiles, collectionCats, collectionUser), await getAllUptNoteCount(req.token._id, true, collectionNotes)];
        if (!note) throw new Error('Note not found');
        if (note && note.recId) var rec = await findRecById(note.recId, collectionRecs);

        res.json({ note: note, rec: rec ? rec : '', count: count });
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

        const { _id, title, text, color, fileList, recId, editable, catList, isEdt } = req.body;

        if (isEdt) await updateNoteUpt(_id, true, collectionNotes);
        else await updateNoteUptS(_id, true, collectionSharedN);
        [await updateNote(_id, title, text, color, fileList, recId, editable, catList, collectionNotes), await updateSharedNoteName(_id, title, collectionSharedN)];
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

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

router.post('/convertNote', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionNotes, collectionRecs, collectionFiles, collectionSharedN, collectionCats, collectionUser, collectionNotifs, collectionSets] = [
            await soda.createCollection('notes'), await soda.createCollection('recrs'),
            await soda.createCollection('user_files'), await soda.createCollection('shrs_note'),
            await soda.createCollection('user_cats'), await soda.createCollection('users'),
            await soda.createCollection('notifs'), await soda.createCollection('sets')
        ];

        const { _id } = req.body;

        let users = await getAllAssignedAll(_id, collectionSharedN, collectionUser);

        let date = new Date(Date.now());
        date.addHours(24);

        await convertNote(_id, true, date, 'In Progress', collectionNotes);
        await convertSharedNote(_id, date, 'In Progress', collectionSharedN);
        await fileChanged(_id, collectionNotifs);


        const note = await findNoteByIdF(_id, collectionNotes, collectionFiles, collectionCats, collectionUser);

        let rec = '';

        if (!note) throw new Error('Note not found.')
        if (note && note.recId) rec = await findRecById(note.recId, collectionRecs);

        const user = await findUserById(note.postedby, collectionUser);

        const set = await getSetting(collectionSets);

        let transporter = nodeMailer.createTransport({
            service: set.service,
            auth: {
                user: set.email,
                pass: set.pass
            }
        });

        if (users && users.length > 0) {
            users.map(i => {
                let html = `
            <img src="https://demo1.file-o.com/public/static/logo.png" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3 style="font-weight:400;">Hello <b>${i.name}</b>,</h3>
            
            <p>You have been assigned a task ${note.title} by ${user.name} in File-O.</p>

            <p><br/>Thank you for using File-O. Questions or concerns? Contact <a rel="noopener noreferrer" target="_blank" href="https://www.file-o.com/support">File-O Support</a>.</p>
            <br/>

            Sincerely,
            <br/>File-O Team<br/> <br/>

            <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
            <p>File-O is an affiliate of CWare Technologies.</p>`;

                var mailOptions = {
                    from: set.email,
                    to: i.email,
                    subject: 'File-O Task',
                    html: html
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    }

                });
            });

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
                    if (percent_left && percent_used) updatePackageDetails(org._id, uploaded_data, available, percent_left, percent_used, collectionOrg);
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