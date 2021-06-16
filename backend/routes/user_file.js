const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');

const JWT = require('../middlewares/jwtAuth');

const {
    putPresignedUrl,
    deleteObject,
    copyObject
} = require('../middlewares/oci-sdk');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getSetting
} = require('../schemas/setting');

const {
    findUserById,
    updateStorage
} = require('../schemas/user');

const {
    findOrganizationByIdUpt,
    updatePackageDetails
} = require('../schemas/organization');

const {
    createRecentFile,
    findRecFileById,
    deleteRecentFile,
    updateRectFileP,
    deleteMultipleFilesArrRect
} = require('../schemas/recentUserFile');

const {
    getAllCats,
    getAllCatLimitCombinedU,
    getAllCatLimitCombinedUS,
    updateCatUptST,
    getCatById
} = require('../schemas/userCategory');

const {
    findFileByName,
    findMultipleFilesArrIdVer,
    createFile,
    updateUrl,
    updateVersionId,
    getAllFileCount,
    getAllFileLimit,
    getAllFileQueryCount,
    getAllFileQueryLimit,
    getFile,
    getAllFileVersion,
    downloadFile,
    updateFilesCat,
    getAllNamesByArr,
    deleteFile,
    findFileById,
    findFileByNameVer,
    resetVersion,
    getAllFileDelVer,
    findMultipleFilesArr,
    deleteMultipleFilesArr,
    findMultipleFilesArrId,
    getAllFileCountN,
    getAllFileLimitN,
    getAllFileQueryCountN,
    getAllFileQueryLimitN,
    getAllFileLimitU,
    getAllFileCountU,
    getAllFileQueryCountU,
    getAllFileQueryLimitU,
    getAllFileLimitCombinedU,
    getAllFileLimitCombinedUS,
    updateFileUpt,
    updateFileUptST,
    updateDetails,
    getLatestVer,
    findFileByNameC,
    getAllFileVersionC,
    updateLatestVer,
    updateCat,
    getVerCount
} = require('../schemas/userFile');

const {
    isFavorite,
    updateFvrName,
    updateMultipleFilesArrFvr,
    deleteFvrFiles,
    deleteMultipleFilesArrFvr
} = require('../schemas/favrFiles');

const {
    updateSharedFileName, deleteMultipleFilesArrShared, updateFileUptS, updateFileUptSU
} = require('../schemas/sharedFile');

const {
    createFileView
} = require('../schemas/fileView');

const {
    filesChanged, updatedChanged
} = require('../schemas/notification');

const {
    updateCatUptS, updateCatUptSParent
} = require('../schemas/sharedCat');

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionCat = await soda.createCollection('user_cats');
        const collectionSets = await soda.createCollection('sets');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs_cat');

        const { name, size, type, postedby, org, category, description, mime, fName, uploadType } = req.body;

        var dataSize = size / (1024 * 1024 * 1024);

        let fileData = {
            name: name, type: type, size: dataSize, postedby: postedby,
            date: new Date(), version: 0, org: org, mimeType: mime,
            bucketName: req.token.bucket, created: Date.now(), isVersion: false,
            date: new Date(), category: category, versionId: '',
            description: description, url: '', last_updated: new Date(Date.now())
        };

        var fileSize = 5;
        var organ = await findOrganizationByIdUpt(org, collectionOrg);
        let file;

        if (uploadType !== 1) {
            file = await findFileByName(name, req.token._id, category, collectionFile);
        } else {
            file = await findFileByNameC(name, req.token._id, category, collectionFile, collectionCat);
        }

        let set = await getSetting(collectionSets);
        let user = await findUserById(postedby, collectionUser);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (fileSize < dataSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 'Upload limit exceeded' });
        if (file) {
            if (uploadType !== 1)
                return res.json({ error: 'File with same name already exists within the organization' });
            else
                return res.json({ error: 'User File', file, type: uploadType });
        }

        let key = await createFile(fileData, collectionFile);

        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key, postedby);
        fileData._id = key;

        await updateVersionId(key, fileData.url, collectionFile);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
            await updateUserStorage(postedby, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser);
            await updateCatUptS(category, true, collectionShared);
            await updateCatUptSParent(category, collectionCat, collectionShared);
            await updateCatUptST(category, collectionCat);
            res.status(200).json({ file: fileData, url: url });
        } else {
            await deleteFile(key, collectionFile);
            throw new Error('File upload could not be completed.')
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/registerM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionCat = await soda.createCollection('user_cats');
        const collectionSets = await soda.createCollection('sets');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs_cat');


        const { name, size, type, postedby, org, uploadType, category, description, mime, fName } = req.body;

        let dataSize = size / (1024 * 1024 * 1024);

        let fileData = {
            name: name, type: type, size: dataSize, postedby: postedby,
            date: new Date(), version: 0, org: org, mimeType: mime,
            bucketName: req.token.bucket, created: Date.now(), isVersion: false,
            date: new Date(), category: category, versionId: '',
            description: description, url: '', last_updated: new Date(Date.now())
        };

        let fileSize = 5;
        var organ = await findOrganizationByIdUpt(org, collectionOrg);

        let file;
        if (uploadType !== 1) {
            file = await findFileByName(name, postedby, category, collectionFile);
        } else {
            file = await findFileByNameC(name, postedby, category, collectionFile, collectionCat);
        }

        let set = await getSetting(collectionSets);
        let user = await findUserById(postedby, collectionUser);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (fileSize < dataSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 'Upload limit exceeded' });
        if (file) {
            if (uploadType !== 1)
                return res.json({ error: 'File with same name already exists within the organization' });
            else
                return res.json({ error: 'User File', file, type: uploadType });
        }
        if (!organ) throw new Error('Organization not found');

        var key = await createFile(fileData, collectionFile);

        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key, postedby);

        fileData._id = key;
        fileData.versionId = key;
        await updateVersionId(key, fileData.url, collectionFile);

        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
            await updateUserStorage(postedby, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser);
            await updateCatUptS(category, true, collectionShared);
            await updateCatUptSParent(category, collectionCat, collectionShared);
            await updateCatUptST(category, collectionCat);
            res.status(200).json({ file: fileData, url: url });
        } else {
            await deleteFile(key, collectionFile);
            throw new Error('File upload could not be completed.')
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/registerVer', JWT, async (req, res, next) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionCat = await soda.createCollection('user_cats');
        const collectionSets = await soda.createCollection('sets');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs_cat');
        const collectionSharedF = await soda.createCollection('shrs');

        const { _id, name, org, size, type, postedby, category, description, mime, fName } = req.body;

        var dataSize = size / (1024 * 1024 * 1024);
        var fileSize = 5;

        let version = await getVerCount(_id, collectionFile);

        var organ = await findOrganizationByIdUpt(org, collectionOrg);
        let fileCheck = await findFileByNameVer(name, postedby, category, version, collectionFile);
        let user = await findUserById(postedby, collectionUser);
        let set = await getSetting(collectionSets);

        if (fileCheck) throw new Error('Version already exist');
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (fileSize < dataSize) return res.json({ error: 'File exceeds size limit' });

        var fileData = {
            name: name, type: type, mimeType: mime, description: description,
            size: dataSize, postedby: postedby, org: org, category: category,
            isVersion: true, version: Number(version), versionId: _id, url: '',
            date: new Date(), created: Date.now(), bucketName: req.token.bucket,
            last_updated: new Date(Date.now())
        };

        if (organ.available < dataSize || user.storageAvailable < dataSize) throw new Error('Upload limit exceeded');

        var key = await createFile(fileData, collectionFile);

        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key, postedby);

        await updateUrl(key, fileData.url, collectionFile);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
            await updateUserStorage(postedby, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser);
            await updateCatUptS(category, true, collectionShared);
            await updateFileUptS(_id, true, collectionSharedF);
            await updateFileUptST(_id, collectionFile);
            await updateCatUptST(category, collectionCat);
            await updateCatUptSParent(category, collectionCat, collectionShared);
            res.status(200).json({ file: fileData, url: url });
        } else {
            await deleteFile(key, collectionFile);
            throw new Error('File upload could not be completed.');
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/registerNew', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionFile = await soda.createCollection('user_files');
        const collectionCat = await soda.createCollection('user_cats');
        const collectionSets = await soda.createCollection('sets');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs_cat');
        const collectionSharedF = await soda.createCollection('shrs');

        const { _id, name, org, size, type, postedby, description, mime, fName } = req.body;
        var dataSize = size / (1024 * 1024 * 1024);

        let fileSize = 5;

        var organ = await findOrganizationByIdUpt(org, collectionOrg);
        let set = await getSetting(collectionSets);
        let file = await getLatestVer(_id, collectionFile);
        let user = await findUserById(postedby, collectionUser);

        if (!file) throw new Error('File does not exist');
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 'Upload limit exceeded' });

        let version = await getVerCount(file.versionId, collectionFile);

        let category = file.category;

        var fileData = {
            name: name, type: type, mimeType: mime, description: description, size: dataSize,
            postedby: postedby, org: org, bucketName: req.token.bucket, created: Date.now(), date: new Date(),
            category: category, versionId: file.versionId, url: '', isVersion: version <= 1 ? false : true, version: version ? Number(version) - 1 : 0,
            last_updated: new Date(Date.now())
        };

        var uploaded_data = Number(organ.data_uploaded)
        var available = Number(organ.available);
        var combined_plan = Number(organ.combined_plan);
        var percent_left, percent_used;
        uploaded_data = uploaded_data - Number(file.size);
        available = available + Number(file.size);
        if (uploaded_data < 0) uploaded_data = 0;
        if (available > combined_plan) available = Number(combined_plan);
        percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
        if (percent_used > 100) percent_used = 100;
        percent_left = 100 - Number(percent_used);
        if (percent_left < 0) percent_left = 0;

        await deleteObject(file.url, req.token.bucket);
        await deleteFile(file._id, collectionFile);

        await updateUserStorage(postedby, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser);
        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);

        const key = await createFile(fileData, collectionFile);

        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key, postedby);

        if (Number(version) <= 1) await updateVersionId(key, fileData.url, collectionFile)
        else await updateUrl(key, fileData.url, collectionFile);

        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            if (category) {
                await updateCatUptS(category, true, collectionShared);
                await updateCatUptSParent(category, collectionCat, collectionShared);
                await updateCatUptST(category, collectionCat);
            }
            await updateFileUptS(_id, true, collectionSharedF);
            await updateFileUptST(_id, collectionFile);
            res.status(200).json({ file: fileData, url: url });
        } else {
            await deleteFile(key, collectionFile);
            res.json({ error: 'Could not upload file' });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function generateFileName(fileName, org, catId, _id, userId) {
    return catId ? `FileO/organization/${org}/user/myspace/${userId}/category/${catId}/files/${_id}/${uuidv4()}/${fileName}` : `FileO/organization/${org}/user/myspace/${userId}/category/files/${_id}/${uuidv4()}/${fileName}`;
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
    if (userUploaded > sL) userUploaded = Number(sL);
    if (userAvailable < 0) userAvailable = Number(0);
    await updateStorage(userId, userUploaded, userAvailable, collectionUser);
}

router.get('/getFile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionRec = await soda.createCollection('urecfs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs');
        const collectionFileV = await soda.createCollection('file_views');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id, pId } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        await updateFileUpt(_id, false, collectionFile);
        await updateFileUptSU(req.token._id, _id, false, collectionShared);

        var fl = await findRecFileById(_id, 0, collectionRec);
        let file = await getFile(_id, collectionFile, collectionCats);
        let catList = await getAllCats(pId, '', collectionCats);
        let versions = await getAllFileVersion(_id, collectionFile, collectionUser);
        let isF = await isFavorite(_id, req.token._id, collectionFvrFile);

        if (fl) await deleteRecentFile(fl._id, collectionRec);

        let recentData = {
            fileId: _id, userId: req.token._id, isPerm: false, isDel: false,
            orgId: req.token.org, versionId: file.versionId,
            name: file.name, type: file.type, created: Date.now(), date: new Date(),
            last_updated: new Date(Date.now())
        };

        await createRecentFile(recentData, collectionRec);
        if (!file) throw new Error('Could not find file');

        let data = { orgId: req.token.org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 2 };
        await createFileView(data, collectionFileV);

        res.json({ file: file, catList: catList, versions: versions, isF: isF });
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs');
        const collectionFileV = await soda.createCollection('file_views');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id, pId } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        await updateFileUptSU(req.token._id, _id, false, collectionShared);
        let file = await getFile(_id, collectionFile, collectionCats);
        let catList = await getAllCats(pId, '', collectionCats);
        let versions = await getAllFileVersion(_id, collectionFile, collectionUser);

        if (!file) throw new Error('Could not find file');
        let data = {
            orgId: req.token.org,
            userId: req.token._id,
            fileId: _id, fileSize: file.size,
            type: 2
        };

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

        const collectionFile = await soda.createCollection('user_files');
        const collectionFileV = await soda.createCollection('file_views');

        const { _id } = req.params;
        let file = await downloadFile(_id, collectionFile);
        if (!file) throw new Error('Could not find file');
        let data = { orgId: req.token.org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 2 };
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionRec = await soda.createCollection('urecfs');
        const collectionUser = await soda.createCollection('users');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id, pId, pCat } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        let cat;

        if (pCat)
            cat = await getCatById(pCat, collectionCats);

        var fl = await findRecFileById(_id, 0, collectionRec);
        let file = await getFile(_id, collectionFile, collectionCats);
        let catList = await getAllCats(pId, cat && cat.parentCat ? cat.parentCat : '', collectionCats);
        let versions = await getAllFileVersion(_id, collectionFile, collectionUser);

        if (fl) await deleteRecentFile(fl._id, collectionRec);

        let data = {
            fileId: _id, userId: req.token._id, created: Date.now(),
            orgId: req.token.org, versionId: file.versionId,
            name: file.name, type: file.type, date: new Date(),
        };

        await createRecentFile(data, collectionRec);

        if (!file) throw new Error('Could not find file');

        res.json({ file: file, catList: catList, versions: versions });
    } catch (e) {
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        await updateFileUptSU(req.token._id, _id, false, collectionShared);
        let file = await getFile(_id, collectionFile, collectionCats);
        let versions = await getAllFileVersion(_id, collectionFile, collectionUser);

        if (!file) throw new Error('Could not find file');

        res.json({ file: file, versions: versions });
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

        const collectionFile = await soda.createCollection('user_files');

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

router.get('/getFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionUser = await soda.createCollection('users');

        const { offset, pId, cat, type } = req.query;
        let fileList = await getAllFileLimit(offset, pId, cat, type, collectionFile, collectionUser);

        return res.json({ files: fileList });
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionCat = await soda.createCollection('user_cats');

        const { cat, type, string } = req.query;

        let catList, fileList;

        if (!string) {
            catList = await getAllCatLimitCombinedU(req.token._id, cat, collectionCat);
            fileList = await getAllFileLimitCombinedU(req.token._id, cat, type, collectionFile);
        } else {
            catList = await getAllCatLimitCombinedUS(req.token._id, cat, string, collectionCat);
            fileList = await getAllFileLimitCombinedUS(req.token._id, cat, type, string, collectionFile);
        }

        return res.json({ files: fileList, cats: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCombinedShared', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionCat = await soda.createCollection('user_cats');

        const { pId, cat, type, string } = req.query;

        let catList, fileList;

        if (!string) {
            catList = await getAllCatLimitCombinedU(pId, cat, collectionCat);
            fileList = await getAllFileLimitCombinedU(pId, cat, type, collectionFile);
        } else {
            catList = await getAllCatLimitCombinedUS(pId, cat, string, collectionCat);
            fileList = await getAllFileLimitCombinedUS(pId, cat, type, string, collectionFile);
        }

        return res.json({ files: fileList, cats: catList });
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

        const collectionFile = await soda.createCollection('user_files');

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

        const collectionFile = await soda.createCollection('user_files');
        const collectionUser = await soda.createCollection('users');

        const { offset, string, pId, cat, type } = req.query;
        let fileList = await getAllFileQueryLimit(offset, pId, string, cat, type, collectionFile, collectionUser);

        return res.json({ files: fileList });
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionShared = await soda.createCollection('shrs');

        const { name, description, _id, cat } = req.body;

        await updateFileUptS(_id, true, collectionShared);
        await updateFileUptST(_id, collectionFile);

        let fileDetails = await getFile(_id, collectionFile, collectionCats);

        if (!fileDetails) throw new Error('File with this key does not exist');

        let file;

        if (fileDetails.name !== name) file = await findFileByName(name, req.token._id, cat, collectionFile);

        if (file) throw new Error('File with this name already exists');

        let upt = await updateDetails(_id, name, description, cat, collectionFile);

        if (!upt) throw new Error('File Details not updated');

        if (fileDetails.name !== name) {
            await updateSharedFileName(_id, name, collectionShared);
            await updateFvrName(_id, name, collectionFvrFile);
        }

        res.json({ file: upt });
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionShared = await soda.createCollection('shrs');

        await updateFileUptS(_id, true, collectionShared);
        await updateFileUptST(_id, collectionFile);

        let fileDetails = await getFile(_id, collectionFile, collectionCats);

        if (!fileDetails) throw new Error('File with this key does not exist');

        let file = await findFileByNameC(fileDetails.name, req.token._id, cat, collectionFile, collectionCats);

        if (file) return res.json({ error: 'User File', mainFile: fileDetails, file: file, type: 0 })

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

        const collectionFile = await soda.createCollection('user_files');
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

router.post('/deleteFile/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionURecfs = await soda.createCollection('urecfs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs');
        const collectionNotif = await soda.createCollection('notifs');

        const { _id } = req.params;
        var file = await findFileById(_id, collectionFile);
        var org = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        let fileList = await getAllFileDelVer(file.versionId, collectionFile);
        let user = await findUserById(file.postedby, collectionUser);

        var uploaded_data = Number(org.data_uploaded)
        var available = Number(org.available);
        var combined_plan = Number(org.combined_plan);
        var percent_left, percent_used;
        var userUploaded = Number(user.storageUploaded);
        var userAvailable = Number(user.storageAvailable);
        var limit = Number(user.storageLimit);

        if (fileList && org)
            await Promise.all(fileList.map(async (file) => {
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
            }));


        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);
        await updateRectFileP(_id, collectionURecfs);
        await deleteFvrFiles(_id, collectionFvrFile);
        await deleteMultipleFilesArrShared([_id], collectionShared);
        await filesChanged([_id], collectionNotif);

        let userData = await findUserById(req.token._id, collectionUser);

        res.json({ user: userData });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteVer', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionURecfs = await soda.createCollection('urecfs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs');
        const collectionNotif = await soda.createCollection('notifs');

        const { _id, ver, versionId } = req.body;

        let newKey = await resetVersion(versionId, ver, collectionFile);
        var file = await findFileById(_id, collectionFile);
        let org = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        let user = await findUserById(req.token._id, collectionUser);

        if (file && org) {
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
            await deleteFile(_id, collectionFile);

            await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
            await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);
            await updateRectFileP(_id, collectionURecfs);
            await deleteFvrFiles(_id, collectionFvrFile);
            await deleteMultipleFilesArrShared([_id], collectionShared);
            await filesChanged([_id], collectionNotif);
        };

        let fileR;

        if (newKey) {
            fileR = await getLatestVer(newKey, collectionFile);
        }

        if (fileR) {
            return res.json({ file: fileR });
        }

        return res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFileCountN', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');

        const { type, pId, cId } = req.query;
        let count = await getAllFileCountN(pId, type, cId, collectionFile);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFilesN', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');

        const { offset, pId, type, cId } = req.query;
        let fileList = await getAllFileLimitN(offset, pId, type, cId, collectionFile);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFileCountN', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');

        const { string, pId, type, cId } = req.query;
        let count = await getAllFileQueryCountN(pId, string, type, cId, collectionFile);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFilesN', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');

        const { offset, string, pId, type, cId } = req.query;
        let fileList = await getAllFileQueryLimitN(offset, pId, string, type, cId, collectionFile);

        return res.json({ files: fileList });
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionURecfs = await soda.createCollection('urecfs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shrs');
        const collectionNotif = await soda.createCollection('notifs');


        const { arr } = req.body;
        let user = await findUserById(req.token._id, collectionUser);
        let files = await findMultipleFilesArr(arr, collectionFile);
        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

        if (!user) return res.json({ error: 'User not found' });
        if (!organ) return res.json({ error: 'Organization not found' });

        var uploaded_data = Number(organ.data_uploaded)
        var available = Number(organ.available);
        var combined_plan = Number(organ.combined_plan);
        var percent_left, percent_used;
        var userUploaded = Number(user.storageUploaded);
        var userAvailable = Number(user.storageAvailable);
        var limit = Number(user.storageLimit);

        if (files.length > 0) await Promise.all(files.map(async (file) => {
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
            await deleteFile(file._id, collectionFile);
            await deleteObject(file.url, req.token.bucket);
        }));

        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);

        if (arr && arr.length > 0) {
            await deleteMultipleFilesArr(arr, collectionFile);
            await deleteMultipleFilesArrRect(arr, collectionURecfs);
            await deleteMultipleFilesArrFvr(arr, collectionFvrFile);
            await deleteMultipleFilesArrShared(arr, collectionShared);
            await filesChanged(arr, collectionNotif);
        }
        res.json({ success: 'File Deleted' });
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

        const collectionFile = await soda.createCollection('user_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSets = await soda.createCollection('sets');
        const collectionUser = await soda.createCollection('users');

        const { arr, catId } = req.body;

        var fileSize = 5;
        let set = await getSetting(collectionSets);
        let files = await findMultipleFilesArrId(arr, collectionFile);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        if (files && files.length > 0) {
            await Promise.all(files.map(async file => {

                var fileData = {
                    name: `${file.name}-copy`, mimeType: file.mimeType,
                    type: file.type, size: file.size,
                    postedby: file.postedby, bucketName: req.token.bucket,
                    created: Date.now(), date: new Date(), version: 0,
                    org: req.token.org, category: catId, versionId: '',
                    description: file.description, url: '', isVersion: false,
                    last_updated: new Date(Date.now())
                };

                var f = await findFileByName(fileData.name, req.token._id, fileData.category, collectionFile);
                var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
                var user = await findUserById(req.token._id, collectionUser);

                if (!f && fileData.size < fileSize && (organ.available > fileData.size || fileData.size < user.storageAvailable)) {
                    const fl = file.url;
                    const type = fl.split('.').slice(-1);
                    const fileName = `${fileData.name}.${type}`;

                    var key = await createFile(fileData, collectionFile);
                    fileData.url = generateFileName(fileName, fileData.org, catId, key, fileData.postedby);
                    await updateVersionId(key, fileData.url, collectionFile);

                    var url = await copyObject(file.url, fileData.url, req.token.bucket);
                    if (url) {
                        await updateOrganizationStorage(req.token.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
                        await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, file.size, collectionUser);
                    }
                    else await deleteFile(key, collectionFile);

                    const vers = await findMultipleFilesArrIdVer(file._id, collectionFile);

                    if (vers && vers.length > 0) await Promise.all(vers.map(async version => {

                        var verData = {
                            name: `${version.name}-copy`, type: version.type, mimeType: version.mimeType,
                            description: version.description, size: version.size,
                            postedby: version.postedby, org: version.org, category: catId,
                            created: Date.now(), date: new Date(),
                            isVersion: true, version: Number(version.version), versionId: key,
                            url: '', bucketName: req.token.bucket, last_updated: new Date(Date.now())
                        };

                        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
                        var user = await findUserById(req.token._id, collectionUser);


                        if (verData.size < fileSize && (organ.available > verData.size || verData.size < user.storageAvailable)) {
                            const fl = file.url;
                            const type = fl.split('.').slice(-1);
                            const fileName = `${verData.name}.${type}`;

                            var keyV = await createFile(verData, collectionFile);
                            verData.url = generateFileName(fileName, verData.org, catId, keyV, verData.postedby);
                            await updateUrl(keyV, verData.url, collectionFile);

                            var url = await copyObject(version.url, verData.url, req.token.bucket);
                            if (url) {
                                await updateOrganizationStorage(version.org, organ.data_uploaded, organ.available, organ.combined_plan, version.size, collectionOrg);
                                await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, version.size, collectionUser);
                            }
                            else await deleteFile(keyV, collectionFile);
                        }
                    }))
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

router.get('/getFileCountU', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');

        const { type, pId } = req.query;
        let count = await getAllFileCountU(pId, type, collectionFile);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFilesU', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');

        const { offset, pId, type } = req.query;
        let fileList = await getAllFileLimitU(offset, pId, type, collectionFile, collectionUser, collectionCats);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFileCountU', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');

        const { string, pId, type } = req.query;

        let count = await getAllFileQueryCountU(pId, string, type, collectionFile);

        return res.json({ fileCount: count });
    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFilesU', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');

        const { offset, string, pId, type } = req.query;
        let fileList = await getAllFileQueryLimitU(offset, pId, string, type, collectionFile, collectionUser, collectionCats);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/uploadType', JWT, async (req, res, next) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionCat = await soda.createCollection('user_cats');
        const collectionURecfs = await soda.createCollection('urecfs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionUser = await soda.createCollection('users');
        const collectionShared = await soda.createCollection('shr');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionNotif = await soda.createCollection('notifs');

        let _id = req.body.mainFile;
        let tId = req.body.file;

        let newFile = await getFile(tId, collectionFile, collectionCat);
        if (!newFile) throw new Error('Could not find the latest version');

        let fileToReplace = await getLatestVer(_id, collectionFile);
        if (!fileToReplace) throw new Error('Could not find the latest version');

        let vId = fileToReplace.versionId;
        let postedby = fileToReplace.postedby;

        let fileM = await getAllFileVersionC(newFile.versionId, collectionFile);

        let delFile;

        if (req.body.type === 0 && fileM && fileM.length >= 0) {
            await updateLatestVer(fileToReplace._id, fileM.length, fileM[0].versionId, fileM[0].category, collectionFile);
        } else if (req.body.type === 1 && fileM && fileM.length >= 0) {
            delFile = await getLatestVer(newFile.versionId, collectionFile);
            await updateLatestVer(fileToReplace._id, fileM.length > 0 ? fileM.length - 1 : 0, fileM[0].versionId, fileM[0].category, collectionFile);
        }

        if (!vId) throw new Error('Could not find file');

        var org = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        var fileList = await getAllFileDelVer(vId, collectionFile);
        var user = await findUserById(postedby, collectionUser);

        var uploaded_data = Number(org.data_uploaded)
        var available = Number(org.available);
        var combined_plan = Number(org.combined_plan);
        var percent_left, percent_used;
        var userUploaded = Number(user.storageUploaded);
        var userAvailable = Number(user.storageAvailable);
        var limit = Number(user.storageLimit);


        if (fileList && fileList.length > 0 && delFile) {
            fileList.push(delFile);
        } else if (delFile) {
            fileList = [];
            fileList.push(delFile);
        }

        if (fileList && org)
            await Promise.all(fileList.map(async (file) => {
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
            }));


        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);
        await updateRectFileP(_id, collectionURecfs);
        await deleteFvrFiles(_id, collectionFvrFile);
        await deleteMultipleFilesArrShared([_id], collectionShared);
        await filesChanged([_id], collectionNotif);

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/copyFile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSets = await soda.createCollection('sets');
        const collectionUser = await soda.createCollection('users');

        const { _id, catId } = req.body;

        var fileSize = 5;
        const set = await getSetting(collectionSets);

        let file = await findFileById(_id, collectionFile);

        if (!file) throw new Error('File not found');

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);


        var fileData = {
            name: `${file.name}`, mimeType: file.mimeType,
            type: file.type, size: file.size,
            postedby: file.postedby, bucketName: req.token.bucket,
            created: Date.now(), date: new Date(), version: 0,
            org: req.token.org, category: catId, versionId: '',
            description: file.description, url: '', isVersion: false,
            last_updated: new Date(Date.now())
        };

        var f = await findFileByName(fileData.name, req.token._id, fileData.category, collectionFile);
        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        var user = await findUserById(req.token._id, collectionUser);


        if (!f && fileData.size < fileSize && (organ.available > fileData.size || fileData.size < user.storageAvailable)) {
            const fl = file.url;
            const type = fl.split('.').slice(-1);
            const fileName = `${fileData.name}.${type}`;

            var key = await createFile(fileData, collectionFile);
            fileData.url = generateFileName(fileName, fileData.org, catId, key, fileData.postedby);
            await updateVersionId(key, fileData.url, collectionFile);

            var url = await copyObject(file.url, fileData.url, req.token.bucket);
            if (url) {
                await updateOrganizationStorage(req.token.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
                await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, file.size, collectionUser);
            }
            else await deleteFile(key, collectionFile);

            const vers = await findMultipleFilesArrIdVer(file._id, collectionFile);

            if (vers && vers.length > 0) await Promise.all(vers.map(async version => {

                var verData = {
                    name: `${version.name}`, type: version.type, mimeType: version.mimeType,
                    description: version.description, size: version.size,
                    postedby: version.postedby, org: version.org, category: catId,
                    created: Date.now(), date: new Date(),
                    isVersion: true, version: Number(version.version), versionId: key,
                    url: '', bucketName: req.token.bucket, last_updated: new Date(Date.now())
                };

                var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
                var user = await findUserById(req.token._id, collectionUser);

                if (verData.size < fileSize && (organ.available > verData.size || verData.size < user.storageAvailable)) {
                    const fl = file.url;
                    const type = fl.split('.').slice(-1);
                    const fileName = `${verData.name}.${type}`;

                    var keyV = await createFile(verData, collectionFile);
                    verData.url = generateFileName(fileName, verData.org, catId, keyV, verData.postedby);
                    await updateUrl(keyV, verData.url, collectionFile);

                    var url = await copyObject(version.url, verData.url, req.token.bucket);
                    if (url) {
                        await updateOrganizationStorage(version.org, organ.data_uploaded, organ.available, organ.combined_plan, version.size, collectionOrg);
                        await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, version.size, collectionUser);
                    }
                    else await deleteFile(keyV, collectionFile);
                }
            }))
        } else {
            throw new Error('File could not be copied.');
        }

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;