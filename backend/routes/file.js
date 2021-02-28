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
    getCRole
} = require('../schemas/role');

const {
    getSetting
} = require('../schemas/setting');

const {
    getAllProjectsOfUser
} = require('../schemas/projects');

const {
    getAssignedUserCats
} = require('../schemas/projectAssigned');

const {
    getProjectManagerUserCats
} = require('../schemas/projectCategory');

const {
    getAllFileLimitPD,
} = require('../schemas/projectFile');

const {
    getAllFileLimitUD,
} = require('../schemas/userFile');

const {
    findMultipleFilesArrId, updateVersionId, findFileByName, getFile,
    getAllFileVersion, updateUrl, findFileById, getAllFileDelVer, getAllNamesByArr,
    getMultipleFileArr, getAllFileCount, getAllFileLimit, getAllFileQueryCount, getAllFileLimitMD,
    getAllFileQueryLimit, downloadFile, findFileByNameVer, updateFilePerm, updateFilesCat,
    deleteMultipleFileArr, getAllFileCountM, getAllFileQueryCountM, getAllFileQueryLimitM, getLatestVer,
    getAllFileLimitM, createFile, deleteFile, updateDetails, resetVersion, findMultipleFilesArrIdVer
} = require('../schemas/file');

const {
    isFavorite,
    updateFvrFileD,
    updateFvrName,
    updateFvrFileP,
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
    deleteRecentFile,
    findRecFileById,
    createRecentFile,
    updateRectFileD,
    updateRectFileP,
    updateMultipleFilesArrRect,
    deleteMultipleFilesArrRect
} = require('../schemas/recentFiles');

const {
    getAllCats,
    getAllCatLimitC,
    getAllCatLimitQueryC,
    getCat
} = require('../schemas/category');

const {
    getAllUserByRoles, findUserById
} = require('../schemas/user');

const {
    createNotification,
    fileChanged,
    filesChanged,
    updatedChanged
} = require('../schemas/notification');

router.post('/copyFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionFiles, collectionSets, collectionRoles, collectionNotifs] = [
            await soda.createCollection('users'), await soda.createCollection('orgs'),
            await soda.createCollection('files'), await soda.createCollection('sets'),
            await soda.createCollection('roles'), await soda.createCollection('notifs')
        ];

        const { arr, catId } = req.body;

        var fileSize = 5;
        const p1 = getSetting(collectionSets);
        const p2 = findMultipleFilesArrId(arr, collectionFiles);
        var [set, files] = [await p1, await p2];

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        if (files && files.length > 0) {
            await Promise.all(files.map(async file => {
                var fileData = {
                    name: `${file.name}-copy`, type: file.type, size: file.size, postedby: file.postedby,
                    org: file.org, mimeType: file.mimeType, bucketName: req.token.bucket, date: new Date(),
                    active: file.active, versioning: file.versioning, category: catId, versionId: '', version: 0,
                    compare: file.compare, description: file.description, url: '', created: Date.now(),
                    isVersion: false,
                };

                var p3 = findFileByName(fileData.name, req.token.org, fileData.category, collectionFiles);
                var p4 = findOrganizationByIdUpt(req.token.org, collectionOrg);
                var [f, organ] = [await p3, await p4];
                if (!f && fileData.size < fileSize && organ.available > fileData.size) {
                    var key = await createFile(fileData, collectionFiles);
                    var fl = file.url;
                    var type = fl.split('.').slice(-1);
                    var fileName = `${uuidv4()}${fileData.name.toLowerCase().split(' ').join('-')}.${type}`;
                    fileData.url = generateFileName(fileName, file.org, catId, key);
                    await updateVersionId(key, fileData.url, collectionFiles)
                    var date = parseDate();
                    var title = "Administrator has copied file", message = `A new file ${fileData.name} has been copied to File-O by the administrator on ${date} in company files.`;
                    await generateNotification(file.org, catId, file.postedby, title, message, 0, 1, key, date, file.type, collectionRoles, collectionUser, collectionNotifs);
                    var url = await copyObject(file.url, fileData.url, req.token.bucket);
                    if (url) await updateOrganizationStorage(file.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
                    else await deleteFile(key, collectionFiles);

                    const vers = await findMultipleFilesArrIdVer(file._id, collectionFiles);

                    if (vers && vers.length > 0) await Promise.all(vers.map(async version => {
                        var verData = {
                            name: `${version.name}-copy`, type: version.type, size: version.size, mimeType: version.mimeType,
                            postedby: version.postedby, org: version.org, active: version.active, category: catId, isVersion: true,
                            version: Number(version.version), created: Date.now(), date: new Date(),
                            versionId: fileData._id, description: version.description, url: '', bucketName: req.token.bucket
                        };

                        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

                        if (verData.size < fileSize && organ.available > verData.size) {
                            const keyV = await createFile(verData, collectionFiles);

                            var fl = version.url;
                            var type = fl.split('.').slice(-1);
                            var fileName = `${uuidv4()}${verData.name.toLowerCase().split(' ').join('-')}.${type}`;
                            verData.url = generateFileName(fileName, verData.org, catId, keyV);

                            await updateUrl(keyV, verData.url, collectionFiles);
                            var date = parseDate();
                            var title = "Administrator has copied a file", message = `A new file ${verData.name} has been copied to File-O by the administrator on ${date} in company files.`;
                            await generateNotification(version.org, catId, version.postedby, title, message, 0, 1, keyV, date, version.type, collectionRoles, collectionUser, collectionNotifs);
                            var url = await copyObject(version.url, verData.url, req.token.bucket);
                            if (url) await updateOrganizationStorage(version.org, organ.data_uploaded, organ.available, organ.combined_plan, version.size, collectionOrg);
                            else await deleteFile(keyV, collectionFiles);
                        }
                    }))
                }
            }));
        }
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionOrg, collectionFile, collectionSets, collectionRoles, collectionUser, collectionNotifs] = [
            await soda.createCollection('orgs'),
            await soda.createCollection('files'),
            await soda.createCollection('sets'),
            await soda.createCollection('roles'),
            await soda.createCollection('users'),
            await soda.createCollection('notifs')
        ];

        const { name, size, type, postedby, org, category, active, versioning, uploadable, latest, compare, description, mime, fName } = req.body;
        var dataSize = size / (1024 * 1024 * 1024);

        var fileData = {
            name: name, type: type, size: dataSize, postedby: postedby, date: new Date(), version: 0, org: org, mimeType: mime,
            bucketName: req.token.bucket, created: Date.now(), isVersion: false, date: new Date(), latest: latest, uploadable: uploadable,
            active: active, versioning: versioning, category: category, versionId: '', compare: compare, description: description, url: ''
        };

        var fileSize = 5;
        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = findFileByName(name, org, category, collectionFile);
        const p3 = getSetting(collectionSets);
        var [organ, file, set] = [await p1, await p2, await p3];
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize) return res.json({ error: 'Upload limit exceeded' });
        if (file) return res.json({ error: 'File with same name already exists within the organization' });

        var key = await createFile(fileData, collectionFile);

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key);

        await updateVersionId(key, fileData.url, collectionFile);

        var date = parseDate();
        var title = "Administrator has added a new file", message = `A new file ${fileData.name} has been added to File-O by the administrator on ${date} in company files.`;
        await generateNotification(org, category, postedby, title, message, 0, 1, key, date, type, collectionRoles, collectionUser, collectionNotifs);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
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

router.post('/registerVer', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionOrg, collectionFile, collectionSets, collectionRoles, collectionUser, collectionNotifs] = [
            await soda.createCollection('orgs'),
            await soda.createCollection('files'),
            await soda.createCollection('sets'),
            await soda.createCollection('roles'),
            await soda.createCollection('users'),
            await soda.createCollection('notifs')
        ];

        const { _id, version, name, active, org, size, type, postedby, category, description, mime, fName } = req.body;
        var dataSize = size / (1024 * 1024 * 1024);

        var fileSize = 5;
        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = findFileByNameVer(name, org, category, version, collectionFile);
        const p3 = getSetting(collectionSets);
        var [organ, fileCheck, set] = [await p1, await p2, await p3];
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize) return res.json({ error: 'Upload limit exceeded' });
        if (fileCheck) return res.json({ error: 'Version already exist' });

        let fileData = {
            name: name, type: type, size: dataSize, mimeType: mime, postedby: postedby, created: Date.now(),
            org: org, active: active, category: category, isVersion: true, version: Number(version),
            versionId: _id, description: description, url: '', bucketName: req.token.bucket, date: new Date()
        };

        const key = await createFile(fileData, collectionFile);
        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key);
        await updateUrl(key, fileData.url, collectionFile);
        var date = parseDate();
        var title = "Administrator has added a new version", message = `A new version of file ${fileData.name} has been added to File-O by the administrator on ${date} in company files.`;
        await generateNotification(org, category, postedby, title, message, 0, 1, _id, date, type, collectionRoles, collectionUser, collectionNotifs);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
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

router.post('/registerNew', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionOrg, collectionFile, collectionSets, collectionRoles, collectionUser, collectionNotifs, collectionFvrFile, collectionRecent] = [
            await soda.createCollection('orgs'), await soda.createCollection('files'),
            await soda.createCollection('sets'), await soda.createCollection('roles'),
            await soda.createCollection('users'), await soda.createCollection('notifs'),
            await soda.createCollection('favr_files'), await soda.createCollection('recfs')
        ];

        const { _id, name, active, org, size, type, postedby, category, description, mime, fName, version, isVersion } = req.body;
        var dataSize = size / (1024 * 1024 * 1024);

        var fileSize = 5;
        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = getSetting(collectionSets);
        const p3 = getLatestVer(_id, collectionFile);
        var [organ, set, file] = [await p1, await p2, await p3];

        if (!file) throw new Error('File does not exist');
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize) return res.json({ error: 'Upload limit exceeded' });

        var fileData = {
            name: name, type: type, mimeType: mime, description: description, size: dataSize,
            postedby: postedby, org: org, bucketName: req.token.bucket, created: Date.now(), date: new Date(),
            active: active, category: category, versionId: file.versionId, url: '', isVersion: isVersion, version: Number(version)
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

        [await updateRectFileD(file._id, collectionRecent), await updateFvrFileD(file._id, collectionFvrFile)];
        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);

        const key = await createFile(fileData, collectionFile);

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key);

        if (version === 0) await updateVersionId(key, fileData.url, collectionFile)
        else await updateUrl(key, fileData.url, collectionFile);

        var date = parseDate();
        var title = "Administrator has added a replaced a file", message = `File ${fileData.name} and its versions has been added to File-O by the administrator on ${date} in company files.`;
        await generateNotification(org, category, postedby, title, message, 0, 1, version === 0 ? key : file.versionId, date, type, collectionRoles, collectionUser, collectionNotifs);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            var organ = await findOrganizationByIdUpt(org, collectionOrg);
            await updateOrganizationStorage(req.token.org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
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

function generateFileName(fileName, org, catId, _id) {
    return `FileO/organization/${org}/category/${catId}/files/${_id}/${fileName}`;
}

async function updateOrganizationStorage(org, d_u, avb, cb_p, size, collection) {
    var uploaded_data = Number(d_u) + Number(size);
    var available = Number(avb) - Number(size);
    if (uploaded_data < 0) uploaded_data = 0;
    if (available > cb_p) available = Number(cb_p);
    var percent_used = (((Number(cb_p - avb)) * 100) % (Number(cb_p)));
    if (percent_used > 100) percent_used = 100;
    var percent_left = 100 - Number(percent_used);
    if (percent_left < 0) percent_left = 0
    await updatePackageDetails(org, uploaded_data, available, percent_left, percent_used, collection);
}

async function generateNotification(org, cat, pBy, title, message, t, uT, fileId, dt, mime, collectionRoles, collectionUser, collectionNotif) {
    var ids = await getCRole(org, cat, collectionRoles);
    if (!ids) ids = [];
    var userIds = await getAllUserByRoles(ids, org, pBy, collectionUser);
    userIds && userIds.length > 0 && await Promise.all(userIds.map(async id => {
        let data = {
            postedBy: pBy, title: title, message: message,
            recievedBy: id, type: t, userType: uT, org: org,
            id: fileId, date: dt, mimeType: mime, created: Date.now(), isRead: false
        };
        await createNotification(data, collectionNotif);
    }));
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

router.get('/getFileCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('files');

        const { org, cat, type, auth } = req.query;
        var count = await getAllFileCount(org, cat, type, auth, collectionFiles);

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

        const [collectionFile, collectionUser, collectionRecent, collectionFvrFile, collectionCats, collectionFileV, collectionNotifs] = [
            await soda.createCollection('files'), await soda.createCollection('users'),
            await soda.createCollection('recfs'), await soda.createCollection('favr_files'),
            await soda.createCollection('cats'), await soda.createCollection('file_views'),
            await soda.createCollection('notifs')
        ];

        const { _id, org, pCat } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        let cat;
        if (pCat) {
            cat = await getCat(pCat, collectionCats);
        }
        const p0 = findRecFileById(_id, 0, collectionRecent);
        const p1 = getFile(_id, collectionFile, collectionCats, collectionUser);
        const p2 = getAllCats(org, cat && cat.parentCat ? cat.parentCat : '', collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);
        const p4 = isFavorite(_id, req.token._id, collectionFvrFile);
        var [fl, file, catList, versions, isF] = [await p0, await p1, await p2, await p3, await p4];
        if (!file) throw new Error('Could not find file');

        let recentData = {
            fileId: _id, userId: req.token._id, orgId: req.token.org, versionId: file.versionId,
            name: file.name, type: file.type, date: new Date(), created: Date.now(),
            isPerm: false, isDel: false
        };

        if (fl) await deleteRecentFile(fl._id, collectionRecent);
        await createRecentFile(recentData, collectionRecent);

        let data = { orgId: org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 1, created: Date.now() };
        await createFileView(data, collectionFileV);

        res.json({ file: file, catList: catList, versions: versions, isF: isF });
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
            await soda.createCollection('files'), await soda.createCollection('file_views')
        ];
        const { _id } = req.params;
        let file = await downloadFile(_id, collectionFile);
        if (!file) throw new Error('Could not find file');
        let data = { orgId: req.token.org, userId: req.token._id, fileId: _id, fileSize: file.size, type: 0, created: Date.now() };
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

        const [collectionFile, collectionUser, collectionRecent, collectionCats, collectionNotifs] = [
            await soda.createCollection('files'), await soda.createCollection('users'),
            await soda.createCollection('recfs'), await soda.createCollection('cats'),
            await soda.createCollection('notifs')
        ];

        const { _id, org, pCat } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);
        let cat;
        if (pCat) {
            cat = await getCat(pCat, collectionCats);
        }
        const p0 = findRecFileById(_id, 0, collectionRecent);
        const p1 = getFile(_id, collectionFile, collectionCats, collectionUser);
        const p2 = getAllCats(org, cat && cat.parentCat ? cat.parentCat : '', collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);
        var [fl, file, catList, versions] = [await p0, await p1, await p2, await p3];
        if (!file) throw new Error('Could not find file');
        let recentData = { fileId: _id, userId: req.token._id, orgId: req.token.org, versionId: file.versionId, name: file.name, type: file.type };
        if (fl) await deleteRecentFile(fl._id, collectionRecent);
        await createRecentFile(recentData, collectionRecent);
        res.json({ file: file, catList: catList, versions: versions });
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

        const [collectionFiles, collectionUser] = [await soda.createCollection('files'), await soda.createCollection('users')];

        const { offset, org, cat, type, auth } = req.query;
        var fileList = await getAllFileLimit(offset, org, cat, type, auth, collectionFiles, collectionUser);

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

        const collectionFiles = await soda.createCollection('files');

        const { string, org, cat, type, auth } = req.query;
        let count = await getAllFileQueryCount(org, string, cat, type, auth, collectionFiles);
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

        const [collectionFiles, collectionUser] = [await soda.createCollection('files'), await soda.createCollection('users')];

        const { offset, string, org, cat, type, auth } = req.query;
        let fileList = await getAllFileQueryLimit(offset, org, string, cat, type, auth, collectionFiles, collectionUser);
        return res.json({ files: fileList });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFileCountM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('files');

        const { org, type, auth } = req.query;

        if (auth === 'true') {
            let cat = [];
            let count = await getAllFileCountM(org, cat, type, auth, collectionFile);
            return res.json({ fileCount: count });
        } else {
            let count = await getAllFileCountM(org, req.query.cat, type, auth, collectionFile);
            return res.json({ fileCount: count });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFilesM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionUser, collectionCats] = [
            await soda.createCollection('files'), await soda.createCollection('users'), await soda.createCollection('cats')
        ];

        const { limit, org, type, auth } = req.query;

        if (auth === 'true') {
            let cat = [];
            let fileList = await getAllFileLimitM(limit, org, cat, type, auth, collectionFile, collectionUser, collectionCats);
            res.json({ files: fileList });
        } else {
            let fileList = await getAllFileLimitM(limit, org, req.query.cat, type, auth, collectionFile, collectionUser, collectionCats);
            res.json({ files: fileList });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFileCountM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { string, org, type, auth } = req.query;
        const collectionFile = await soda.createCollection('files');

        if (auth === 'true') {
            let cat = [];
            let count = await getAllFileQueryCountM(org, string, cat, type, auth, collectionFile);
            return res.json({ fileCount: count });
        } else {
            let count = await getAllFileQueryCountM(org, string, req.query.cat, type, auth, collectionFile);
            return res.json({ fileCount: count });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFilesM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFile, collectionUser, collectionCats] = [await soda.createCollection('files'), await soda.createCollection('users'), await soda.createCollection('cats')];

        const { limit, string, org, type, auth } = req.query;
        if (auth === 'true') {
            let cat = [];
            let fileList = await getAllFileQueryLimitM(limit, org, string, cat, type, auth, collectionFile, collectionUser, collectionCats);
            res.json({ files: fileList })
        } else {
            let fileList = await getAllFileQueryLimitM(limit, org, string, req.query.cat, type, auth, collectionFile, collectionUser, collectionCats);
            res.json({ files: fileList });
        }
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

        const [collectionOrg, collectionFile, collectionUser, collectionCats, collectionFvrFile, collectionNotif, collectionRecent] = [
            await soda.createCollection('orgs'), await soda.createCollection('files'),
            await soda.createCollection('users'), await soda.createCollection('cats'),
            await soda.createCollection('favr_files'), await soda.createCollection('notifs'),
            await soda.createCollection('recfs')
        ];

        const { _id, name, description, cat, active, versioning, compare, uploadable, latest } = req.body;

        let fileDetails = await getFile(_id, collectionFile, collectionCats, collectionUser);

        if (!fileDetails) throw new Error('File with this key does not exist');

        let file;

        if (fileDetails.name !== name) file = await findFileByName(name, req.token.org, cat, collectionFile);

        if (file) throw new Error('File with this name already exists');

        let upt = await updateDetails(_id, name, description, cat, active, versioning, compare, uploadable, latest, collectionFile);

        if (!upt) throw new Error('File Details not updated');

        if (fileDetails.name !== name) await updateFvrName(_id, name, collectionFvrFile);
        if (fileDetails.category !== cat) [await updateRectFileP(_id, collectionRecent), await updateFvrFileP(_id, collectionFvrFile), await fileChanged(_id, collectionNotif)];


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

        const [collectionFile, collectionUser, collectionCats, collectionRecent, collectionFvrFile, collectionNotif] = [
            await soda.createCollection('files'), await soda.createCollection('users'), await soda.createCollection('cats'),
            await soda.createCollection('recfs'), await soda.createCollection('favr_files'), await soda.createCollection('notifs')
        ];

        const { versioning, compare, active, latest, uploadable, _id, org } = req.body;

        await updateFilePerm(_id, active, versioning, compare, latest, uploadable, collectionFile);
        const p1 = getFile(_id, collectionFile, collectionCats, collectionUser);
        const p2 = getAllCats(org, collectionCats);
        const p3 = getAllFileVersion(_id, collectionFile, collectionUser);

        const [file, catList, versions] = [await p1, await p2, await p3];

        if (!active) [await updateRectFileP(_id, collectionRecent), await updateFvrFileP(_id, collectionFvrFile), await fileChanged(_id, collectionNotif)];

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

        const { _id } = req.params;

        const [collectionFile, collectionOrg, collectionRecent, collectionFvrFile, collectionNotif] = [
            await soda.createCollection('files'), await soda.createCollection('orgs'),
            await soda.createCollection('recfs'), await soda.createCollection('favr_files'),
            await soda.createCollection('notifs')
        ];

        var file = await findFileById(_id, collectionFile);
        var p1 = findOrganizationByIdUpt(file.org, collectionOrg);
        var p2 = getAllFileDelVer(file.versionId, collectionFile);
        var [org, fileList] = [await p1, await p2];
        var uploaded_data = Number(org.data_uploaded)
        var available = Number(org.available);
        var combined_plan = Number(org.combined_plan);
        var percent_left, percent_used;

        if (fileList)
            await Promise.all(fileList.map(async (file) => {
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
            }));


        if (!org) throw new error('Organization not found');
        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        [await updateRectFileD(_id, collectionRecent), await updateFvrFileD(_id, collectionFvrFile), await deleteMultipleFilesArrFvr([_id], collectionFvrFile), await fileChanged(_id, collectionNotif)];

        res.json({ success: 'File deleted' });
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

        const [collectionFile, collectionOrg, collectionRecent, collectionFvrFile, collectionNotif] = [
            await soda.createCollection('files'), await soda.createCollection('orgs'),
            await soda.createCollection('recfs'), await soda.createCollection('favr_files'),
            await soda.createCollection('notifs')
        ];

        const { _id, orgId, ver, versionId } = req.body;
        await resetVersion(versionId, ver, collectionFile);

        var p4 = findFileById(_id, collectionFile);
        var p5 = findOrganizationByIdUpt(orgId, collectionOrg);
        var [file, org] = [await p4, await p5];

        if (!org) throw new error('Organization not found');

        if (file) {
            var uploaded_data = Number(org.data_uploaded)
            var available = Number(org.available);
            var combined_plan = Number(org.combined_plan);
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
            await deleteFile(_id, collectionFile);

            await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
            [await updateRectFileD(_id, collectionRecent), await updateFvrFileD(_id, collectionFvrFile), await deleteMultipleFilesArrFvr([_id], collectionFvrFile), await fileChanged(_id, collectionNotif)];
        }
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCombined', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { _id, catId, string, auth, type } = req.query;

        const [collectionFiles, collectionCat] = [await soda.createCollection('files'), await soda.createCollection('cats')];


        let cats, fileList;

        if (string) {
            [cats, fileList] = [await getAllCatLimitQueryC(_id, catId, string, collectionCat), await getAllFileQueryLimit(_id, string, catId, type, auth, collectionFiles)];
        } else {
            [cats, fileList] = [await getAllCatLimitC(_id, catId, collectionCat), await getAllFileLimit(_id, catId, type, auth, collectionFiles)];
        }

        res.json({ catList: cats, files: fileList });
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

        const [collectionFile, collectionRecent, collectionFvrFile] = [await soda.createCollection('files'), await soda.createCollection('recfs'), await soda.createCollection('favr_files')];

        const { value, arr } = req.body;
        var lIds = await getAllNamesByArr(arr, value, collectionFile);
        if (lIds && lIds.length > 0) {
            await updateFilesCat(lIds, value, collectionFile);
            [await updateMultipleFilesArrRect(lIds, collectionRecent), await updateMultipleFilesArrFvr(lIds, collectionFvrFile)];
        }

        res.json({ success: true });
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

        const [collectionFile, collectionUser, collectionOrg, collectionRecent, collectionFvrFile, collectionNotif] = [
            await soda.createCollection('files'), await soda.createCollection('users'),
            await soda.createCollection('orgs'), await soda.createCollection('recfs'),
            await soda.createCollection('favr_files'), await soda.createCollection('notifs')
        ];

        const { arr } = req.body;
        var p0 = findUserById(req.token._id, collectionUser);
        var p1 = getMultipleFileArr(arr, collectionFile);
        var p2 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        var [user, files, organ] = [await p0, await p1, await p2];
        if (!user) return res.json({ error: 'User not found' });
        if (!organ) return res.json({ error: 'Organization not found' });
        var uploaded_data = Number(organ.data_uploaded)
        var available = Number(organ.available);
        var combined_plan = Number(organ.combined_plan);
        var percent_left, percent_used;

        if (files.length > 0) await Promise.all(files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);
            percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
            if (percent_used > 100) percent_used = 100;
            percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;
            await deleteObject(file.url, req.token.bucket);
        }));

        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);

        arr && [await deleteMultipleFileArr(arr, collectionFile), await deleteMultipleFilesArrRect(arr, collectionRecent), await deleteMultipleFilesArrFvr(arr, collectionFvrFile), await filesChanged(arr, collectionNotif)];

        res.json({ success: 'File Deleted' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getAllFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFiles, collectionProj, collectionPFiles, collectionPCat, collectionAss, collectionRoles, collectionUFiles] = [
            await soda.createCollection('files'), await soda.createCollection('projs'),
            await soda.createCollection('proj_files'), await soda.createCollection('proj_cats'),
            await soda.createCollection('proj_assigned'),
            await soda.createCollection('proj_roles'), await soda.createCollection('user_files')
        ];

        const { _id, org } = req.token;
        const { auth, cats, admin } = req.query;
        let assCats;

        let p1 = getAllFileLimitMD(org, cats, admin === 'true' ? true : false, collectionFiles);

        let p2;
        if (auth === 'true') {
            let pIds = await getAllProjectsOfUser(_id, collectionProj);
            assCats = await getProjectManagerUserCats(pIds, collectionPCat);
            p2 = getAllFileLimitPD(assCats, collectionPFiles)
        } else {
            assCats = await getAssignedUserCats(_id, collectionAss, collectionRoles);
            p2 = await getAllFileLimitPD(assCats, collectionFiles);
        }

        let p3 = await getAllFileLimitUD(_id, collectionUFiles);

        const [files, projectFiles, userFiles] = [await p1, await p2, await p3];

        let tempList = [].concat(files, userFiles, projectFiles);

        return res.json({ files: tempList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;