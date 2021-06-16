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

const {
    deleteDiscussions
} = require('../schemas/discussion');

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
    getAllUptNoteCount,
    findNoteById,
    updateNoteT,
    findNoteByNameEQ
} = require('../schemas/note');

const {
    fileChanged,
    updatedChanged,
    createNotification
} = require('../schemas/notification');

const {
    findOrganizationByIdUpt,
    updatePackageDetails
} = require('../schemas/organization');

const {
    findRecById,
    findRecByIdDel,
    deleteRec,
    updateRecName
} = require('../schemas/recordings');


const { getSetting } = require('../schemas/setting');

const {
    convertSharedNote, updateSharedNoteName, updateNoteUptSU, updateNoteUptS, getAllAssignedAll, deleteSharedNote, createSharedN, deleteAssigned
} = require('../schemas/sharedNote');

const { findUserById, updateStorage } = require('../schemas/user');
const { fileOUrl, logoUrl } = require('../constants');
const { createDesc, removeDesc, getDescById, updateDescription } = require('../schemas/description');

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
            org, title, editable, icon,
            text, color, fileList, recId, catList
        } = req.body;

        let noteData = {
            title: title, org: org, text: '', postedby: req.token._id,
            color: color, attachment: fileList, recId: recId, editable,
            catList: catList, updated: false, isTask: false,
            created: Date.now(), date: new Date(), icon: icon
        };

        let note = await findNoteByName(title, req.token._id, true, collectionNotes);

        if (!note) {
            let descData = {
                postedby: req.token._id, org: org, text: text
            };

            let keyD = await createDesc(descData, collectionDesc);

            noteData.text = keyD;
            let key = await createNote(noteData, collectionNotes);

            noteData._id = key;
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


router.get('/fetchNotes', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');

        const { _id, limit, search } = req.query;

        let notes = await getAllNoteLimit(_id, search, limit, true, collectionNotes);
        let count = await getAllNoteCount(_id, search, true, collectionNotes);

        res.json({ noteList: notes, count: count });
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

        let note = await updateNoteT(noteId, userId, collectionNotes);

        if (!note) throw new Error('Note could not be transfered');

        await deleteAssigned(userId, noteId, collectionSharedN);

        note = await findNoteByIdP(noteId, collectionNotes, collectionUser);

        if (!note) throw new Error('Note not found');

        let sharedData = {
            sharedWName: user.name, sharedWith: req.token._id, sharedBy: note.postedby._id, created: Date.now(), date: new Date(),
            sharedByName: note.postedby.name, noteId: noteId, noteTitle: note.title, org: note.org, updated: true,
            isTask: false, sharedWEmail: user.email
        };

        await createSharedN(sharedData, collectionSharedN);

        let date = parseDate();
        let title = `${note.postedby.name} has shared a note with you.`, message = `A new note ${note.title} has been shared by ${note.postedby.name} with you on ${date} in File-O.`;
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

router.get('/fetchNotesSearch', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionNotes = await soda.createCollection('notes');

        const { _id, limit, string, search } = req.query;

        let notes = await getAllNoteQueryLimit(_id, search, limit, string, true, collectionNotes);
        let count = await getAllNoteQueryCount(_id, search, string, true, collectionNotes);

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

        const collectionUser = await soda.createCollection('users');
        const collectionNotes = await soda.createCollection('notes');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionRecs = await soda.createCollection('recrs');
        const collectionFiles = await soda.createCollection('user_files');
        const collectionSNotes = await soda.createCollection('shrs_note');
        const collectionDesc = await soda.createCollection('note_desc');

        const { _id } = req.params;

        if (req.query.isEdt === 'false') await updateNoteUpt(_id, false, collectionNotes);
        else await updateNoteUptSU(req.token._id, _id, false, collectionSNotes);


        await updatedChanged(_id, req.token._id, collectionNotifs);

        let count = await getAllUptNoteCount(req.token._id, true, collectionNotes);
        let note = await findNoteByIdF(_id, collectionNotes, collectionFiles, collectionCats, collectionUser);

        if (!note) throw new Error('Note not found');

        let text = await getDescById(note.text, collectionDesc);

        note.text = text;

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

        const collectionUser = await soda.createCollection('users');
        const collectionNotes = await soda.createCollection('notes');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionRecs = await soda.createCollection('recrs');
        const collectionFiles = await soda.createCollection('user_files');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collectionDesc = await soda.createCollection('note_desc');

        const { _id, title, text, color, fileList, recId, editable, catList, isEdt, icon } = req.body;

        let note = await findNoteById(_id, collectionNotes);

        if (isEdt) await updateNoteUpt(_id, true, collectionNotes);
        else await updateNoteUptS(_id, true, req.token._id, collectionSharedN);

        await updateNote(_id, title, color, fileList, recId, editable, catList, icon, collectionNotes);

        await updateSharedNoteName(_id, title, collectionSharedN);

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

        const collectionUser = await soda.createCollection('users');
        const collectionNotes = await soda.createCollection('notes');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionRecs = await soda.createCollection('recrs');
        const collectionFiles = await soda.createCollection('user_files');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collectionSets = await soda.createCollection('sets');

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
            <img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3 style="font-weight:400;">Hello <b>${i.name}</b>,</h3>
            
            <p>You have been assigned a task ${note.title} by ${user.name} in File-O.</p>

            <p><br/>Thank you for using File-O. Questions or concerns? Contact <a rel="noopener noreferrer" target="_blank" href="${fileOUrl}/support">File-O Support</a>.</p>
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

        const collectionUser = await soda.createCollection('users');
        const collectionNotes = await soda.createCollection('notes');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collectionRecs = await soda.createCollection('recs');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionD = await soda.createCollection('discussions');
        const collectionDesc = await soda.createCollection('note_desc');


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
                    if (percent_left && percent_used) updatePackageDetails(org._id, uploaded_data, available, percent_left, percent_used, collectionOrg);
                    await updateStorage(user._id, userUploaded, userAvailable, collectionUser);
                    await deleteObject(rec.url, req.token.bucket);
                }
            }

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