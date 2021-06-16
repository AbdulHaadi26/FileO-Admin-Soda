const express = require('express');

const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const uuidv4 = require('uuid/v4');
const { deleteObject, putPresignedUrl } = require('../middlewares/oci-sdk');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');
const { findAncByName, createAnnouncement, getAncById, updateAnc, deleteAnc, getAncList, getAncListS, getANC } = require('../schemas/announcement');

const {
    findOrganizationByIdUpt,
    updatePackageDetails
} = require('../schemas/organization');

const {
    getSetting
} = require('../schemas/setting');

const {
    findUserById,
    updateStorage
} = require('../schemas/user');


router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAnc = await soda.createCollection('announcements');

        const { name, description, pId } = req.body;

        let annc = await findAncByName(pId, req.token._id, name, collectionAnc);

        if (!annc) {

            let data = {
                name,
                description,
                pId,
                org: req.token.org,
                userId: req.token._id,
                created: Date.now(),
                date: new Date(Date.now()),
                type: 'text',
                postedby: req.token._id
            }

            let key = await createAnnouncement(data, collectionAnc);

            data._id = key;

            res.json({ annc: data });
        } else {
            throw new Error('Announcement with this name already exists');
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/registerRec', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSet = await soda.createCollection('sets');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users')
        const collectionAnc = await soda.createCollection('announcements');

        const { name, description, pId, size, type, fName } = req.body;


        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        let user = await findUserById(req.token._id, collectionUser);
        let set = await getSetting(collectionSet);

        let dataSize = size / (1024 * 1024 * 1024);
        let fileSize = 5;

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 'Upload limit exceeded' });

        let annc = await findAncByName(pId, req.token._id, name, collectionAnc);

        if (!annc) {

            let data = {
                name,
                description,
                pId,
                org: req.token.org,
                userId: req.token._id,
                created: Date.now(),
                date: new Date(Date.now()),
                type: type,
                postedby: req.token._id,
                size: dataSize,
                bucketName: req.token.bucket
            }

            const fileName = `${fName}.webm`;
            data.rec = generateFileName(fileName, req.token.org, req.token._id);

            let key = await createAnnouncement(data, collectionAnc);

            await updateOrganizationStorage(req.token.org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
            await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser);

            data._id = key;

            const url = await putPresignedUrl(key, data.rec, req.token.bucket);

            res.json({ annc: data, url: url });
        } else {
            throw new Error('Announcement with this name already exists');
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function generateFileName(fileName, org, userId) {
    return `FileO/organization/${org}/user/recordings/${userId}/file/recording/${uuidv4()}/${fileName}`;
}

async function updateOrganizationStorage(org, d_u, avb, cb_p, size, collectionOrg) {
    var uploaded_data = Number(d_u) + Number(size);
    var available = Number(avb) - Number(size);
    if (uploaded_data < 0) uploaded_data = 0;
    if (available > cb_p) available = Number(cb_p);
    var percent_used = (((Number(cb_p - avb)) * 100) % (Number(cb_p)));
    if (percent_used > 100) percent_used = 100;
    var percent_left = 100 - Number(percent_used);
    if (percent_left < 0) percent_left = 0
    await updatePackageDetails(org, uploaded_data, available, percent_left, percent_used, collectionOrg);
}

async function updateUserStorage(userId, sU, sA, sL, size, collectionUser) {
    var userUploaded = Number(sU) + Number(size);
    var userAvailable = Number(sA) - Number(size);
    if (userUploaded < 0) userUploaded = 0;
    if (userAvailable > sL) userAvailable = Number(sL);
    await updateStorage(userId, userUploaded, userAvailable, collectionUser);
}

router.post('/update', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAnc = await soda.createCollection('announcements');

        const { name, description, pId, _id } = req.body;

        let annc = await getAncById(_id, collectionAnc);

        if (!annc) throw new Error('Announcement not found.');

        let isName;

        if (name !== annc.name) {
            isName = await findAncByName(pId, req.token._id, name, collectionAnc);
        };

        if (isName) throw new Error('Announcment with this name already exists');

        annc = '';

        annc = await updateAnc(_id, name, description, collectionAnc);

        if (!annc) throw new Error('Announcemnt could not be updated');

        res.json({ annc: annc });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.delete('/delete/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAnc = await soda.createCollection('announcements');

        const { _id } = req.params;

        let annc = await getAncById(_id, collectionAnc);

        if (annc && annc.rec) {

            const collectionOrg = await soda.createCollection('orgs');
            const collectionUser = await soda.createCollection('users');
            let org = await findOrganizationByIdUpt(req.token.org, collectionOrg);
            let user = await findUserById(annc.postedby, collectionUser);

            var uploaded_data = Number(org.data_uploaded)
            var available = Number(org.available);
            var combined_plan = Number(org.combined_plan);
            var percent_left, percent_used;
            var userUploaded = Number(user.storageUploaded);
            var userAvailable = Number(user.storageAvailable);
            var limit = Number(user.storageLimit);

            uploaded_data = uploaded_data - Number(annc.size);
            available = available + Number(annc.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);
            percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
            if (percent_used > 100) percent_used = 100;
            percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;


            userUploaded = userUploaded - Number(annc.size);
            userAvailable = userAvailable + Number(annc.size);
            if (userAvailable > limit) userAvailable = Number(limit);
            if (userUploaded < 0) userUploaded = 0;
            await deleteObject(annc.rec, req.token.bucket);

            await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
            await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);

        }

        if (!annc) throw new Error('Announcement not found.');

        await deleteAnc(_id, collectionAnc);

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/list', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAnc = await soda.createCollection('announcements');

        const { pId, string, type } = req.query;

        let annc;

        if (!string) {
            annc = await getAncList(pId, type, collectionAnc);
        } else {
            annc = await getAncListS(pId, type, string, collectionAnc);
        }

        res.json({ annc: annc });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/details/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAnc = await soda.createCollection('announcements');

        const { _id } = req.params;

        let annc = await getANC(_id, collectionAnc);

        if (!annc) throw new Error('Annoucement not found');

        res.json({ annc: annc });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;
