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
    getAllProjectsOfUser
} = require('../schemas/projects');

const {
    getProjectManagerUserCats, getAssignedUserCats
} = require('../schemas/projectCategory');

const {
    getAllFileLimitPD,
} = require('../schemas/projectFile');

const {
    getAllFileLimitUD
} = require('../schemas/userFile');

const {
    findMultipleFilesArrId, updateVersionId, findFileByName, getFile, getVerCount, updateLatestVer,
    getAllFileVersion, updateUrl, findFileById, getAllFileDelVer, getAllNamesByArr, getAllFileVersionC,
    getMultipleFileArr, getAllFileCount, getAllFileLimit, getAllFileQueryCount, getAllFileLimitMD,
    getAllFileQueryLimit, downloadFile, findFileByNameVer, updateFilePerm, updateFilesCat,
    deleteMultipleFileArr, getAllFileCountM, getAllFileQueryCountM, getAllFileQueryLimitM, getLatestVer,
    getAllFileLimitM, createFile, deleteFile, updateDetails, resetVersion, findMultipleFilesArrIdVer, findFileByNameC, updateCat
} = require('../schemas/file');

const {
    isFavorite,
    updateFvrFileD,
    updateFvrName,
    updateFvrFileP,
    deleteMultipleFilesArrFvr,
    updateMultipleFilesArrFvr,
    deleteFvrFiles
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
    findUserById
} = require('../schemas/user');

const {
    createNotification,
    fileChanged,
    filesChanged,
    updatedChanged
} = require('../schemas/notification');

router.post('/uploadType', JWT, async (req, res, next) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionFile = await soda.createCollection('files');
        const collectionCat = await soda.createCollection('cats');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecfs = await soda.createCollection('recfs');


        let _id = req.body.mainFile;
        let tId = req.body.file;

        let newFile = await getFile(tId, collectionFile, collectionCat, collectionUser);
        if (!newFile) throw new Error('Could not find the latest version');

        let fileToReplace = await getLatestVer(_id, collectionFile);
        if (!fileToReplace) throw new Error('Could not find the latest version');

        let vId = fileToReplace.versionId;

        let fileM = await getAllFileVersionC(newFile.versionId, collectionFile);

        let delFile;

        if (req.body.type === 0 && fileM && fileM.length >= 0) {
            await updateLatestVer(fileToReplace._id, fileM.length, fileM[0].versionId, fileM[0].category, collectionFile);
        } else if (req.body.type === 1 && fileM && fileM.length >= 0) {
            delFile = await getLatestVer(newFile.versionId, collectionFile);
            await updateLatestVer(fileToReplace._id, fileM.length > 0 ? fileM.length - 1 : 0, fileM[0].versionId, fileM[0].category, collectionFile);
        }

        if (!vId) throw new Error('Could not find file');

        let org = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        let fileList = await getAllFileDelVer(vId, collectionFile);

        var uploaded_data = Number(org.data_uploaded)
        var available = Number(org.available);
        var combined_plan = Number(org.combined_plan);
        var percent_left, percent_used;

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

                await deleteObject(file.url, req.token.bucket);
                await deleteFile(file._id, collectionFile);
            }));


        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        await updateRectFileP(_id, collectionRecfs);
        await deleteFvrFiles(_id, collectionFvrFile);
        await filesChanged([_id], collectionNotif);

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


        const collectionOrg = await soda.createCollection('orgs');
        const collectionFiles = await soda.createCollection('files');
        const collectionCat = await soda.createCollection('cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionSets = await soda.createCollection('sets');

        const { arr, catId } = req.body;

        let fileSize = 5;
        let set = await getSetting(collectionSets);
        let files = await findMultipleFilesArrId(arr, collectionFiles);

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

                let f = await findFileByName(fileData.name, req.token.org, fileData.category, collectionFiles);
                var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

                if (!f && fileData.size < fileSize && organ.available > fileData.size) {
                    var key = await createFile(fileData, collectionFiles);
                    var fl = file.url;
                    var type = fl.split('.').slice(-1);
                    var fileName = `${fileData.name}.${type}`;
                    fileData.url = generateFileName(fileName, file.org, catId, key);
                    await updateVersionId(key, fileData.url, collectionFiles)
                    var date = parseDate();
                    var title = "Administrator has copied file", message = `A new file ${fileData.name} has been copied to File-O by the administrator on ${date} in company files.`;
                    await generateNotification(file.org, catId, file.postedby, title, message, 0, 1, key, date, file.type, collectionCat, collectionNotifs);
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
                            var fileName = `${verData.name}.${type}`;
                            verData.url = generateFileName(fileName, verData.org, catId, keyV);

                            await updateUrl(keyV, verData.url, collectionFiles);
                            var date = parseDate();
                            var title = "Administrator has copied a file", message = `A new file ${verData.name} has been copied to File-O by the administrator on ${date} in company files.`;
                            await generateNotification(version.org, catId, version.postedby, title, message, 0, 1, keyV, date, version.type, collectionCat, collectionNotifs);
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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionFile = await soda.createCollection('files');
        const collectionCat = await soda.createCollection('cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionSets = await soda.createCollection('sets');

        const { name, size, type, postedby, org, category, active, versioning, uploadable, latest, compare, description, mime, fName, uploadType } = req.body;
        let dataSize = size / (1024 * 1024 * 1024);

        var fileData = {
            name: name, type: type, size: dataSize, postedby: postedby, date: new Date(), version: 0, org: org, mimeType: mime,
            bucketName: req.token.bucket, created: Date.now(), isVersion: false, date: new Date(), latest: latest, uploadable: uploadable,
            active: active, versioning: versioning, category: category, versionId: '', compare: compare, description: description, url: ''
        };

        let fileSize = 5;
        var organ = await findOrganizationByIdUpt(org, collectionOrg);
        let file;
        if (uploadType !== 1) {
            file = await findFileByName(name, org, category, collectionFile);
        } else {
            file = await findFileByNameC(name, org, category, collectionFile, collectionCat);
        }

        let set = await getSetting(collectionSets);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize) return res.json({ error: 'Upload limit exceeded' });
        if (file) {
            if (uploadType !== 1)
                return res.json({ error: 'File with same name already exists within the organization' });
            else
                return res.json({ error: 'File', file, type: uploadType });
        }

        let key = await createFile(fileData, collectionFile);

        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key);

        await updateVersionId(key, fileData.url, collectionFile);

        var date = parseDate();
        var title = "Administrator has added a new file", message = `A new file ${fileData.name} has been added to File-O by the administrator on ${date} in company files.`;
        await generateNotification(org, category, postedby, title, message, 0, 1, key, date, type, collectionCat, collectionNotifs);
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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionFile = await soda.createCollection('files');
        const collectionCat = await soda.createCollection('cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionSets = await soda.createCollection('sets');

        const { _id, name, active, org, size, type, postedby, category, description, mime, fName } = req.body;

        let dataSize = size / (1024 * 1024 * 1024);

        let fileSize = 5;

        let version = await getVerCount(_id, collectionFile);

        var organ = await findOrganizationByIdUpt(org, collectionOrg);
        let fileCheck = await findFileByNameVer(name, org, category, version, collectionFile);
        let set = await getSetting(collectionSets);

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
        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key);

        await updateUrl(key, fileData.url, collectionFile);

        var date = parseDate();
        var title = "Administrator has added a new version", message = `A new version of file ${fileData.name} has been added to File-O by the administrator on ${date} in company files.`;

        await generateNotification(org, category, postedby, title, message, 0, 1, _id, date, type, collectionCat, collectionNotifs);

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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionFile = await soda.createCollection('files');
        const collectionCat = await soda.createCollection('cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionSets = await soda.createCollection('sets');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('recfs');


        const { _id, name, active, org, size, type, postedby, category, description, mime, fName } = req.body;

        let dataSize = size / (1024 * 1024 * 1024);

        let fileSize = 5;

        var organ = await findOrganizationByIdUpt(org, collectionOrg);
        let set = await getSetting(collectionSets);
        let file = await getLatestVer(_id, collectionFile);

        if (!file) throw new Error('File does not exist');
        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });
        if (organ.available < dataSize) return res.json({ error: 'Upload limit exceeded' });

        let version = await getVerCount(file.versionId, collectionFile);

        var fileData = {
            name: name, type: type, mimeType: mime, description: description, size: dataSize,
            postedby: postedby, org: org, bucketName: req.token.bucket, created: Date.now(), date: new Date(),
            active: active, category: category, versionId: file.versionId, url: '',
            isVersion: version <= 1 ? false : true, version: version ? Number(version) - 1 : 0
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

        await updateRectFileD(file._id, collectionRecent);
        await updateFvrFileD(file._id, collectionFvrFile);
        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);

        const key = await createFile(fileData, collectionFile);

        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key);

        if (version <= 1) await updateVersionId(key, fileData.url, collectionFile)
        else await updateUrl(key, fileData.url, collectionFile);

        var date = parseDate();
        var title = "Administrator has replaced a file", message = `File ${fileData.name} and its versions has been added to File-O by the administrator on ${date} in company files.`;
        await generateNotification(org, category, postedby, title, message, 0, 1, version <= 1 ? key : file.versionId, date, type, collectionCat, collectionNotifs);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);
        if (url) {
            organ = await findOrganizationByIdUpt(org, collectionOrg);
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
    return `FileO/organization/${org}/category/${catId}/files/${_id}/${uuidv4()}/${fileName}`;
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

async function generateNotification(org, cat, pBy, title, message, t, uT, fileId, dt, mime, collectionCat, collectionNotif) {
    let category;

    if (cat)
        category = await getCat(cat, collectionCat);

    category && category.ids && category.ids.length > 0 && await Promise.all(category.ids.map(async id => {
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
        let count = await getAllFileCount(org, cat, type, auth, collectionFiles);

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

        const collectionUser = await soda.createCollection('users');
        const collectionFile = await soda.createCollection('files');
        const collectionCats = await soda.createCollection('cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionFileV = await soda.createCollection('file_views');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('recfs');

        const { _id, org, pCat } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);

        let cat;

        if (pCat) {
            cat = await getCat(pCat, collectionCats);
        }

        let fl = await findRecFileById(_id, 0, collectionRecent);
        let file = await getFile(_id, collectionFile, collectionCats, collectionUser);
        let catList = await getAllCats(org, cat && cat.parentCat ? cat.parentCat : '', collectionCats);
        let versions = await getAllFileVersion(_id, collectionFile, collectionUser);
        let isF = await isFavorite(_id, req.token._id, collectionFvrFile);

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

        const collectionFile = await soda.createCollection('files');
        const collectionFileV = await soda.createCollection('file_views');

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

        const collectionUser = await soda.createCollection('users');
        const collectionFile = await soda.createCollection('files');
        const collectionCats = await soda.createCollection('cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionRecent = await soda.createCollection('recfs');

        const { _id, org, pCat } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);

        let cat;
        if (pCat) {
            cat = await getCat(pCat, collectionCats);
        }

        let fl = await findRecFileById(_id, 0, collectionRecent);
        let file = await getFile(_id, collectionFile, collectionCats, collectionUser);
        let catList = await getAllCats(org, cat && cat.parentCat ? cat.parentCat : '', collectionCats);
        let versions = await getAllFileVersion(_id, collectionFile, collectionUser);

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

        const collectionUser = await soda.createCollection('users');
        const collectionFiles = await soda.createCollection('files');

        const { offset, org, cat, type, auth } = req.query;
        let fileList = await getAllFileLimit(offset, org, cat, type, auth, collectionFiles, collectionUser);

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

        const collectionUser = await soda.createCollection('users');
        const collectionFiles = await soda.createCollection('files');

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

        const collectionUser = await soda.createCollection('users');
        const collectionFile = await soda.createCollection('files');
        const collectionCats = await soda.createCollection('cats');

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

        const collectionUser = await soda.createCollection('users');
        const collectionFile = await soda.createCollection('files');
        const collectionCats = await soda.createCollection('cats');

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

        const collectionUser = await soda.createCollection('users');
        const collectionFile = await soda.createCollection('files');
        const collectionCats = await soda.createCollection('cats');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('recfs');

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


        res.json({ file: upt });
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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionFile = await soda.createCollection('files');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('recfs');

        let file = await findFileById(_id, collectionFile);
        let org = await findOrganizationByIdUpt(file.org, collectionOrg);
        let fileList = await getAllFileDelVer(file.versionId, collectionFile);

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
        await updateRectFileD(_id, collectionRecent);
        await updateFvrFileD(_id, collectionFvrFile);
        await deleteMultipleFilesArrFvr([_id], collectionFvrFile);
        await fileChanged(_id, collectionNotif);

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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionFile = await soda.createCollection('files');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('recfs');

        const { _id, orgId, ver, versionId } = req.body;
        
        let newKey = await resetVersion(versionId, ver, collectionFile);

        let file = await findFileById(_id, collectionFile);
        let org = await findOrganizationByIdUpt(orgId, collectionOrg);

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
            await updateRectFileD(_id, collectionRecent);
            await updateFvrFileD(_id, collectionFvrFile);
            await deleteMultipleFilesArrFvr([_id], collectionFvrFile);
            await fileChanged(_id, collectionNotif);
        }

        let fileR;

        if (newKey)
            fileR = await getLatestVer(newKey, collectionFile);

        if (fileR) {
            return res.json({ file: fileR });
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

        const collectionFiles = await soda.createCollection('files');
        const collectionCat = await soda.createCollection('cats');

        let cats, fileList;

        if (string) {
            cats = await getAllCatLimitQueryC(_id, catId, string, collectionCat);
            fileList = await getAllFileQueryLimit(_id, string, catId, type, auth, collectionFiles);
        } else {
            cats = await getAllCatLimitC(_id, catId, collectionCat);
            fileList = await getAllFileLimit(_id, catId, type, auth, collectionFiles);
        }

        res.json({ catList: cats, files: fileList });
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

        const collectionUser = await soda.createCollection('users');
        const collectionFile = await soda.createCollection('files');
        const collectionCats = await soda.createCollection('cats');

        let fileDetails = await getFile(_id, collectionFile, collectionCats, collectionUser);

        if (!fileDetails) throw new Error('File with this key does not exist');

        let file = await findFileByNameC(fileDetails.name, req.token.org, cat, collectionFile, collectionCats);

        if (file) return res.json({ error: 'File', mainFile: fileDetails, file: file, type: 0 })

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

        const collectionFile = await soda.createCollection('files');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('recfs');

        const { value, arr } = req.body;
        let lIds = await getAllNamesByArr(arr, value, collectionFile);
        if (lIds && lIds.length > 0) {
            await updateFilesCat(lIds, value, collectionFile);
            await updateMultipleFilesArrRect(lIds, collectionRecent);
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

router.post('/deleteFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionFile = await soda.createCollection('files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecent = await soda.createCollection('recfs');

        const { arr } = req.body;
        let user = await findUserById(req.token._id, collectionUser);
        let files = await getMultipleFileArr(arr, collectionFile);
        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

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

        if (arr && arr.length > 0) {
            await deleteMultipleFileArr(arr, collectionFile);
            await deleteMultipleFilesArrRect(arr, collectionRecent);
            await deleteMultipleFilesArrFvr(arr, collectionFvrFile);
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

router.get('/getAllFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');
        const collectionFiles = await soda.createCollection('files');
        const collectionPFiles = await soda.createCollection('proj_files');
        const collectionPCat = await soda.createCollection('proj_cats');
        const collectionUFiles = await soda.createCollection('user_files');

        const { _id, org } = req.token;
        const { auth, cats, admin } = req.query;
        let assCats;

        let files = await getAllFileLimitMD(org, cats, admin === 'true' ? true : false, collectionFiles);

        let projectFiles;
        if (auth === 'true') {
            let pIds = await getAllProjectsOfUser(_id, collectionProj);
            assCats = await getProjectManagerUserCats(pIds, collectionPCat);
            projectFiles = getAllFileLimitPD(assCats, collectionPFiles)
        } else {
            assCats = await getAssignedUserCats(_id, collectionPCat);
            projectFiles = await getAllFileLimitPD(assCats, collectionFiles);
        }

        let userFiles = await getAllFileLimitUD(_id, collectionUFiles);

        let tempList = [].concat(files, userFiles, projectFiles);

        return res.json({ files: tempList });
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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionFile = await soda.createCollection('files');
        const collectionCat = await soda.createCollection('cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionSets = await soda.createCollection('sets');

        const { _id, catId } = req.body;

        let fileSize = 5;
        let set = await getSetting(collectionSets);

        let file = await findFileById(_id, collectionFile);

        if (!file) throw new Error('File not found');

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        var fileData = {
            name: `${file.name}`, type: file.type, size: file.size, postedby: file.postedby,
            org: file.org, mimeType: file.mimeType, bucketName: req.token.bucket, date: new Date(),
            active: file.active, versioning: file.versioning, category: catId, versionId: '', version: 0,
            compare: file.compare, description: file.description, url: '', created: Date.now(),
            isVersion: false,
        };

        var f = await findFileByName(fileData.name, req.token.org, fileData.category, collectionFile);
        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

        if (!f && fileData.size < fileSize && organ.available > fileData.size) {
            var key = await createFile(fileData, collectionFile);
            var fl = file.url;
            var type = fl.split('.').slice(-1);
            var fileName = `${fileData.name}.${type}`;
            fileData.url = generateFileName(fileName, file.org, catId, key);

            await updateVersionId(key, fileData.url, collectionFile)

            var date = parseDate();
            var title = "Administrator has copied file", message = `A new file ${fileData.name} has been copied to File-O by the administrator on ${date} in company files.`;

            await generateNotification(file.org, catId, file.postedby, title, message, 0, 1, key, date, file.type, collectionCat, collectionNotifs);

            var url = await copyObject(file.url, fileData.url, req.token.bucket);

            if (url) await updateOrganizationStorage(file.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
            else await deleteFile(key, collectionFiles);

            const vers = await findMultipleFilesArrIdVer(file._id, collectionFile);

            if (vers && vers.length > 0) await Promise.all(vers.map(async version => {
                var verData = {
                    name: `${version.name}`, type: version.type, size: version.size, mimeType: version.mimeType,
                    postedby: version.postedby, org: version.org, active: version.active, category: catId, isVersion: true,
                    version: Number(version.version), created: Date.now(), date: new Date(),
                    versionId: fileData._id, description: version.description, url: '', bucketName: req.token.bucket
                };

                var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

                if (verData.size < fileSize && organ.available > verData.size) {
                    const keyV = await createFile(verData, collectionFile);

                    var fl = version.url;
                    var type = fl.split('.').slice(-1);
                    var fileName = `${verData.name}.${type}`;

                    verData.url = generateFileName(fileName, verData.org, catId, keyV);

                    await updateUrl(keyV, verData.url, collectionFile);

                    var date = parseDate();
                    var title = "Administrator has copied a file", message = `A new file ${verData.name} has been copied to File-O by the administrator on ${date} in company files.`;

                    await generateNotification(version.org, catId, version.postedby, title, message, 0, 1, keyV, date, version.type, collectionCat, collectionNotifs);

                    var url = await copyObject(version.url, verData.url, req.token.bucket);

                    if (url) await updateOrganizationStorage(version.org, organ.data_uploaded, organ.available, organ.combined_plan, version.size, collectionOrg);
                    else await deleteFile(keyV, collectionFiles);
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