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
    createFileView
} = require('../schemas/fileView');

const {
    getAllFileCount,
    getMultipleFileArr,
    deleteMultipleFileArr,
    getAllFileLimit,
    getAllFileQueryCount,
    getAllFileQueryLimit,
    getAllFileCountM,
    getAllFileLimitM,
    resetVersion,
    getAllFileQueryCountM,
    getAllFileQueryLimitM,
    findFileByName,
    createFile,
    updateVersionId,
    deleteFile,
    updateUrl,
    findPFileById,
    getFile,
    findFileByNameVer,
    getAllFileVersion,
    downloadFile,
    updatePerm,
    getAllNamesByArr,
    updateFilesCat,
    getAllFileDelVer,
    getLatestVer,
    findMultipleFilesArrId,
    findMultipleFilesArrIdVer,
    getAllFileQueryLimitSP,
    getAllFileLimitSP,
    updateDetails,
    findFileByNameC,
    updateCat,
    updateLatestVer,
    getVerCount,
    getAllFileVersionC,
    getFileId
} = require('../schemas/projectFile');

const {
    deleteObject,
    copyObject,
    putPresignedUrl
} = require('../middlewares/oci-sdk');

const {
    findOrganizationByIdUpt,
    updatePackageDetails,
} = require('../schemas/organization');

const {
    getProjectById,
    isProjectManager,
} = require('../schemas/projects');

const {
    getSetting
} = require('../schemas/setting');

const {
    createNotification,
    fileChanged,
    updatedChanged,
    filesChanged
} = require('../schemas/notification');

const {
    findRecFileById,
    createRecentFile,
    deleteRecentFile,
    updateRectFileD,
    updateRectFileP,
    updateMultipleFilesArrRect,
    deleteMultipleFilesArrRect
} = require('../schemas/recentProjectFiles');

const {
    getAllCats,
    getAllCatsC,
    getAllCatsQueryC,
    getCatById
} = require('../schemas/projectCategory');

const {
    isFavorite,
    updateFvrFileD,
    updateFvrName,
    updateFvrFileP,
    updateMultipleFilesArrFvr,
    deleteFvrFiles
} = require('../schemas/favrFiles');

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionProjs = await soda.createCollection('projs');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSets = await soda.createCollection('sets');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionCat = await soda.createCollection('proj_cats');

        const {
            name, size, type, postedby, org, category, active, versioning, compare, pId, uploadable, description, mime, fName, latest, uploadType
        } = req.body;

        let dataSize = size / (1024 * 1024 * 1024);
        let fileSize = 5;

        var organ = await findOrganizationByIdUpt(org, collectionOrg);

        let file;
        if (uploadType !== 1) {
            file = await findFileByName(name, org, category, collectionFiles);
        } else {
            file = await findFileByNameC(name, org, category, collectionFiles, collectionCat);
        }

        let project = await getProjectById(pId, collectionProjs);
        let PM = await isProjectManager(pId, postedby, collectionProjs);
        let set = await getSetting(collectionSets);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (organ.available < dataSize) throw new Error('Upload limit exceeded');
        if (dataSize > fileSize) throw new Error('File exceeds size limit');
        if (file) {
            if (uploadType !== 1)
                return res.json({ error: 'File with same name already exists within the organization' });
            else
                return res.json({ error: 'Project File', file, type: uploadType });
        }

        var fileData = {
            name: name, type: type, size: dataSize, postedby: postedby, org: org, description: description, url: '',
            active: active, versioning: versioning, category: category, versionId: '', compare: compare, pId: pId,
            uploadable: uploadable, mimeType: mime, bucketName: req.token.bucket, created: Date.now(), date: new Date(),
            isVersion: false, version: 0, latest: latest
        };

        let key = await createFile(fileData, collectionFiles);
        await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);

        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key, pId);

        await updateVersionId(key, fileData.url, collectionFiles);

        var date = parseDate();
        var title = `${PM ? 'Project Manager' : 'Participant'} has added a new file in project ${project.name}`, message = `A new file ${fileData.name} has been added to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;

        await generateNotification(org, category, postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, type, pId, req.token._id, collectionNotifs, collectionCat);

        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);


        if (url) res.json({ file: fileData, url: url });
        else {
            await deleteFile(key, collectionFiles);
            throw new Error('Could not upload file');
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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionProjs = await soda.createCollection('projs');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSets = await soda.createCollection('sets');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionCat = await soda.createCollection('proj_cats');


        const { _id, name, active, org, size, type, pId, postedby, category, description, mime, fName } = req.body;

        let dataSize = size / (1024 * 1024 * 1024);
        let fileSize = 5;

        let version = await getVerCount(_id, collectionFiles);

        var organ = await findOrganizationByIdUpt(org, collectionOrg);
        let fileCheck = await findFileByNameVer(name, org, category, version, collectionFiles);
        let project = await getProjectById(pId, collectionProjs);
        let PM = await isProjectManager(pId, postedby, collectionProjs);
        let set = await getSetting(collectionSets);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (fileCheck) throw new Error('Version already exist');
        if (dataSize > fileSize) throw new Error('File exceeds size limit');
        if (organ.available < dataSize) throw new Error('Upload limit exceeded');

        var fileData = {
            name: name, type: type, mimeType: mime, size: dataSize, postedby: postedby,
            org: org, active: active, category: category, isVersion: true, version: Number(version),
            versionId: _id, pId: pId, description: description, url: '', bucketName: req.token.bucket,
            created: Date.now(), date: new Date()
        };

        let key = await createFile(fileData, collectionFiles);
        await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);

        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key, pId);

        await updateUrl(key, fileData.url, collectionFiles);
        var date = parseDate();
        var title = `${PM ? 'Project Manager' : 'Participant'} has added a new file in project ${project.name}`, message = `A new file ${fileData.name} has been added to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;
        await generateNotification(org, category, postedby, title, message, 1, PM ? 1 : 2, _id, project, PM, date, type, pId, req.token._id, collectionNotifs, collectionCat);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);

        if (url) res.status(200).json({ file: fileData, url: url });
        else res.json({ error: 'Could not upload file version' });
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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionProjs = await soda.createCollection('projs');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSets = await soda.createCollection('sets');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionCat = await soda.createCollection('proj_cats');
        const collectionPrecfs = await soda.createCollection('precfs');
        const collectionFvrFiles = await soda.createCollection('favr_files');

        const { _id, name, active, org, size, type, postedby, category, pId, description, mime, fName } = req.body;

        let dataSize = size / (1024 * 1024 * 1024);
        let fileSize = 5;

        var organ = await findOrganizationByIdUpt(org, collectionOrg);
        let project = await getProjectById(pId, collectionProjs);
        let PM = await isProjectManager(pId, postedby, collectionProjs);
        let set = await getSetting(collectionSets);
        let file = await getLatestVer(_id, collectionFiles);

        let version = await getVerCount(file.versionId, collectionFiles);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        var fileData = {
            name: name, type: type, mimeType: mime, size: dataSize, postedby: postedby,
            org: org, active: active, category: category, versionId: file.versionId, pId: pId,
            description: description, url: '', isVersion: version <= 1 ? false : true,
            bucketName: req.token.bucket, created: Date.now(), date: new Date(), version: version ? Number(version) - 1 : 0
        };

        if (!file) return res.json({ error: 'File not found' });
        if (organ.available < dataSize) return res.json({ error: 'Upload limit exceeded' });
        if (dataSize > fileSize) return res.json({ error: 'File exceeds size limit' });


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
        await deleteFile(file._id, collectionFiles);

        await updateRectFileD(file._id, collectionPrecfs);
        await updateFvrFileD(file._id, collectionFvrFiles);

        await updatePackageDetails(org, uploaded_data, available, percent_left, percent_used, collectionOrg);

        var organ = await findOrganizationByIdUpt(org, collectionOrg);


        let key = await createFile(fileData, collectionFiles);
        await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);

        const fileName = `${fName}`;
        fileData.url = generateFileName(fileName, org, category, key, pId);

        if (Number(version) <= 1) await updateVersionId(key, fileData.url, collectionFiles)
        else await updateUrl(key, fileData.url, collectionFiles);

        var date = parseDate();
        var title = `${PM ? 'Project Manager' : 'Participant'} has added a new file in project ${project.name}`, message = `A new file ${fileData.name} has been added to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;
        await generateNotification(org, category, postedby, title, message, 1, PM ? 1 : 2, Number(version) <= 1 ? key : file.versionId, project, PM, date, type, pId, req.token._id, collectionNotifs, collectionCat);
        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);

        if (url) res.status(200).json({ file: fileData, url: url });
        else res.json({ error: 'Could not upload file version' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function generateFileName(fileName, org, catId, _id, pId) {
    return `FileO/organization/${org}/projects/${pId}/category/${catId}/files/${_id}/${uuidv4()}/${fileName}`;
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

async function generateNotification(org, cat, pBy, title, message, t, uT, fileId, project, PM, dt, mime, pId, skipId, collectionNotifs, collectionCat) {
    let category = await getCatById(cat, collectionCat);

    category && category.ids && category.ids.length > 0 && await Promise.all(category.ids.map(async id => {
        var data = {
            postedBy: pBy, title: title, message: message,
            recievedBy: id, type: t, userType: uT, org: org,
            id: fileId, date: dt, mimeType: mime, pId: pId,
            date: new Date(), created: Date.now()
        };
        id !== skipId && await createNotification(data, collectionNotifs);
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
}

router.get('/getFile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionPrecfs = await soda.createCollection('precfs');
        const collectionFvrFiles = await soda.createCollection('favr_files');
        const collectionFileV = await soda.createCollection('file_views');
        const collectionUsers = await soda.createCollection('users');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionProjCat = await soda.createCollection('proj_cats');

        const { _id, pId, pCat } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);

        let cat;
        if (pCat) {
            cat = await getCatById(pCat, collectionProjCat);
        }

        let fl = await findRecFileById(_id, 0, collectionPrecfs);
        let file = await getFile(_id, collectionFiles, collectionProjCat);
        let catList = await getAllCats(pId, cat && cat.parentCat ? cat.parentCat : '', collectionProjCat);
        let versions = await getAllFileVersion(_id, collectionFiles, collectionUsers);
        let isF = await isFavorite(_id, req.token._id, collectionFvrFiles);

        let rectData = {
            fileId: _id, userId: req.token._id, created: Date.now(), date: new Date(),
            orgId: req.token.org, pId: pId, versionId: file.versionId, name: file.name, type: file.type
        };

        if (fl) await deleteRecentFile(fl._id, collectionPrecfs);
        await createRecentFile(rectData, collectionPrecfs);

        let data = {
            orgId: req.token.org, userId: req.token._id,
            fileId: _id, fileSize: file.size, type: 1,
            created: Date.now(), date: new Date()
        };

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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionFileV = await soda.createCollection('file_views');

        const { _id } = req.params;
        let file = await downloadFile(_id, collectionFiles);

        let data = {
            orgId: req.token.org, userId: req.token._id,
            fileId: _id, fileSize: file.size, type: 1,
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

router.get('/getFileDetails', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionFiles = await soda.createCollection('proj_files');
        const collectionProjCat = await soda.createCollection('proj_cats');
        const collectionPrecfs = await soda.createCollection('precfs');
        const collectionUsers = await soda.createCollection('users');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id, pId, pCat } = req.query;

        let cat;
        if (pCat) {
            cat = await getCatById(pCat, collectionProjCat);
        }

        await updatedChanged(_id, req.token._id, collectionNotifs);
        let fl = await findRecFileById(_id, 0, collectionPrecfs);
        let file = await getFile(_id, collectionFiles, collectionProjCat);
        let catList = await getAllCats(pId, cat && cat.parentCat ? cat.parentCat : '', collectionProjCat);
        let versions = await getAllFileVersion(_id, collectionFiles, collectionUsers);

        if (fl) await deleteRecentFile(fl._id, collectionPrecfs);

        var data = {
            fileId: _id, userId: req.token._id, created: Date.now(),
            orgId: req.token.org, pId: pId, date: new Date(),
            versionId: file.versionId, name: file.name, type: file.type
        };

        await createRecentFile(data, collectionPrecfs);

        res.json({ file: file, catList: catList, versions: versions });
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

        const collectionFiles = await soda.createCollection('proj_files');

        const { cat, type, auth, pId } = req.query;
        let count = await getAllFileCount(pId, cat, type, auth, collectionFiles);

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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionCats = await soda.createCollection('proj_cats');

        const { offset, pId, cat, type, auth } = req.query;
        let fileList = await getAllFileLimit(offset, pId, cat, type, auth, collectionFiles, collectionCats);

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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionCats = await soda.createCollection('proj_cats');

        const { pId, cat, type, auth, string } = req.query;

        let fileList, catList;

        if (string) {
            fileList = await getAllFileQueryLimitSP(pId, cat, type, string, auth, collectionFiles);
            catList = await getAllCatsQueryC(cat, string, collectionCats);
        }
        else {
            fileList = await getAllFileLimitSP(pId, cat, type, auth, collectionFiles);
            catList = await getAllCatsC(cat, collectionCats);
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

        const collectionFiles = await soda.createCollection('proj_files');

        const { string, pId, cat, type, auth } = req.query;
        let count = await getAllFileQueryCount(pId, string, cat, type, auth, collectionFiles);

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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionCats = await soda.createCollection('proj_cats');

        const { offset, string, pId, cat, type, auth } = req.query;
        let fileList = await getAllFileQueryLimit(offset, pId, string, cat, type, auth, collectionFiles, collectionCats);

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

        const collectionFiles = await soda.createCollection('proj_files');

        const { pId, type, auth } = req.query;

        if (auth === 'true') {
            let cat = [];
            let count = await getAllFileCountM(pId, cat, type, auth, collectionFiles);
            return res.json({ fileCount: count });
        } else {
            let count = await getAllFileCountM(pId, req.query.cat, type, auth, collectionFiles);
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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionCats = await soda.createCollection('proj_cats');

        const { limit, pId, type, auth } = req.query;

        if (auth === 'true') {
            var cat = [];
            var fileList = await getAllFileLimitM(limit, pId, cat, type, auth, collectionFiles, collectionCats);
            res.json({ files: fileList });
        } else {
            var fileList = await getAllFileLimitM(limit, pId, req.query.cat, type, auth, collectionFiles, collectionCats);
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

        const collectionFiles = await soda.createCollection('proj_files');

        const { string, pId, type, auth } = req.query;

        if (auth === 'true') {
            let cat = [];
            let count = await getAllFileQueryCountM(pId, string, cat, type, auth, collectionFiles);
            return res.json({ fileCount: count });
        } else {
            let count = await getAllFileQueryCountM(pId, string, req.query.cat, type, auth, collectionFiles);
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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionCats = await soda.createCollection('proj_cats');

        const { limit, string, pId, type, auth } = req.query;
        if (auth === 'true') {
            let cat = [];
            let fileList = await getAllFileQueryLimitM(limit, pId, string, cat, type, auth, collectionFiles, collectionCats);
            res.json({ files: fileList })
        } else {
            let fileList = await getAllFileQueryLimitM(limit, pId, string, req.query.cat, type, auth, collectionFiles, collectionCats);
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


        const collectionFiles = await soda.createCollection('proj_files');
        const collectionPCats = await soda.createCollection('proj_cats');
        const collectionFvrFiles = await soda.createCollection('favr_files');
        const collectionPrecfs = await soda.createCollection('proj_cats');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id, name, description, cat, active, versioning, compare, uploadable, latest } = req.body;

        let fileDetails = await getFile(_id, collectionFiles, collectionPCats);

        if (!fileDetails) throw new Error('File with this key does not exist');

        let file;

        if (fileDetails.name !== name) file = await findFileByName(name, req.token.org, cat, collectionFiles);

        if (file) throw new Error('File with this name already exists');

        let upt = await updateDetails(_id, name, description, cat, active, versioning, compare, uploadable, latest, collectionFiles);

        if (!upt) throw new Error('File Details not updated');

        if (fileDetails.name !== name) await updateFvrName(_id, name, collectionFvrFiles);

        if (fileDetails.category !== cat) {
            await updateRectFileP(_id, collectionPrecfs);
            await updateFvrFileP(_id, collectionFvrFiles), await fileChanged(_id, collectionNotifs);
        }

        res.json({ file: upt });
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


        const collectionFiles = await soda.createCollection('proj_files');
        const collectionProjCat = await soda.createCollection('proj_cats');
        const collectionUsers = await soda.createCollection('users');
        const collectionFvrFiles = await soda.createCollection('favr_files');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionPrecfs = await soda.createCollection('precfs');

        const { versioning, compare, active, uploadable, latest, _id, pId } = req.body;

        await updatePerm(_id, active, versioning, compare, uploadable, latest, collectionFiles);
        let file = await getFile(_id, collectionFiles, collectionProjCat);
        let catList = await getAllCats(pId, collectionProjCat);
        let versions = await getAllFileVersion(_id, collectionFiles, collectionUsers);

        if (!active) {
            await updateRectFileP(_id, collectionPrecfs);
            await updateFvrFileP(_id, collectionFvrFiles);
            await fileChanged(_id, collectionNotifs);
        }

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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionFvrFiles = await soda.createCollection('favr_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionPrecfs = await soda.createCollection('precfs');

        const { _id } = req.params;

        let file = await findPFileById(_id, collectionFiles);
        if (!file) throw new Error('File not found');

        var org = await findOrganizationByIdUpt(file.org, collectionOrg);
        let fileList = await getAllFileDelVer(file.versionId, collectionFiles);

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
                await deleteFile(file._id, collectionFiles)
            }));

        await updateRectFileD(_id, collectionPrecfs);
        await updateFvrFileD(_id, collectionFvrFiles);
        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);

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


        const collectionFile = await soda.createCollection('proj_files');
        const collectionFvrFiles = await soda.createCollection('favr_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionPrecfs = await soda.createCollection('precfs');

        const { _id, orgId, ver, versionId } = req.body;
        let newKey = await resetVersion(versionId, ver, collectionFile);

        var file = await findPFileById(_id, collectionFile);
        var org = await findOrganizationByIdUpt(orgId, collectionOrg);

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
            await deleteFile(file._id, collectionFile);
            await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
            await updateRectFileD(_id, collectionPrecfs);
            await updateFvrFileD(_id, collectionFvrFiles);
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

router.post('/updateFilesCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionFile = await soda.createCollection('proj_files');
        const collectionFvrFiles = await soda.createCollection('favr_files');
        const collectionPrecfs = await soda.createCollection('precfs');

        const { value, arr } = req.body;
        let lIds = await getAllNamesByArr(arr, value, collectionFile);

        if (lIds && lIds.length > 0) {
            await updateFilesCat(lIds, value, collectionFile);
            await updateMultipleFilesArrRect(lIds, collectionPrecfs);
            await updateMultipleFilesArrFvr(lIds, collectionFvrFiles);
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

        const collectionFile = await soda.createCollection('proj_files');
        const collectionFvrFiles = await soda.createCollection('favr_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionPrecfs = await soda.createCollection('precfs');

        const { arr } = req.body;

        var files = await getMultipleFileArr(arr, collectionFile);
        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

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
            if (percent_used > 100) percent_left = 100;
            percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;
            await deleteObject(file.url, req.token.bucket);
        }));

        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);

        if (arr && arr.length > 0) {
            await deleteMultipleFileArr(arr, collectionFile);
            await deleteMultipleFilesArrRect(arr, collectionPrecfs);
            await deleteMultipleFileArr(arr, collectionFvrFiles);
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

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionCat = await soda.createCollection('proj_cats');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSets = await soda.createCollection('sets');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionProjs = await soda.createCollection('projs');

        const { arr, catId } = req.body;

        let fileSize = 5;

        let set = await getSetting(collectionSets);
        let files = await findMultipleFilesArrId(arr, collectionFiles);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        if (files && files.length > 0) {
            await Promise.all(files.map(async file => {

                var fileData = {
                    name: `${file.name}-copy`, type: file.type, size: file.size, postedby: file.postedby, date: new Date(),
                    org: file.org, description: file.description, url: '', bucketName: req.token.bucket, version: 0,
                    active: file.active, versioning: file.versioning, category: catId, versionId: '', compare: file.compare,
                    pId: file.pId, uploadable: file.uploadable, mimeType: file.mimeType, created: Date.now(), isVersion: false
                };

                var f = await findFileByName(fileData.name, req.token.org, fileData.category, collectionFiles);
                var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
                var project = await getProjectById(fileData.pId, collectionProjs);
                var PM = await isProjectManager(fileData.pId, fileData.postedby, collectionProjs);

                if (!f && fileData.size < fileSize && organ.available > fileData.size) {

                    var key = await createFile(fileData, collectionFiles);

                    const fl = file.url;
                    const type = fl.split('.').slice(-1);
                    const fileName = `${fileData.name}.${type}`;
                    fileData.url = generateFileName(fileName, fileData.org, catId, key, fileData.pId);

                    var date = parseDate();
                    var title = `${PM ? 'Project Manager' : 'Participant'} has copied a new file in project ${project.name}`, message = `A new file ${fileData.name} has been copied to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;

                    await generateNotification(file.org, catId, file.postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, fileData.type, fileData.pId, req.token._id, collectionNotifs, collectionCat);
                    const url = await copyObject(file.url, fileData.url, req.token.bucket);

                    await updateVersionId(key, fileData.url, collectionFiles);

                    if (url) await updateOrganizationStorage(file.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
                    else await deleteFile(key, collectionFiles)

                    const vers = await findMultipleFilesArrIdVer(file._id, collectionFiles);

                    if (vers && vers.length > 0) await Promise.all(vers.map(async version => {

                        var verData = {
                            name: `${version.name}-copy`, type: version.type, size: version.size, mimeType: version.mimeType, created: Date.now(),
                            postedby: version.postedby, org: version.org, active: version.active, category: catId, isVersion: true, version: Number(version.version),
                            versionId: key, description: version.description, url: '', pId: version.pId, bucketName: req.token.bucket, date: new Date()
                        };

                        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

                        if (verData.size < fileSize && organ.available > verData.size) {

                            var keyV = await createFile(verData, collectionFiles);
                            const fl = file.url;
                            const type = fl.split('.').slice(-1);
                            const fileName = `${verData.name}.${type}`;
                            verData.url = generateFileName(fileName, verData.org, catId, keyV, verData.pId);

                            await updateUrl(keyV, verData.url, collectionFiles);

                            var date = parseDate();
                            var title = `${PM ? 'Project Manager' : 'Participant'} has copied a new file in project ${project.name}`, message = `A new file ${fileData.name} has been copied to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;

                            await generateNotification(file.org, catId, file.postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, file.type, file.pId, req.token._id, collectionNotifs, collectionCat);

                            const url = await copyObject(version.url, verData.url, req.token.bucket);

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

router.post('/updateFileCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { cat, _id } = req.body;


        const collectionFile = await soda.createCollection('proj_files');
        const collectionCats = await soda.createCollection('proj_cats');


        let fileDetails = await getFile(_id, collectionFile, collectionCats);

        if (!fileDetails) throw new Error('File with this key does not exist');

        let file = await findFileByNameC(fileDetails.name, req.token.org, cat, collectionFile, collectionCats);

        if (file) return res.json({ error: 'Project File', mainFile: fileDetails, file: file, type: 0 })

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

router.post('/uploadType', JWT, async (req, res, next) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionOrg = await soda.createCollection('orgs');
        const collectionFile = await soda.createCollection('proj_files');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionRecfs = await soda.createCollection('precfs');
        const collectionCat = await soda.createCollection('proj_cats');


        let _id = req.body.mainFile;
        let tId = req.body.file;

        let newFile = await getFile(tId, collectionFile, collectionCat);
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

        var org = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        var fileList = await getAllFileDelVer(vId, collectionFile);

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

router.post('/copyFile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('proj_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSets = await soda.createCollection('sets');
        const collectionCat = await soda.createCollection('proj_cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionProjs = await soda.createCollection('projs');

        const { _id, catId } = req.body;

        let fileSize = 5;
        const set = await getSetting(collectionSets);

        let file = await getFileId(_id, collectionFiles);

        if (!file) throw new Error('File not found');

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        var fileData = {
            name: `${file.name}-copy`, type: file.type, size: file.size, postedby: file.postedby, date: new Date(),
            org: file.org, description: file.description, url: '', bucketName: req.token.bucket, version: 0,
            active: file.active, versioning: file.versioning, category: catId, versionId: '', compare: file.compare,
            pId: file.pId, uploadable: file.uploadable, mimeType: file.mimeType, created: Date.now(), isVersion: false
        };

        let f = await findFileByName(fileData.name, req.token.org, fileData.category, collectionFiles);
        var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        let project = await getProjectById(fileData.pId, collectionProjs);
        let PM = await isProjectManager(fileData.pId, fileData.postedby, collectionProjs);

        if (!f && fileData.size < fileSize && organ.available > fileData.size) {

            var key = await createFile(fileData, collectionFiles);
            const fl = file.url;
            const type = fl.split('.').slice(-1);
            const fileName = `${fileData.name}.${type}`;
            fileData.url = generateFileName(fileName, fileData.org, catId, key, fileData.pId);

            var date = parseDate();
            var title = `${PM ? 'Project Manager' : 'Participant'} has copied a new file in project ${project.name}`, message = `A new file ${fileData.name} has been copied to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;

            await generateNotification(file.org, catId, file.postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, fileData.type, fileData.pId, req.token._id, collectionNotifs, collectionCat);
            const url = await copyObject(file.url, fileData.url, req.token.bucket);

            await updateVersionId(key, fileData.url, collectionFiles);

            if (url) await updateOrganizationStorage(file.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
            else await deleteFile(key, collectionFiles)

            const vers = await findMultipleFilesArrIdVer(file._id, collectionFiles);
            if (vers && vers.length > 0) await Promise.all(vers.map(async version => {

                var verData = {
                    name: `${version.name}-copy`, type: version.type, size: version.size, mimeType: version.mimeType, created: Date.now(),
                    postedby: version.postedby, org: version.org, active: version.active, category: catId, isVersion: true, version: Number(version.version),
                    versionId: key, description: version.description, url: '', pId: version.pId, bucketName: req.token.bucket, date: new Date()
                };

                var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

                if (verData.size < fileSize && organ.available > verData.size) {

                    var keyV = await createFile(verData, collectionFiles);
                    const fl = file.url;
                    const type = fl.split('.').slice(-1);
                    const fileName = `${verData.name}.${type}`;
                    verData.url = generateFileName(fileName, verData.org, catId, keyV, verData.pId);

                    await updateUrl(keyV, verData.url, collectionFiles);

                    var date = parseDate();
                    var title = `${PM ? 'Project Manager' : 'Participant'} has copied a new file in project ${project.name}`, message = `A new file ${fileData.name} has been copied to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;
                    await generateNotification(file.org, catId, file.postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, file.type, file.pId, req.token._id, collectionNotifs, collectionCat);
                    const url = await copyObject(version.url, verData.url, req.token.bucket);
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