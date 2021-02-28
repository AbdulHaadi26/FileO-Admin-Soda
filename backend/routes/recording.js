const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');
const uuidv4 = require('uuid/v4');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    deleteObject,
    getPresignedUrl,
    putPresignedUrl
} = require('../middlewares/oci-sdk');

const {
    findOrganizationByIdUpt,
    updatePackageDetails
} = require('../schemas/organization');

const {
    findUserById,
    updateStorage
} = require('../schemas/user');

const {
    getSetting
} = require('../schemas/setting');

const {
    createRec,
    findRecByIdDel,
    deleteRec,
    downloadFile,
    updateUrl,
    getAllRecCount,
    getAllRecLimit,
    getAllRecQueryCount,
    getAllRecQueryLimit,
    getFile
} = require('../schemas/recordings');

const {
    unAttachRecording
} = require('../schemas/note');

const {
    createFileView
} = require('../schemas/fileView');

router.post('/register', JWT, async (req, res, next) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionSet, collectionRecs] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('sets'),
            await soda.createCollection('recrs')
        ];

        const { size, type, mime, fName } = req.body;
        var dataSize = size / (1024 * 1024 * 1024);
        var fileSize = 5;

        const p1 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        const p2 = findUserById(req.token._id, collectionUser);
        const p3 = getSetting(collectionSet);
        var [organ, user, set] = [await p1, await p2, await p3];

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 'Upload limit exceeded' });

        var fData = {
            name: fName, type: type, mimeType: mime, size: dataSize, bucketName: req.token.bucket,
            postedby: req.token._id, org: req.token.org, url: '', created: Date.now(), date: new Date()
        };

        var p4 = createRec(fData, collectionRecs);
        var p5 = updateOrganizationStorage(req.token.org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
        var p6 = updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser);
        var [key, upt, upt1] = [await p4, await p5, await p6];

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}.webm`;
        fData.url = generateFileName(fileName, req.token.org, key, req.token._id);

        let rec = await updateUrl(key, fData.url, collectionRecs);
        await generateFileUrl(key, req.token.bucket);
        const url = await putPresignedUrl(key, fData.url, req.token.bucket);

        if (url) res.status(200).json({ file: rec, url: url });
        else res.json({ error: 'Could not upload file version' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function generateFileUrl(file, bucket) {
    var url = '';
    if (file && file.url && bucket) url = await getPresignedUrl(file._id, file.url, bucket);
    if (url) file.url = url;
}

function generateFileName(fileName, org, _id, userId) {
    return `FileO/organization/${org}/user/recordings/${userId}/file/${_id}/${fileName}`;
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

router.post('/deleteRec', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionRecs] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('recrs')
        ];

        const { _id } = req.body;
        var rec = await findRecByIdDel(_id, collectionRecs);
        var p1 = findOrganizationByIdUpt(rec.org, collectionOrg);
        var p2 = findUserById(rec.postedby, collectionUser);
        var [org, user] = [await p1, await p2];

        var uploaded_data = Number(org.data_uploaded)
        var available = Number(org.available);
        var combined_plan = Number(org.combined_plan);
        var percent_left, percent_used;
        var userUploaded = Number(user.storageUploaded);
        var userAvailable = Number(user.storageAvailable);
        var limit = Number(user.storageLimit);
        if (rec && org) {
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
            await deleteObject(rec.url, req.token.bucket);
            await deleteRec(rec._id, collectionRecs);

            await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
            await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);
        }
        let userData = findUserById(rec.postedby, collectionUser);
        res.json({ user: userData });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteAttachment', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionRecs, collectionNote] = [
            await soda.createCollection('users'), await soda.createCollection('orgs'),
            await soda.createCollection('recrs'), await soda.createCollection('notes')
        ];

        const { _id } = req.body;
        var rec = await findRecByIdDel(_id, collectionRecs);
        var p1 = findOrganizationByIdUpt(rec.org, collectionOrg);
        var p2 = findUserById(rec.postedby, collectionUser);
        var [org, user] = [await p1, await p2];

        var uploaded_data = Number(org.data_uploaded)
        var available = Number(org.available);
        var combined_plan = Number(org.combined_plan);
        var percent_left, percent_used;
        var userUploaded = Number(user.storageUploaded);
        var userAvailable = Number(user.storageAvailable);
        var limit = Number(user.storageLimit);

        if (rec && org) {
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
            await deleteObject(rec.url, req.token.bucket);
            await unAttachRecording(rec._id, collectionNote);
            await deleteRec(rec._id, collectionRecs);

            await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
            await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);
        }

        let userData = findUserById(rec.postedby, collectionUser);

        res.json({ user: userData });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFile/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionRecs, collectionFileV] = [
            await soda.createCollection('recrs'), await soda.createCollection('file_views')
        ];

        const { _id } = req.params;
        let file = await getFile(_id, collectionRecs);
        if (!file) throw new Error('File not found')
        var data = { orgId: req.token.org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 3, created: Date.now(), date: new Date() };
        await createFileView(data, collectionFileV);

        res.json({ file: file });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/download/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionRecs, collectionFileV] = [
            await soda.createCollection('recrs'), await soda.createCollection('file_views')
        ];

        const { _id } = req.params;
        let file = await downloadFile(_id, collectionRecs);
        if (!file) throw new Error('File not found')
        var data = { orgId: req.token.org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 3, created: Date.now(), date: new Date() };
        await createFileView(data, collectionFileV);

        res.json({ file: file });
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

        const collectionFiles = await soda.createCollection('recrs');

        const { type } = req.query;
        var count = await getAllRecCount(req.token._id, type, collectionFiles);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCombined', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('recrs');

        const { string, type } = req.query;
        let fileList;

        if (string) fileList = await getAllRecQueryCount(req.token._id, string, type, collectionFiles);
        else fileList = await getAllRecLimit(req.token._id, type, collectionFiles);

        return res.json({ files: fileList });
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

        const collectionFiles = await soda.createCollection('recrs');

        const { offset, type } = req.query;
        var fileList = await getAllRecLimit(offset, req.token._id, type, collectionFiles);

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
        const collectionFiles = await soda.createCollection('recrs');

        const { string, type } = req.query;
        var count = await getAllRecQueryCount(req.token._id, string, type, collectionFiles);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('recrs');

        const { offset, string, type } = req.query;
        var fileList = await getAllRecQueryLimit(offset, req.token._id, string, type, collectionFiles);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;