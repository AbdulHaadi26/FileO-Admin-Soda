const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getDiscussion,
    createDiscussion,
    discussionCount
} = require('../schemas/discussion');

const {
    updateNoteUpt
} = require('../schemas/note');

const {
    createNotification
} = require('../schemas/notification');

const {
    getCatById
} = require('../schemas/projectCategory');

const {
    getFileId
} = require('../schemas/projectFile');

const {
    getProjectById
} = require('../schemas/projects');

const {
    updateCatUptS,
    updateCatUptSParent
} = require('../schemas/sharedCat');

const {
    updateFileUptS
} = require('../schemas/sharedFile');

const {
    updateNoteUptS
} = require('../schemas/sharedNote');

const {
    findUserById
} = require('../schemas/user');

const {
    updateCatUpt
} = require('../schemas/userCategory');

const {
    updateValue
} = require('../schemas/userFile');


router.get('/getDiscussion/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionDiscussion = await soda.createCollection('discussion');
        const collectionUser = await soda.createCollection('users');

        const { _id } = req.params;

        let messages = await getDiscussion(_id, req.query.offset, collectionDiscussion, collectionUser);
        let count = await discussionCount(_id, collectionDiscussion);

        res.json({ messages, count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionDiscussion = await soda.createCollection('discussion');
        const collectionUser = await soda.createCollection('users');

        const { _id, message, isEdt, isFile, category, isP, isPM, project } = req.body;

        let data = {
            id: _id,
            postedby: req.token._id,
            created: Date.now(),
            date: new Date(Date.now()),
            message
        }

        if (!project)
            if (!isFile && !isP) {
                let collectionNotes = await soda.createCollection('notes');
                let collectionSharedN = await soda.createCollection('shrs_note');
                if (isEdt) await updateNoteUpt(_id, true, collectionNotes);
                else await updateNoteUptS(_id, true, req.token._id, collectionSharedN);
            } else if (isFile && !isP) {

                let collectionFiles = await soda.createCollection('user_files');
                let collectionShared = await soda.createCollection('shrs');
                let collectionCat = await soda.createCollection('user_cats');
                let collectionSharedC = await soda.createCollection('shrs_cat');

                if (isEdt) {
                    await updateValue(_id, 'update', true, collectionFiles);
                    category && updateCatUpt(category, true, collectionCat);
                }
                else {
                    await updateValue(_id, 'last_updated', true, collectionFiles);
                    await updateFileUptS(_id, true, collectionShared);
                    category && await updateCatUptSParent(category, collectionCat, collectionSharedC);
                    category && await updateCatUptS(category, true, collectionSharedC);
                }
            } else {
                let collectionFiles = await soda.createCollection('proj_files');
                let collectionProjs = await soda.createCollection('projs');
                let collectionCat = await soda.createCollection('proj_cats');
                let collectionNotifs = await soda.createCollection('notifs');

                let file = await getFileId(_id, collectionFiles);

                if (file) {
                    let project = await getProjectById(file.pId, collectionProjs);
                    if (project) {
                        let date = parseDate();
                        let title = `${isPM ? 'Project Manager' : 'Participant'} has commented on a ${file.name}.`, msg = `A new comment has been added to ${file.name} by the ${isPM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;
                        await generateNotification(req.token.org, file.category, req.token._id, title, msg, 1, isPM ? 1 : 2, _id, project, isPM, date, file.type, file.pId, collectionNotifs, collectionCat);
                    }
                }
            }

        let key = await createDiscussion(data, collectionDiscussion);

        let user = await findUserById(data.postedby, collectionUser);
        data.key = key;
        data.userId = req.token._id;
        data.postedby = user.name;
        res.json({ message: data });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function generateNotification(org, cat, pBy, title, message, t, uT, fileId, project, PM, dt, mime, pId, collectionNotifs, collectionCat) {
    let category = await getCatById(cat, collectionCat);

    category && category.ids && category.ids.length > 0 && await Promise.all(category.ids.map(async id => {
        var data = {
            postedBy: pBy, title: title, message: message,
            recievedBy: id, type: t, userType: uT, org: org,
            id: fileId, date: dt, mimeType: mime, pId: pId,
            date: new Date(), created: Date.now()
        };
        await createNotification(data, collectionNotifs);
    }));
};

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
};

module.exports = router;