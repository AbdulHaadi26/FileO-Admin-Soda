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
    copyObject
} = require('../middlewares/oci-sdk');

const {
    getFile,
    getAllFileVersion,
    getAllFileCount,
    getAllFileLimit,
    getAllFileQueryCount,
    getAllFileQueryLimit,
    findFileByName,
    updateValue,
    updateFileCountS,
    findCFileById,
    deleteMultipleFilesArr,
    updateFilePerm,
    deleteFile,
    findMultipleFilesArr,
    getAllNamesByArr,
    updateFilesCat,
    updateUrl,
    createFile,
    downloadFile,
    getAllFileQueryCountC,
    getAllFileQueryLimitC,
    getAllFileCountC,
    getAllFileLimitC,
    updateDetails
} = require('../schemas/clientFile');

const {
    getAllCats, getAllCCatUptCountS
} = require('../schemas/clientsCategory');

const {
    isFavorite,
    updateFvrName,
    deleteFvrFiles,
    deleteMultipleFilesArrFvr,
    updateMultipleFilesArrFvr
} = require('../schemas/favrFiles');

const {
    createFileView
} = require('../schemas/fileView');

const {
    findOrganizationByIdUpt,
    updatePackageDetails
} = require('../schemas/organization');

const {
    findUserById, updateStorage
} = require('../schemas/user');

const {
    getSetting
} = require('../schemas/setting');

const { filesChanged, updatedChanged } = require('../schemas/notification');

router.get('/getFileCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('client_files');
        const { cat, type, pId } = req.query;
        let count = await getAllFileCount(pId, cat, type, collectionFile);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionFvrFile, collectionCats, collectionFileV, collectionNotifs] = [
            await soda.createCollection('client_files'), await soda.createCollection('favr_files'),
            await soda.createCollection('client_cats'), await soda.createCollection('file_views'),
            await soda.createCollection('notifs')
        ];

        const { _id, pId } = req.query;

        await updateValue(_id, 'updated', false, collectionFile);
        await updatedChanged(_id, req.token._id, collectionNotifs);
        const p1 = getFile(_id, collectionFile, collectionCats);
        const p2 = getAllCats(pId, collectionCats);
        const p3 = isFavorite(_id, req.token._id, collectionFvrFile);
        var [file, catList, isF] = [await p1, await p2, await p3];

        let data = { orgId: req.token.org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 3, created: Date.now(), date: new Date() };
        await createFileView(data, collectionFileV);

        res.json({ file: file, catList: catList, isF: isF });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFileShared', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionUser, collectionCats, collectionFileV, collectionNotifs] = [
            await soda.createCollection('client_files'), await soda.createCollection('users'),
            await soda.createCollection('client_cats'), await soda.createCollection('file_views'),
            await soda.createCollection('notifs')
        ];

        const { _id, pId } = req.query;


        await updatedChanged(_id, req.token._id, collectionNotifs);
        const p1 = getFile(_id, collectionFile, collectionCats);
        const p2 = getAllCats(pId, collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);
        let [file, catList, versions] = [await p1, await p2, await p3];

        let data = { orgId: req.token.org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 3, created: Date.now(), date: new Date() };
        await createFileView(data, collectionFileV);

        res.json({ file: file, catList: catList, versions: versions });
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

        const [collectionFile, collectionFileV] = [
            await soda.createCollection('client_files'), await soda.createCollection('file_views')
        ];

        const { _id } = req.params;
        let file = await downloadFile(_id, collectionFile);

        let data = { orgId: req.token.org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 3, created: Date.now(), date: new Date() };
        await createFileView(data, collectionFileV);

        res.json({ file: file });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFileDetails', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionUser, collectionCats, collectionNotifs] = [
            await soda.createCollection('client_files'), await soda.createCollection('users'), await soda.createCollection('client_cats'),
            await soda.createCollection('notifs')
        ];

        const { _id, pId } = req.query;

        await updateValue(_id, 'updated', false, collectionFile);
        await updatedChanged(_id, req.token._id, collectionNotifs);
        const p1 = getFile(_id, collectionFile, collectionCats);
        const p2 = getAllCats(pId, collectionCats);
        const [file, catList] = [await p1, await p2];

        return res.json({ file: file, catList: catList });
    } catch {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFileShare', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionUser, collectionCats, collectionNotifs] = [
            await soda.createCollection('client_files'), await soda.createCollection('users'), await soda.createCollection('client_cats'),
            await soda.createCollection('notifs')
        ];

        const { _id } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        const p1 = getFile(_id, collectionFile, collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);
        let [file, versions] = [await p1, await p3];

        return res.json({ file: file, versions: versions });
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

        const [collectionFile, collectionCat] = [await soda.createCollection('client_files'), await soda.createCollection('client_cats')];

        const { pId, cat, type, string } = req.query;
        let fileList;

        await updateFileCountS(cat, collectionCat);

        if (string) fileList = await getAllFileQueryLimit(pId, string, cat, type, collectionFile);
        else fileList = await getAllFileLimit(pId, cat, type, collectionFile);

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

        const collectionFile = await soda.createCollection('client_files');

        const { string, pId, cat, type } = req.query;
        var count = await getAllFileQueryCount(pId, string, cat, type, collectionFile);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
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

        const collectionFile = await soda.createCollection('client_files');

        const { offset, string, pId, cat, type } = req.query;
        var fileList = await getAllFileQueryLimit(offset, pId, string, cat, type, collectionFile);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/updated/count', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCats = await soda.createCollection('client_cats');

        let count = await getAllCCatUptCountS(req.token._id, collectionCats);

        return res.json({ count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateFile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionCats, collectionFvrFile] = [
            await soda.createCollection('client_files'), await soda.createCollection('client_cats'), await soda.createCollection('favr_files')
        ];

        const { name, description, _id, cat } = req.body;

        let fileDetails = await getFile(_id, collectionFile, collectionCats);
        let file;

        if (!fileDetails) throw new Error('File with this key does not exist');
        if (fileDetails.name !== name) file = await findFileByName(_id, req.token.org, cat, collectionFile);
        
        if(file) throw new Error('File with this name already exists');

        if (fileDetails.name !== name) await updateFvrName(_id, name, collectionFvrFile);

        let category = await updateDetails(_id, name, description, cat, collectionFile);

        if(!category) throw new Error('File details could not be updated');

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateFilePerm', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionCats, collectionUser] = [
            await soda.createCollection('client_files'), await soda.createCollection('client_cats'), await soda.createCollection('users')
        ];

        const { versioning, compare, active, uploadable, _id, pId } = req.body;
        await updateFilePerm(_id, active, versioning, compare, uploadable, collectionFile);
        const p1 = getFile(_id, collectionCats, collectionFile);
        const p2 = getAllCats(pId, collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);

        var [file, catList, versions] = [await p1, await p2, await p3];

        res.json({ file: file, catList: catList, versions: versions });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteFile/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionOrg, collectionUser, collectionFvrFile, collectionNotifs] = [
            await soda.createCollection('client_files'), await soda.createCollection('orgs'),
            await soda.createCollection('users'), await soda.createCollection('favr_files'),
            await soda.createCollection('notifs')
        ];

        const { _id } = req.params;
        var file = await findCFileById(_id, collectionFile);
        var p1 = findOrganizationByIdUpt(file.org, collectionOrg);
        var p2 = findUserById(file.postedFor, collectionUser);
        var [org, user] = [await p1, await p2];

        if (!file) throw new Error('File not found')

        var uploaded_data = Number(org.data_uploaded)
        var available = Number(org.available);
        var combined_plan = Number(org.combined_plan);
        var percent_left, percent_used;
        var userUploaded = Number(user.storageUploaded);
        var userAvailable = Number(user.storageAvailable);
        var limit = Number(user.storageLimit);


        uploaded_data = uploaded_data - Number(file.size);
        available = available + Number(file.size);
        if (uploaded_data < 0) uploaded_data = 0;
        if (available > combined_plan) available = Number(combined_plan);
        percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
        if (percent_used > 100) percent_used = 100;
        percent_left = 100 - Number(percent_used);
        if (percent_left < 0) percent_left = 0;

        userUploaded = userUploaded - Number(file.size);
        userAvailable = userAvailable + Number(file.size);
        if (userAvailable > limit) userAvailable = Number(limit);
        if (userUploaded < 0) userUploaded = 0;
        await deleteObject(file.url, req.token.bucket);
        await deleteFile(file._id, collectionFile);

        [await deleteFvrFiles(file._id, collectionFvrFile), await filesChanged([file._id], collectionNotifs)];
        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);
        let userData = findUserById(req.token._id, collectionUser);

        res.json({ user: userData });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionUser, collectionOrg, collectionFvrFile, collectionNotifs] = [
            await soda.createCollection('client_files'), await soda.createCollection('users'),
            await soda.createCollection('orgs'), await soda.createCollection('favr_files'),
            await soda.createCollection('notifs')
        ];

        const { arr } = req.body;
        var p0 = findUserById(req.token._id, collectionUser);
        var p1 = findMultipleFilesArr(arr, collectionFile);
        var p2 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        var [user, files, organ] = [await p0, await p1, await p2];
        if (!user) return res.json({ error: 'User not found' });
        if (!organ) return res.json({ error: 'Organization not found' });
        var uploaded_data = Number(organ.data_uploaded)
        var available = Number(organ.available);
        var combined_plan = Number(organ.combined_plan);
        var percent_left, percent_used;
        var userUploaded = Number(user.storageUploaded);
        var userAvailable = Number(user.storageAvailable);
        var limit = Number(user.storageLimit);

        if (files && files.length > 0) await Promise.all(files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);
            percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
            if (percent_used > 100) percent_used = 100;
            percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;

            userUploaded = userUploaded - Number(file.size);
            userAvailable = userAvailable + Number(file.size);
            if (userAvailable > limit) userAvailable = Number(limit);
            if (userUploaded < 0) userUploaded = 0;
            file.url && await deleteObject(file.url, req.token.bucket);
            await deleteFile(file._id, collectionFile)
        }));

        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        [await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser), await filesChanged(arr, collectionNotifs),
        await deleteMultipleFilesArr(arr, collectionFile), arr && arr.length > 0 && await deleteMultipleFilesArrFvr(arr, collectionFvrFile)]

        return res.json({ success: 'File Deleted' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateFilesCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionFvrFile] = [await soda.createCollection('client_files'), await soda.createCollection('favr_files')];

        const { value, arr } = req.body;

        var lIds = await getAllNamesByArr(arr, value, collectionFile);

        if (lIds && lIds.length > 0) [await updateFilesCat(lIds, value, collectionFile), await updateMultipleFilesArrFvr(lIds, collectionFvrFile)]
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/copyFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionOrg, collectionSets] = [
            await soda.createCollection('client_files'), await soda.createCollection('orgs'), await soda.createCollection('sets')
        ];

        const { arr, catId } = req.body;

        var fileSize = 5;
        const p1 = getSetting(collectionSets);
        const p2 = findMultipleFilesArr(arr, collectionFile);
        var [set, files] = [await p1, await p2];

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        if (files && files.length > 0) {
            await Promise.all(files.map(async file => {
                var fileData = {
                    name: `${file.name}-copy`, mimeType: file.mimeType, type: file.type, size: file.size,
                    postedFor: file.postedFor, org: file.org, category: catId, date: new Date(), versionId: file.versionId,
                    description: file.description, url: '', postedBy: file.postedBy, email: file.email,
                    contact: file.contact, bucketName: req.token.bucket, isVersion: false, version: 0, created: Date.now()
                };

                var p3 = findFileByName(fileData.name, req.token.org, catId, collectionFile);
                var p4 = findOrganizationByIdUpt(req.token.org, collectionOrg);
                var [f, organ] = [await p3, await p4];

                if (!f && fileData.size < fileSize && organ.available > fileData.size) {
                    let key = await createFile(fileData, collectionFile);
                    const fl = file.url;
                    const type = fl.split('.').slice(-1);
                    const fileName = `${uuidv4()}${fileData.name.toLowerCase().split(' ').join('-')}.${type}`;
                    fileData.url = generateFileName(fileName, file.org, catId, key, file.postedFor);

                    await updateUrl(key, fileData.url, collectionFile);
                    const url = await copyObject(file.url, fileData.url, req.token.bucket);
                    if (url) await updateOrganizationStorage(file.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
                    else await deleteFile(file._id, collectionFile);
                }
            }));
        };

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFileCountC', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('client_files');
        const { type, pId } = req.query;
        let count = await getAllFileCountC(pId, type, collectionFile);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFilesC', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionCats] = [await soda.createCollection('client_files'), await soda.createCollection('client_cats')];

        const { offset, pId, type } = req.query;
        var fileList = await getAllFileLimitC(offset, pId, type, collectionFile, collectionCats);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFileCountC', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('client_files');

        const { string, pId, type } = req.query;
        var count = await getAllFileQueryCountC(pId, string, type, collectionFile);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFilesC', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionCats] = [await soda.createCollection('client_files'), await soda.createCollection('client_cats')];

        const { offset, string, pId, type } = req.query;
        var fileList = await getAllFileQueryLimitC(offset, pId, string, type, collectionFile, collectionCats);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function generateFileName(fileName, org, catId, _id, userId) {
    return `FileO/organization/${org}/user/${userId}/myclients/category/${catId}/files/${_id}/${fileName}`;
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

module.exports = router;