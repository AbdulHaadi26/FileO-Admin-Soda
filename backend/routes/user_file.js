const express = require('express');
const router = express.Router();

const JWT = require('../middlewares/jwtAuth');
const uuidv4 = require('uuid/v4');

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
    updateValue,
    updateFilesCat,
    getAllNamesByArr,
    deleteFile,
    findFileById,
    findFileByNameVer,
    resetVersion,
    getAllFileVersionSkipped,
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
    getLatestVer
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
    updateCatUptS
} = require('../schemas/sharedCat');

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionOrg, collectionFile, collectionCat, collectionSets, collectionUser, collectionShared] = [
            await soda.createCollection('orgs'), await soda.createCollection('user_files'), await soda.createCollection('user_cats'),
            await soda.createCollection('sets'), await soda.createCollection('users'), await soda.createCollection('shrs_cat')
        ];

        const {
            name, size, type, postedby, org,
            category, description, mime, fName
        } = req.body;

        var dataSize = size / (1024 * 1024 * 1024);

        var fileData = {
            name: name, type: type, size: dataSize, postedby: postedby,
            date: new Date(), version: 0, org: org, mimeType: mime,
            bucketName: req.token.bucket, created: Date.now(), isVersion: false,
            date: new Date(), category: category, versionId: '',
            description: description, url: ''
        };

        var fileSize = 5;
        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = findFileByName(name, postedby, category, collectionFile);
        const p3 = getSetting(collectionSets);
        const p4 = findUserById(postedby, collectionUser);
        var [organ, file, set, user] = [await p1, await p2, await p3, await p4];
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (fileSize < dataSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 'Upload limit exceeded' });
        if (file) return res.json({ error: 'File with same name already exists within the organization' });

        var key = await createFile(fileData, collectionFile);

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key, postedby);

        await updateVersionId(key, fileData.url, collectionFile);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            [await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg), await updateUserStorage(postedby, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser)];
            await updateCatUptS(category, true, collectionShared);
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

        const [collectionOrg, collectionFile, collectionCat, collectionSets, collectionUser, collectionShared] = [
            await soda.createCollection('orgs'), await soda.createCollection('user_files'), await soda.createCollection('user_cats'),
            await soda.createCollection('sets'), await soda.createCollection('users'), await soda.createCollection('shrs_cat')
        ];

        const {
            name, size, type, postedby, org,
            category, description, mime, fName
        } = req.body;

        var dataSize = size / (1024 * 1024 * 1024);

        var fileData = {
            name: name, type: type, size: dataSize, postedby: postedby,
            date: new Date(), version: 0, org: org, mimeType: mime,
            bucketName: req.token.bucket, created: Date.now(), isVersion: false,
            date: new Date(), category: category, versionId: '',
            description: description, url: ''
        };

        var fileSize = 5;
        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = findFileByName(name, postedby, category, collectionFile);
        const p3 = getSetting(collectionSets);
        const p4 = findUserById(postedby, collectionUser);
        var [organ, file, set, user] = [await p1, await p2, await p3, await p4];
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (fileSize < dataSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 'Upload limit exceeded' });
        if (file) return res.json({ error: 'File with same name already exists within the organization' });
        if (!organ) throw new Error('Organization not found');

        var key = await createFile(fileData, collectionFile);

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key, postedby);

        fileData._id = key;
        await updateVersionId(key, fileData.url, collectionFile);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            [await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg), await updateUserStorage(postedby, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser)];
            await updateCatUptS(category, true, collectionShared);
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

        const [collectionOrg, collectionFile, collectionSharedF, collectionSets, collectionUser, collectionShared, collectionCat] = [
            await soda.createCollection('orgs'), await soda.createCollection('user_files'), await soda.createCollection('shrs'),
            await soda.createCollection('sets'), await soda.createCollection('users'), await soda.createCollection('shrs_cat'),
            await soda.createCollection('user_cats')
        ];

        const { _id, version, name, org, size, type, postedby, category, description, mime, fName } = req.body;


        var dataSize = size / (1024 * 1024 * 1024);
        var fileSize = 5;

        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = findFileByNameVer(name, postedby, category, version, collectionFile);
        const p3 = findUserById(postedby, collectionUser);
        const p4 = getSetting(collectionSets);
        const [organ, fileCheck, user, set] = [await p1, await p2, await p3, await p4];

        if (fileCheck) throw new Error('Version already exist');
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (fileSize < dataSize) return res.json({ error: 'File exceeds size limit' });

        var fileData = {
            name: name, type: type, mimeType: mime, description: description,
            size: dataSize, postedby: postedby, org: org, category: category,
            isVersion: true, version: Number(version), versionId: _id, url: '',
            date: new Date(), created: Date.now(), bucketName: req.token.bucket
        };

        if (organ.available < dataSize || user.storageAvailable < dataSize) throw new Error('Upload limit exceeded');

        var key = await createFile(fileData, collectionFile);

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key, postedby);

        await updateUrl(key, fileData.url, collectionFile);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            [await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg), await updateUserStorage(postedby, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser)];
            await updateCatUptS(category, true, collectionShared);
            await updateFileUptS(_id, true, collectionSharedF);
            await updateFileUptST(_id, collectionFile);
            await updateCatUptST(category, collectionCat);
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

        const [collectionOrg, collectionFile, collectionSets, collectionUser] = [
            await soda.createCollection('orgs'), await soda.createCollection('user_files'),
            await soda.createCollection('sets'), await soda.createCollection('users'), 
        ];

        const { _id, name, org, size, type, postedby, description, mime, fName, version, isVersion } = req.body;
        var dataSize = size / (1024 * 1024 * 1024);

        var fileSize = 5;
        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = getSetting(collectionSets);
        const p3 = getLatestVer(_id, collectionFile);
        const p4 = findUserById(postedby, collectionUser);
        var [organ, set, file, user] = [await p1, await p2, await p3, await p4];

        if (!file) throw new Error('File does not exist');
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 'Upload limit exceeded' });

        let category = file.category;
        
        var fileData = {
            name: name, type: type, mimeType: mime, description: description, size: dataSize,
            postedby: postedby, org: org, bucketName: req.token.bucket, created: Date.now(), date: new Date(),
             category: category, versionId: file.versionId, url: '', isVersion: isVersion, version: Number(version)
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

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key, postedby);

        if (Number(version) === 0) await updateVersionId(key, fileData.url, collectionFile)
        else await updateUrl(key, fileData.url, collectionFile);

        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
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
    return catId ? `FileO/organization/${org}/user/myspace/${userId}/category/${catId}/files/${_id}/${fileName}` :
        `FileO/organization/${org}/user/myspace/${userId}/category/files/${_id}/${fileName}`;
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

        const [collectionFile, collectionUser, collectionRec, collectionFvrFile, collectionCats, collectionFileV, collectionShared, collectionNotifs] = [
            await soda.createCollection('user_files'), await soda.createCollection('users'),
            await soda.createCollection('urecfs'), await soda.createCollection('favr_files'),
            await soda.createCollection('user_cats'), await soda.createCollection('file_views'),
            await soda.createCollection('shrs'), await soda.createCollection('notifs')
        ];

        const { _id, pId } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        await updateFileUpt(_id, false, collectionFile);
        await updateFileUptSU(req.token._id, _id, false, collectionShared);

        const p0 = findRecFileById(_id, 0, collectionRec);
        const p1 = getFile(_id, collectionFile, collectionCats);
        const p2 = getAllCats(pId, '', collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);
        const p4 = isFavorite(_id, req.token._id, collectionFvrFile);
        var [fl, file, catList, versions, isF] = [await p0, await p1, await p2, await p3, await p4];
        if (fl) await deleteRecentFile(fl._id, collectionRec);

        let recentData = {
            fileId: _id, userId: req.token._id, isPerm: false, isDel: false,
            orgId: req.token.org, versionId: file.versionId,
            name: file.name, type: file.type, created: Date.now(), date: new Date()
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

        const [collectionFile, collectionUser, collectionCats, collectionFileV, collectionShared, collectionNotifs] = [
            await soda.createCollection('user_files'), await soda.createCollection('users'),
            await soda.createCollection('user_cats'), await soda.createCollection('file_views'),
            await soda.createCollection('shrs'), await soda.createCollection('notifs')
        ];

        const { _id, pId } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        await updateFileUptSU(req.token._id, _id, false, collectionShared);
        const p1 = getFile(_id, collectionFile, collectionCats);
        const p2 = getAllCats(pId, '', collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);
        var [file, catList, versions] = [await p1, await p2, await p3];
        if (!file) throw new Error('Could not find file');
        var data = { orgId: req.token.org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 2 };

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
            await soda.createCollection('user_files'), await soda.createCollection('file_views')
        ];

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

        const [collectionFile, collectionUser, collectionRec, collectionCats, collectionNotifs] = [
            await soda.createCollection('user_files'), await soda.createCollection('users'),
            await soda.createCollection('urecfs'), await soda.createCollection('user_cats'),
            await soda.createCollection('notifs')
        ];

        const { _id, pId, pCat } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        let cat;

        if (pCat)
            cat = await getCatById(pCat, collectionCats);

        const p0 = findRecFileById(_id, 0, collectionRec);
        const p1 = getFile(_id, collectionFile, collectionCats);
        const p2 = getAllCats(pId, cat && cat.parentCat ? cat.parentCat : '', collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);
        var [fl, file, catList, versions] = [await p0, await p1, await p2, await p3];
        if (fl) await deleteRecentFile(fl._id, collectionRec);
        let data = {
            fileId: _id, userId: req.token._id, created: Date.now(),
            orgId: req.token.org, versionId: file.versionId,
            name: file.name, type: file.type, date: new Date()
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

        const [collectionFile, collectionUser, collectionCats, collectionShared, collectionNotifs] = [
            await soda.createCollection('user_files'), await soda.createCollection('users'), await soda.createCollection('user_cats'),
            await soda.createCollection('shrs'), await soda.createCollection('notifs')
        ];

        const { _id } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        await updateFileUptSU(req.token._id, _id, false, collectionShared);
        const p1 = getFile(_id, collectionFile, collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);
        const [file, versions] = [await p1, await p3];

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

        const [collectionFile, collectionUser] = [await soda.createCollection('user_files'), await soda.createCollection('users')];

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

        let [collectionFile, collectionCat] = [await soda.createCollection('user_files'), await soda.createCollection('user_cats')];

        const { pId, cat, type, string } = req.query;

        let catList, fileList;

        if (!string) {
            [catList, fileList] = [await getAllCatLimitCombinedU(pId, cat, collectionCat), await getAllFileLimitCombinedU(pId, cat, type, collectionFile)];
        } else {
            [catList, fileList] = [await getAllCatLimitCombinedUS(pId, cat, string, collectionCat), await getAllFileLimitCombinedUS(pId, cat, type, string, collectionFile)];
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

        const [collectionFile, collectionUser] = [await soda.createCollection('user_files'), await soda.createCollection('users')];

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

        const [collectionFile, collectionCats, collectionFvrFile, collectionShared] = [
            await soda.createCollection('user_files'), await soda.createCollection('user_cats'),
            await soda.createCollection('favr_files'), await soda.createCollection('shrs')
        ];

        const { name, description, _id, cat } = req.body;

        await updateFileUptS(_id, true, collectionShared);
        await updateFileUptST(_id, collectionFile);

        let fileDetails = await getFile(_id, collectionFile, collectionCats);

        if (!fileDetails) throw new Error('File with this key does not exist');

        let file;

        if (fileDetails.name !== name) file = await findFileByName(name, req.token.org, cat, collectionFile);

        if (file) throw new Error('File with this name already exists');

        let upt = await updateDetails(_id, name, description, cat, collectionFile);

        if (!upt) throw new Error('File Details not updated');

        fileDetails.name !== name && [await updateSharedFileName(_id, name, collectionShared), await updateFvrName(_id, name, collectionFvrFile)];

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

        const [collectionFile, collectionFvrFile] = [await soda.createCollection('user_files'), await soda.createCollection('favr_files')];

        const { value, arr } = req.body;

        let lIds = await getAllNamesByArr(arr, value, collectionFile);
        if (lIds && lIds.length > 0) [await updateFilesCat(lIds, value, collectionFile), await updateMultipleFilesArrFvr(lIds, collectionFvrFile)];

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

        const [collectionFile, collectionUser, collectionOrg, collectionFvrFile, collectionURecfs, collectionShared, collectionNotif] = [
            await soda.createCollection('user_files'), await soda.createCollection('users'), await soda.createCollection('orgs'),
            await soda.createCollection('favr_files'), await soda.createCollection('urecfs'), await soda.createCollection('shrs'),
            await soda.createCollection('notifs')
        ];

        const { _id } = req.params;
        var file = await findFileById(_id, collectionFile);
        var p1 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        var p2 = getAllFileDelVer(file.versionId, collectionFile);
        var p3 = findUserById(file.postedby, collectionUser);
        var [org, fileList, user] = [await p1, await p2, await p3];
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
        [await updateRectFileP(_id, collectionURecfs), await deleteFvrFiles(_id, collectionFvrFile), await deleteMultipleFilesArrShared([_id], collectionShared), await filesChanged([_id], collectionNotif)];
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

        const [collectionFile, collectionUser, collectionOrg, collectionFvrFile, collectionURecfs, collectionShared, collectionNotif] = [
            await soda.createCollection('user_files'), await soda.createCollection('users'), await soda.createCollection('orgs'),
            await soda.createCollection('favr_files'), await soda.createCollection('urecfs'), await soda.createCollection('shrs'), await soda.createCollection('notifs')
        ];

        const { _id, orgId, ver, versionId } = req.body;

        await resetVersion(versionId, ver, collectionFile);
        var p4 = findFileById(_id, collectionFile);
        var p5 = findOrganizationByIdUpt(orgId, collectionOrg);
        var p6 = findUserById(req.token._id, collectionUser);
        var [file, org, user] = [await p4, await p5, await p6];
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
            [await updateRectFileP(_id, collectionURecfs), await deleteFvrFiles(_id, collectionFvrFile), await deleteMultipleFilesArrShared([_id], collectionShared), await filesChanged([_id], collectionNotif)];
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

        const [collectionFile, collectionUser, collectionOrg, collectionURecfs, collectionFvrFile, collectionShared, collectionNotif] = [
            await soda.createCollection('user_files'), await soda.createCollection('users'), await soda.createCollection('orgs'),
            await soda.createCollection('urecfs'), await soda.createCollection('favr_files'), await soda.createCollection('shrs'),
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
        arr && arr.length > 0 && [await deleteMultipleFilesArr(arr, collectionFile), await deleteMultipleFilesArrRect(arr, collectionURecfs), await deleteMultipleFilesArrFvr(arr, collectionFvrFile), await deleteMultipleFilesArrShared(arr, collectionShared), await filesChanged(arr, collectionNotif)];

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

        const [collectionFile, collectionOrg, collectionSets, collectionUser] = [
            await soda.createCollection('user_files'), await soda.createCollection('orgs'), await soda.createCollection('sets'),
            await soda.createCollection('users')
        ];

        const { arr, catId } = req.body;

        var fileSize = 5;
        const p1 = getSetting(collectionSets);
        const p2 = findMultipleFilesArrId(arr, collectionFile);
        var [set, files] = [await p1, await p2];

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        if (files && files.length > 0) {
            await Promise.all(files.map(async file => {

                var fileData = {
                    name: `${file.name}-copy`, mimeType: file.mimeType,
                    type: file.type, size: file.size,
                    postedby: file.postedby, bucketName: req.token.bucket,
                    created: Date.now(), date: new Date(), version: 0,
                    org: req.token.org, category: catId, versionId: '',
                    description: file.description, url: '', isVersion: false
                };

                var p3 = findFileByName(fileData.name, req.token._id, fileData.category, collectionFile);
                var p4 = findOrganizationByIdUpt(req.token.org, collectionOrg);
                var p5 = findUserById(req.token._id, collectionUser);
                var [f, organ, user] = [await p3, await p4, await p5];


                if (!f && fileData.size < fileSize && (organ.available > fileData.size || fileData.size < user.storageAvailable)) {
                    const fl = file.url;
                    const type = fl.split('.').slice(-1);
                    const fileName = `${uuidv4()}${fileData.name.toLowerCase().split(' ').join('-')}.${type}`;

                    var key = await createFile(fileData, collectionFile);
                    fileData.url = generateFileName(fileName, fileData.org, catId, key, fileData.postedby);
                    await updateVersionId(key, fileData.url, collectionFile);

                    var url = await copyObject(file.url, fileData.url, req.token.bucket);
                    if (url) [await updateOrganizationStorage(req.token.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg),
                    await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, file.size, collectionUser)];
                    else await deleteFile(key, collectionFile);

                    const vers = await findMultipleFilesArrIdVer(file._id, collectionFile);

                    if (vers && vers.length > 0) await Promise.all(vers.map(async version => {

                        var verData = {
                            name: `${version.name}-copy`, type: version.type, mimeType: version.mimeType,
                            description: version.description, size: version.size,
                            postedby: version.postedby, org: version.org, category: catId,
                            created: Date.now(), date: new Date(),
                            isVersion: true, version: Number(version.version), versionId: key,
                            url: '', bucketName: req.token.bucket
                        };

                        var [organ, user] = [await findOrganizationByIdUpt(req.token.org, collectionOrg), await findUserById(req.token._id, collectionUser)];

                        if (verData.size < fileSize && (organ.available > verData.size || verData.size < user.storageAvailable)) {
                            const fl = file.url;
                            const type = fl.split('.').slice(-1);
                            const fileName = `${uuidv4()}${verData.name.toLowerCase().split(' ').join('-')}.${type}`;

                            var keyV = await createFile(verData, collectionFile);
                            verData.url = generateFileName(fileName, verData.org, catId, keyV, verData.postedby);
                            await updateUrl(keyV, verData.url, collectionFile);

                            var url = await copyObject(version.url, verData.url, req.token.bucket);
                            if (url) [await updateOrganizationStorage(version.org, organ.data_uploaded, organ.available, organ.combined_plan, version.size, collectionOrg),
                            await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, version.size, collectionUser)];
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

        const [collectionFile, collectionUser, collectionCats] = [
            await soda.createCollection('user_files'), await soda.createCollection('users'),
            await soda.createCollection('user_cats')
        ];

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

        const [collectionFile, collectionUser, collectionCats] = [
            await soda.createCollection('user_files'), await soda.createCollection('users'),
            await soda.createCollection('user_cats')
        ];

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

module.exports = router;