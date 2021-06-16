const express = require('express');
const router = express.Router();
const JWT = require('../../../middlewares/jwtAuth');
const uuidv4 = require('uuid/v4');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../../middlewares/oracleDB');

const {
    deleteObject,
    copyObject
} = require('../../../middlewares/oci-sdk');

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
    updateDetails,
    findFileByNameC,
    updateCat
} = require('../../../schemas/personal/schemas/clientFile');

const {
    getAllCats,
    getAllCCatUptCountS
} = require('../../../schemas/personal/schemas/clientsCategory');

const {
    isFavorite,
    updateFvrName,
    deleteFvrFiles,
    deleteMultipleFilesArrFvr,
    updateMultipleFilesArrFvr
} = require('../../../schemas/personal/schemas/favrFiles');

const {
    createFileView
} = require('../../../schemas/personal/schemas/fileView');

const {
    findUserById,
    updatePackageDetails
} = require('../../../schemas/personal/schemas/user');

const {
    getSetting
} = require('../../../schemas/personal/schemas/setting');

const {
    filesChanged,
    updatedChanged
} = require('../../../schemas/personal/schemas/notification');

const {
    findRecFileById, createRecentFile, updateRecFileU, updateRectFileP, deleteRecentFile, deleteRecentFileId
} = require('../../../schemas/personal/schemas/recentClientFile');

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

        const collectionFile = await soda.createCollection('client_files');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionCats = await soda.createCollection('client_cats')
        const collectionFileV = await soda.createCollection('file_views');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionRecent = await soda.createCollection('crecfs');

        const { _id } = req.query;

        await updateValue(_id, 'updated', false, collectionFile);
        await updatedChanged(_id, req.token._id, collectionNotifs);

        let fl = await findRecFileById(_id, 0, collectionRecent);
        let file = await getFile(_id, collectionFile, collectionCats);
        let isF = await isFavorite(_id, req.token._id, collectionFvrFile);

        if (!file) throw new Error('Could not find file');

        let recentData = {
            fileId: _id, userId: req.token._id, versionId: file.versionId,
            name: file.name, type: file.type, date: new Date(), created: Date.now(),
            isPerm: false, isDel: false
        };

        if (fl) await deleteRecentFile(fl._id, collectionRecent);
        await createRecentFile(recentData, collectionRecent);

        let data = { flag: 'P', userId: req.token._id, fileId: _id, fileSize: file.size, type: 3, created: Date.now(), date: new Date() };

        await createFileView(data, collectionFileV);

        res.json({ file: file, isF: isF });
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

        const collectionFile = await soda.createCollection('client_files');
        const collectionUser = await soda.createCollection('users');
        const collectionCats = await soda.createCollection('client_cats');
        const collectionFileV = await soda.createCollection('file_views');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id, pId } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);

        let file = await getFile(_id, collectionFile, collectionCats);
        let catList = await getAllCats(pId, collectionCats);
        let versions = await getAllFileVersion(_id, collectionFile, collectionUser);

        let data = { flag: 'P', userId: req.token._id, fileId: _id, fileSize: file.size, type: 3, created: Date.now(), date: new Date() };
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

        const collectionFile = await soda.createCollection('client_files');
        const collectionFileV = await soda.createCollection('file_views');

        const { _id } = req.params;
        let file = await downloadFile(_id, collectionFile);

        let data = { flag: 'P', userId: req.token._id, fileId: _id, fileSize: file.size, type: 3, created: Date.now(), date: new Date() };
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

        const collectionFile = await soda.createCollection('client_files');
        const collectionCats = await soda.createCollection('client_cats');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id, pId } = req.query;

        await updateValue(_id, 'updated', false, collectionFile);
        await updatedChanged(_id, req.token._id, collectionNotifs);

        let file = await getFile(_id, collectionFile, collectionCats);
        let catList = await getAllCats(pId, collectionCats);

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

        const collectionFile = await soda.createCollection('client_files');
        const collectionUser = await soda.createCollection('users');
        const collectionCats = await soda.createCollection('client_cats');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);

        let file = await getFile(_id, collectionFile, collectionCats);
        let versions = await getAllFileVersion(_id, collectionFile, collectionUser);

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

        const collectionFile = await soda.createCollection('client_files');
        const collectionCat = await soda.createCollection('client_cats');

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

        let count = await getAllFileQueryCount(pId, string, cat, type, collectionFile);

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

        let fileList = await getAllFileQueryLimit(offset, pId, string, cat, type, collectionFile);

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

        const collectionFile = await soda.createCollection('client_files');
        const collectionCats = await soda.createCollection('client_cats');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('crecfs');

        const { name, description, _id, cat } = req.body;

        let fileDetails = await getFile(_id, collectionFile, collectionCats);
        let file;

        if (!fileDetails) throw new Error('File with this key does not exist');
        if (fileDetails.name !== name) file = await findFileByName(name, req.token._id, cat, collectionFile);

        if (file) throw new Error('File with this name already exists');

        if (fileDetails.name !== name) await updateFvrName(_id, name, collectionFvrFile);

        file = '';

        file = await updateDetails(_id, name, description, cat, collectionFile);

        await deleteRecentFileId(_id, collectionRecent);

        if (!file) throw new Error('File details could not be updated');

        res.json({ file });
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

        const collectionFile = await soda.createCollection('client_files');
        const collectionCats = await soda.createCollection('client_cats');
        const collectionUser = await soda.createCollection('users');

        const { versioning, compare, active, uploadable, _id, pId } = req.body;
        await updateFilePerm(_id, active, versioning, compare, uploadable, collectionFile);

        let file = await getFile(_id, collectionCats, collectionFile);
        let catList = await getAllCats(pId, collectionCats);
        let versions = await getAllFileVersion(_id, collectionFile, collectionUser);

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

        const collectionFile = await soda.createCollection('client_files');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionUser = await soda.createCollection('users');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('crecfs');

        const { _id } = req.params;
        var file = await findCFileById(_id, collectionFile);

        let user = await findUserById(file.postedFor, collectionUser);

        if (!file) throw new Error('File not found')

        var uploaded_data = Number(user.data_uploaded)
        var available = Number(user.available);
        var combined_plan = Number(user.combined_plan);

        uploaded_data = uploaded_data - Number(file.size);
        available = available + Number(file.size);
        if (uploaded_data < 0) uploaded_data = 0;
        if (available > combined_plan) available = Number(combined_plan);

        await deleteObject(file.url, req.token.bucket);
        await deleteFile(file._id, collectionFile);

        await deleteFvrFiles(file._id, collectionFvrFile);
        await filesChanged([file._id], collectionNotifs);

        await updatePackageDetails(req.token._id, uploaded_data, available, collectionUser);

        await deleteRecentFileId(file._id, collectionRecent);

        let userData = await findUserById(req.token._id, collectionUser);

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

        const collectionFile = await soda.createCollection('client_files');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionUser = await soda.createCollection('users');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('crecfs');

        const { arr } = req.body;

        let user = await findUserById(req.token._id, collectionUser);
        let files = await findMultipleFilesArr(arr, collectionFile);

        if (!user) return res.json({ error: 'User not found' });

        var uploaded_data = Number(user.data_uploaded)
        var available = Number(user.available);
        var combined_plan = Number(user.combined_plan);

        if (files && files.length > 0) await Promise.all(files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);

            file.url && await deleteObject(file.url, req.token.bucket);
            await deleteFile(file._id, collectionFile);
            await deleteRecentFileId(file._id, collectionRecent);
        }));

        await updatePackageDetails(req.token._id, uploaded_data, available, collectionUser);
        await filesChanged(arr, collectionNotifs);
        await deleteMultipleFilesArr(arr, collectionFile);
        arr && arr.length > 0 && await deleteMultipleFilesArrFvr(arr, collectionFvrFile);

        return res.json({ success: 'File Deleted' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateFileCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { cat, _id } = req.body;


        const collectionFile = await soda.createCollection('client_files');
        const collectionCats = await soda.createCollection('client_cats');

        let fileDetails = await getFile(_id, collectionFile, collectionCats);

        if (!fileDetails) throw new Error('File with this key does not exist');

        let file = await findFileByNameC(fileDetails.name, req.token._id, cat, collectionFile, collectionCats);

        if (file) return res.json({ error: 'Client File', mainFile: fileDetails._id, file: file._id, cat: cat })

        let upt = await updateCat(_id, cat, collectionFile);

        if (!upt) throw new Error('File Details not updated');

        res.json({ success: true });
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

        const collectionFile = await soda.createCollection('client_files');
        const collectionFvrFile = await soda.createCollection('favr_files');

        const { value, arr } = req.body;

        let lIds = await getAllNamesByArr(arr, value, collectionFile);

        if (lIds && lIds.length > 0) {
            await updateFilesCat(lIds, value, collectionFile);
            await updateMultipleFilesArrFvr(lIds, collectionFvrFile);
        }
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

        const collectionFile = await soda.createCollection('client_files');
        const collectionSets = await soda.createCollection('sets');
        const collectionUser = await soda.createCollection('users');

        const { arr, catId } = req.body;

        let fileSize = 5;

        let set = await getSetting(collectionSets);
        let files = await findMultipleFilesArr(arr, collectionFile);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        if (files && files.length > 0) {
            await Promise.all(files.map(async file => {
                var fileData = {
                    name: `${file.name}-copy`, mimeType: file.mimeType, type: file.type, size: file.size,
                    postedFor: file.postedFor, flag: 'P', category: catId, date: new Date(), versionId: file.versionId,
                    description: file.description, url: '', postedBy: file.postedBy, email: file.email,
                    contact: file.contact, bucketName: req.token.bucket, isVersion: false, version: 0, created: Date.now()
                };

                let f = await findFileByName(fileData.name, req.token._id, catId, collectionFile);
                let user = await findUserById(req.token._id, collectionUser);

                if (!f && fileData.size < fileSize && user.available > fileData.size) {
                    let key = await createFile(fileData, collectionFile);
                    const fl = file.url;
                    const type = fl.split('.').slice(-1);
                    const fileName = `${fileData.name}.${type}`;
                    fileData.url = generateFileName(fileName, user._id, catId, key, file.postedFor);

                    await updateUrl(key, fileData.url, collectionFile);

                    const url = await copyObject(file.url, fileData.url, req.token.bucket);

                    if (url) await updateUserStorage(req.token._id, user.data_uploaded, user.available, user.combined_plan, file.size, collectionUser);
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

        const collectionFile = await soda.createCollection('client_files');
        const collectionCats = await soda.createCollection('client_cats');

        const { offset, pId, type } = req.query;

        let fileList = await getAllFileLimitC(offset, pId, type, collectionFile, collectionCats);

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

        let count = await getAllFileQueryCountC(pId, string, type, collectionFile);

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

        const collectionFile = await soda.createCollection('client_files');
        const collectionCats = await soda.createCollection('client_cats');

        const { offset, string, pId, type } = req.query;
        let fileList = await getAllFileQueryLimitC(offset, pId, string, type, collectionFile, collectionCats);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function generateFileName(fileName, catId, _id, userId) {
    return `FileO/personal/user/${userId}/myclients/category/${catId}/files/${_id}/${uuidv4()}/${fileName}`;
}

async function updateUserStorage(_id, d_u, avb, cb_p, size, collectionUser) {
    var uploaded_data = Number(d_u) + Number(size);
    var available = Number(avb) - Number(size);
    if (uploaded_data < 0) uploaded_data = 0;
    if (available > cb_p) available = Number(cb_p);
    await updatePackageDetails(_id, uploaded_data, available, collectionUser);
}

module.exports = router;