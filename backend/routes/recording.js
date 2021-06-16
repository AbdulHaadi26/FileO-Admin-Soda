const express = require('express');
const router = express.Router();

const uuidv4 = require('uuid/v4');
const JWT = require('../middlewares/jwtAuth');

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

        const collectionSet = await soda.createCollection('sets');
        const collectionRecs = await soda.createCollection('recrs');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');

        const { size, type, mime, fName } = req.body;

        let dataSize = size / (1024 * 1024 * 1024);
        let fileSize = 5;

        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        let user = await findUserById(req.token._id, collectionUser);
        let set = await getSetting(collectionSet);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 'Upload limit exceeded' });

        var fData = {
            name: fName, type: type, mimeType: mime, size: dataSize, bucketName: req.token.bucket,
            postedby: req.token._id, org: req.token.org, url: '', created: Date.now(), date: new Date()
        };

        let key = await createRec(fData, collectionRecs);
         await updateOrganizationStorage(req.token.org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
         await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser);

        const fileName = `${fName}.webm`;
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
    return `FileO/organization/${org}/user/recordings/${userId}/file/${_id}/${uuidv4()}/${fileName}`;
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

        const collectionRecs = await soda.createCollection('recrs');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');

        const { _id } = req.body;
        let rec = await findRecByIdDel(_id, collectionRecs);
        let org = await findOrganizationByIdUpt(rec.org, collectionOrg);
        let user = await findUserById(rec.postedby, collectionUser);

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
        let userData = await findUserById(rec.postedby, collectionUser);
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


        const collectionNote = await soda.createCollection('notes');
        const collectionRecs = await soda.createCollection('recrs');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');

        const { _id } = req.body;
        var rec = await findRecByIdDel(_id, collectionRecs);
        let org = await findOrganizationByIdUpt(rec.org, collectionOrg);
        let user = await findUserById(rec.postedby, collectionUser);

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

        let userData = await findUserById(rec.postedby, collectionUser);

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

        const collectionFileV = await soda.createCollection('file_views');
        const collectionRecs = await soda.createCollection('recrs');

        const { _id } = req.params;

        let file = await getFile(_id, collectionRecs);

        if (!file) throw new Error('File not found')

        let data = {
            orgId: req.token.org, userId: req.token._id,
            fileId: _id, fileSize: file.size, type: 3,
            created: Date.now(), date: new Date()
        };
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

        const collectionFileV = await soda.createCollection('file_views');
        const collectionRecs = await soda.createCollection('recrs');

        const { _id } = req.params;

        let file = await downloadFile(_id, collectionRecs);

        if (!file) throw new Error('File not found')

        let data = {
            orgId: req.token.org, userId: req.token._id,
            fileId: _id, fileSize: file.size, type: 3,
            created: Date.now(), date: new Date()
        };

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
        let count = await getAllRecCount(req.token._id, type, collectionFiles);

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

        if (string) fileList = await getAllRecQueryLimit(req.token._id, string, type, collectionFiles);
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
        let fileList = await getAllRecLimit(offset, req.token._id, type, collectionFiles);

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
        let count = await getAllRecQueryCount(req.token._id, string, type, collectionFiles);

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
        let fileList = await getAllRecQueryLimit(offset, req.token._id, string, type, collectionFiles);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;