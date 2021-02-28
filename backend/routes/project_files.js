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
    getAllFileVersionSkipped,
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
    updateValue,
    getAllFileDelVer,
    getLatestVer,
    findMultipleFilesArrId,
    findMultipleFilesArrIdVer,
    getAllFileQueryCountP,
    getAllFileLimitP,
    getAllFileQueryLimitP,
    getAllFileCountP,
    getAllFileQueryLimitSP,
    getAllFileLimitSP,
    updateDetails
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
    getAllProjectsOfUser
} = require('../schemas/projects');

const {
    getSetting
} = require('../schemas/setting');

const {
    getCRole
} = require('../schemas/projectRoles');

const {
    getUserByRoles,
    getAssignedUserCats
} = require('../schemas/projectAssigned');

const {
    createNotification,
    fileChanged,
    updatedChanged
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
    getProjectManagerUserCats,
    getAllCatsC,
    getAllCatsQueryC,
    getCatById
} = require('../schemas/projectCategory');

const {
    isFavorite, updateFvrFileD, updateFvrName, updateFvrFileP, updateMultipleFilesArrFvr
} = require('../schemas/favrFiles');

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFiles, collectionProjs, collectionOrg, collectionSets, collectionNotifs, collectionRoles, collectionAss] = [
            await soda.createCollection('proj_files'), await soda.createCollection('projs'), await soda.createCollection('orgs'),
            await soda.createCollection('sets'), await soda.createCollection('notifs'), await soda.createCollection('proj_roles'),
            await soda.createCollection('proj_assigned')
        ];

        const {
            name, size, type, postedby, org, category, active, versioning,
            compare, pId, uploadable, description, mime, fName, latest
        } = req.body;

        var dataSize = size / (1024 * 1024 * 1024);
        var fileSize = 5;

        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = findFileByName(name, org, category, collectionFiles);
        const p3 = getProjectById(pId, collectionProjs);
        const p4 = isProjectManager(org, postedby, collectionProjs);
        const p5 = getSetting(collectionSets);
        var [organ, file, project, PM, set] = [await p1, await p2, await p3, await p4, await p5];

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
        if (organ.available < dataSize) throw new Error('Upload limit exceeded');
        if (dataSize > fileSize) throw new Error('File exceeds size limit');
        if (file) throw new Error('File with same name already exists within the organization');

        var fileData = {
            name: name, type: type, size: dataSize, postedby: postedby, org: org, description: description, url: '',
            active: active, versioning: versioning, category: category, versionId: '', compare: compare, pId: pId,
            uploadable: uploadable, mimeType: mime, bucketName: req.token.bucket, created: Date.now(), date: new Date(),
            isVersion: false, version: 0, latest: latest
        };

        var p6 = createFile(fileData, collectionFiles);
        var p7 = updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
        const [key, upt] = [await p6, await p7];

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key, pId);

        await updateVersionId(key, fileData.url, collectionFiles);

        var date = parseDate();
        var title = `${PM ? 'Project Manager' : 'Participant'} has added a new file in project ${project.name}`, message = `A new file ${fileData.name} has been added to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;

        await generateNotification(org, category, postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, type, pId, collectionNotifs, collectionRoles, collectionAss);

        const url = await putPresignedUrl(key, fileData.url, req.token.bucket);


        if (url) res.status(200).json({ file: fileData, url: url });
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

        const [collectionFiles, collectionProjs, collectionOrg, collectionSets, collectionNotifs, collectionRoles, collectionAss] = [
            await soda.createCollection('proj_files'), await soda.createCollection('projs'), await soda.createCollection('orgs'),
            await soda.createCollection('sets'), await soda.createCollection('notifs'), await soda.createCollection('proj_roles'),
            await soda.createCollection('proj_assigned')
        ];

        const { _id, version, name, active, org, size, type, pId, postedby, category, description, mime, fName } = req.body;
        var dataSize = size / (1024 * 1024 * 1024);
        var fileSize = 5;

        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = findFileByNameVer(name, org, category, version, collectionFiles);
        const p3 = getProjectById(pId, collectionProjs);
        const p4 = isProjectManager(org, postedby, collectionProjs);
        const p5 = getSetting(collectionSets);
        var [organ, fileCheck, project, PM, set] = [await p1, await p2, await p3, await p4, await p5];

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

        var p6 = createFile(fileData, collectionFiles);
        var p7 = updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
        [key, upt] = [await p6, await p7];

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key, pId);

        await updateUrl(key, fileData.url, collectionFiles);
        var date = parseDate();
        var title = `${PM ? 'Project Manager' : 'Participant'} has added a new file in project ${project.name}`, message = `A new file ${fileData.name} has been added to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;
        await generateNotification(org, category, postedby, title, message, 1, PM ? 1 : 2, _id, project, PM, date, type, pId, collectionNotifs, collectionRoles, collectionAss);
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

        const [collectionFiles, collectionProjs, collectionOrg, collectionSets, collectionNotifs, collectionRoles, collectionAss, collectionPrecfs, collectionFvrFiles] = [
            await soda.createCollection('proj_files'), await soda.createCollection('projs'), await soda.createCollection('orgs'),
            await soda.createCollection('sets'), await soda.createCollection('notifs'), await soda.createCollection('proj_roles'),
            await soda.createCollection('proj_assigned'), await soda.createCollection('precfs'), await soda.createCollection('favr_files')
        ];

        const { _id, isVersion, version, name, active, org, size, type, postedby, category, pId, description, mime, fName } = req.body;
        var dataSize = size / (1024 * 1024 * 1024);
        var fileSize = 5;

        const p1 = findOrganizationByIdUpt(org, collectionOrg);
        const p2 = getProjectById(pId, collectionProjs);
        const p3 = isProjectManager(org, postedby, collectionProjs);
        const p4 = getSetting(collectionSets);
        const p5 = getLatestVer(_id, collectionFiles);
        var [organ, project, PM, set, file] = [await p1, await p2, await p3, await p4, await p5];

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        var fileData = {
            name: name, type: type, mimeType: mime, size: dataSize, postedby: postedby,
            org: org, active: active, category: category, versionId: file.versionId, pId: pId,
            description: description, url: '', isVersion: isVersion, version: Number(version),
            bucketName: req.token.bucket, created: Date.now(), date: new Date(),
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

        [await updateRectFileD(file._id, collectionPrecfs), await updateFvrFileD(file._id, collectionFvrFiles)];
        await updatePackageDetails(org, uploaded_data, available, percent_left, percent_used, collectionOrg);

        var organ = await findOrganizationByIdUpt(org, collectionOrg);
        var p6 = createFile(fileData, collectionFiles);
        var p7 = updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
        [key, upt] = [await p6, await p7];

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        fileData.url = generateFileName(fileName, org, category, key, pId);

        if (Number(version) === 0) await updateVersionId(key, fileData.url, collectionFiles)
        else await updateUrl(key, fileData.url, collectionFiles);

        var date = parseDate();
        var title = `${PM ? 'Project Manager' : 'Participant'} has added a new file in project ${project.name}`, message = `A new file ${fileData.name} has been added to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;
        await generateNotification(org, category, postedby, title, message, 1, PM ? 1 : 2, Number(version) === 0 ? key : file.versionId, project, PM, date, type, pId, collectionNotifs, collectionRoles, collectionAss);
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
    return `FileO/organization/${org}/projects/${pId}/category/${catId}/files/${_id}/${fileName}`;
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

async function generateNotification(org, cat, pBy, title, message, t, uT, fileId, project, PM, dt, mime, pId, collectionNotifs, collectionRoles, collectionAss) {
    var users = await getCRole(org, cat, collectionRoles);
    if (!users) users = [];
    var userIds = await getUserByRoles(org, users, collectionAss);
    if (!PM) userIds.push(project.managerId);
    userIds && userIds.length > 0 && await Promise.all(userIds.map(async id => {
        var data = {
            postedBy: pBy, title: title, message: message,
            recievedBy: id, type: t, userType: uT, org: org,
            id: fileId, date: dt, mimeType: mime, pId: pId,
            date: new Date(), created: Date.now()
        };
        await createNotification(data, collectionNotifs);
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

        const [collectionFiles, collectionProjCat, collectionPrecfs, collectionUsers, collectionFvrFiles, collectionFileV, collectionNotifs] = [
            await soda.createCollection('proj_files'), await soda.createCollection('proj_cats'), await soda.createCollection('precfs'),
            await soda.createCollection('users'), await soda.createCollection('favr_files'), await soda.createCollection('file_views'),
            await soda.createCollection('notifs')
        ];

        const { _id, pId, pCat } = req.query;

        await updatedChanged(_id, req.token._id, collectionNotifs);

        let cat;
        if (pCat) {
            cat = getCatById(pCat, collectionProjCat);
        }

        const p0 = findRecFileById(_id, 0, collectionPrecfs);
        const p1 = getFile(_id, collectionFiles, collectionProjCat);
        const p2 = getAllCats(pId, cat && cat.parentCat ? cat.parentCat : '', collectionProjCat);
        const p3 = getAllFileVersion(_id, collectionFiles, collectionUsers);
        const p4 = isFavorite(_id, req.token._id, collectionFvrFiles);
        var [fl, file, catList, versions, isF] = [await p0, await p1, await p2, await p3, await p4];

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

        const [collectionFiles, collectionFileV] = [
            await soda.createCollection('proj_files'), await soda.createCollection('file_views')
        ];

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

        const [collectionFiles, collectionProjCat, collectionPrecfs, collectionUsers, collectionNotifs] = [
            await soda.createCollection('proj_files'), await soda.createCollection('proj_cats'), await soda.createCollection('precfs'),
            await soda.createCollection('users'), await soda.createCollection('notifs')
        ];

        const { _id, pId, pCat } = req.query;

        let cat;
        if (pCat) {
            cat = getCatById(pCat, collectionProjCat);
        }

        await updatedChanged(_id, req.token._id, collectionNotifs);
        const p0 = findRecFileById(_id, 0, collectionPrecfs);
        const p1 = getFile(_id, collectionFiles, collectionProjCat);
        const p2 = getAllCats(pId, cat && cat.parentCat ? cat.parentCat : '', collectionProjCat);
        const p3 = getAllFileVersion(_id, collectionFiles, collectionUsers);
        var [fl, file, catList, versions] = [await p0, await p1, await p2, await p3];

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

        const [collectionFiles, collectionCats] = [await soda.createCollection('proj_files'), await soda.createCollection('proj_cats')];

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

        const [collectionFiles, collectionCats] = [await soda.createCollection('proj_files'), await soda.createCollection('proj_cats')];

        const { pId, cat, type, auth, string } = req.query;

        let fileList, catList;

        if (string) {
            [fileList, catList] = [await getAllFileQueryLimitSP(pId, string, cat, type, auth, collectionFiles), await getAllCatsQueryC(cat, string, collectionCats)];
        }
        else {
            [fileList, catList] = [await getAllFileLimitSP(pId, cat, type, auth, collectionFiles), await getAllCatsC(cat, collectionCats)];
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

        const [collectionFiles, collectionCats] = [await soda.createCollection('proj_files'), await soda.createCollection('proj_cats')];

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

        const [collectionFiles, collectionCats] = [await soda.createCollection('proj_files'), await soda.createCollection('proj_cats')];

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

        const [collectionFiles, collectionCats] = [await soda.createCollection('proj_files'), await soda.createCollection('proj_cats')];

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

        const [collectionFiles, collectionPCats, collectionFvrFiles, collectionPrecfs, collectionNotifs] = [
            await soda.createCollection('proj_files'), await soda.createCollection('proj_cats'),
            await soda.createCollection('favr_files'), await soda.createCollection('precfs'), await soda.createCollection('notifs')
        ];

        const {  _id, name, description, cat, active, versioning, compare, uploadable, latest } = req.body;

        let fileDetails = await getFile(_id, collectionFiles, collectionPCats);

        if (!fileDetails) throw new Error('File with this key does not exist');

        let file;

        if (fileDetails.name !== name) file = await findFileByName(name, req.token.org, cat, collectionFiles);

        if (file) throw new Error('File with this name already exists');

        let upt = await updateDetails(_id, name, description, cat, active, versioning, compare, uploadable, latest, collectionFiles);

        if (!upt) throw new Error('File Details not updated');

        if (fileDetails.name !== name) await updateFvrName(_id, name, collectionFvrFiles);

        if (fileDetails.category !== cat) [await updateRectFileP(_id, collectionPrecfs), await updateFvrFileP(_id, collectionFvrFiles), await fileChanged(_id, collectionNotifs)];

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

        const [collectionFiles, collectionProjCat, collectionUsers, collectionFvrFiles, collectionNotifs, collectionPrecfs] = [
            await soda.createCollection('proj_files'), await soda.createCollection('proj_cats'), await soda.createCollection('users'),
            await soda.createCollection('favr_files'), await soda.createCollection('notifs'), await soda.createCollection('precfs')
        ];

        const { versioning, compare, active, uploadable, latest, _id, pId } = req.body;

        await updatePerm(_id, active, versioning, compare, uploadable, latest, collectionFiles);
        const p1 = getFile(_id, collectionFiles, collectionProjCat);
        const p2 = getAllCats(pId, collectionProjCat);
        const p3 = getAllFileVersion(_id, collectionFiles, collectionUsers);

        const [file, catList, versions] = [await p1, await p2, await p3];
        if (!active) [await updateRectFileP(_id, collectionPrecfs), await updateFvrFileP(_id, collectionFvrFiles), await fileChanged(_id, collectionNotifs)];

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

        const [collectionFiles, collectionOrg, collectionFvrFiles, collectionPrecfs] = [
            await soda.createCollection('proj_files'), await soda.createCollection('orgs'),
            await soda.createCollection('favr_files'), await soda.createCollection('precfs')
        ];

        const { _id } = req.params;
        var file = await findPFileById(_id, collectionFiles);
        if (!file) throw new Error('File not found');
        var p1 = findOrganizationByIdUpt(file.org, collectionOrg);
        var p2 = getAllFileDelVer(file.versionId, collectionFiles);
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
                await deleteFile(file._id, collectionFiles)
            }));

        [await updateRectFileD(_id, collectionPrecfs), await updateFvrFileD(_id, collectionFvrFiles)];
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

        const [collectionFile, collectionOrg, collectionPrecfs, collectionFvrFiles] = [
            await soda.createCollection('proj_files'),  await soda.createCollection('orgs'),
            await soda.createCollection('precfs'), await soda.createCollection('favr_files')
        ];

        const { _id,  orgId, ver, versionId  } = req.body;
        await resetVersion(versionId, ver, collectionFile);

        var p4 = findPFileById(_id, collectionFile);
        var p5 = findOrganizationByIdUpt(orgId, collectionOrg);
        var [file, org] = [await p4, await p5];

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
            [await updateRectFileD(_id, collectionPrecfs), await updateFvrFileD(_id, collectionFvrFiles)];
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

        const [collectionFile, collectionFvrFiles, collectionPrecfs] = [await soda.createCollection('proj_files'), await soda.createCollection('favr_files'), await soda.createCollection('precfs')];

        const { value, arr } = req.body;
        var lIds = await getAllNamesByArr(arr, value, collectionFile);
        if (lIds && lIds.length > 0)
            [await updateFilesCat(lIds, value, collectionFile), await updateMultipleFilesArrRect(lIds, collectionPrecfs), await updateMultipleFilesArrFvr(lIds, collectionFvrFiles)];

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

        const [collectionFile, collectionOrg, collectionPrecfs, collectionFvrFiles] = [
            await soda.createCollection('proj_files'), await soda.createCollection('orgs'),
            await soda.createCollection('precfs'), await soda.createCollection('favr_files'),
        ];

        const { arr } = req.body;
        var p1 = getMultipleFileArr(arr, collectionFile);
        var p2 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        var [files, organ] = [await p1, await p2];

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

        arr && [
            await deleteMultipleFileArr(arr, collectionFile), await deleteMultipleFilesArrRect(arr, collectionPrecfs),
            await deleteMultipleFileArr(arr, collectionFvrFiles)
        ];

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

        const [collectionOrg, collectionFiles, collectionSets, collectionRoles, collectionNotifs, collectionProjs, collectionAss] = [
            await soda.createCollection('orgs'), await soda.createCollection('proj_files'),
            await soda.createCollection('sets'), await soda.createCollection('proj_roles'),
            await soda.createCollection('notifs'), await soda.createCollection('projs'),
            await soda.createCollection('proj_assigned')
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
                    name: `${file.name}-copy`, type: file.type, size: file.size, postedby: file.postedby, date: new Date(),
                    org: file.org, description: file.description, url: '', bucketName: req.token.bucket, version: 0,
                    active: file.active, versioning: file.versioning, category: catId, versionId: '', compare: file.compare,
                    pId: file.pId, uploadable: file.uploadable, mimeType: file.mimeType, created: Date.now(), isVersion: false
                };


                var p3 = findFileByName(fileData.name, req.token.org, fileData.category, collectionFiles);
                var p4 = findOrganizationByIdUpt(req.token.org, collectionOrg);
                const p5 = getProjectById(fileData.pId, collectionProjs);
                const p6 = isProjectManager(fileData.org, fileData.postedby, collectionProjs);

                const [f, organ, project, PM] = [await p3, await p4, await p5, await p6];

                if (!f && fileData.size < fileSize && organ.available > fileData.size) {

                    var key = await createFile(fileData, collectionFiles);

                    const fl = file.url;
                    const type = fl.split('.').slice(-1);
                    const fileName = `${uuidv4()}${fileData.name.toLowerCase().split(' ').join('-')}.${type}`;
                    fileData.url = generateFileName(fileName, fileData.org, catId, key, fileData.pId);

                    var date = parseDate();
                    var title = `${PM ? 'Project Manager' : 'Participant'} has copied a new file in project ${project.name}`, message = `A new file ${fileData.name} has been copied to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;

                    await generateNotification(file.org, catId, file.postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, fileData.type, fileData.pId, collectionNotifs, collectionRoles, collectionAss);
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
                            const fileName = `${uuidv4()}${verData.name.toLowerCase().split(' ').join('-')}.${type}`;
                            verData.url = generateFileName(fileName, verData.org, catId, keyV, verData.pId);

                            await updateUrl(keyV, verData.url, collectionFiles);

                            var date = parseDate();
                            var title = `${PM ? 'Project Manager' : 'Participant'} has copied a new file in project ${project.name}`, message = `A new file ${fileData.name} has been copied to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;
                            await generateNotification(file.org, catId, file.postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, file.type, file.pId, collectionNotifs, collectionRoles, collectionAss);
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

router.get('/getFileCountP', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFiles, collectionProj, collectionAss, collectionPCat, collectionRoles] = [
            await soda.createCollection('proj_files'), await soda.createCollection('projs'),
            await soda.createCollection('proj_assigned'), await soda.createCollection('proj_cats'),
            await soda.createCollection('proj_roles')
        ];

        const { _id } = req.token;
        const { type, auth } = req.query;

        let assCats, count;

        if (auth === 'true') {
            let pIds = await getAllProjectsOfUser(_id, collectionProj);
            assCats = await getProjectManagerUserCats(pIds, collectionPCat);
            count = await getAllFileCountP(assCats, type, collectionFiles);
            return res.json({ fileCount: count });
        } else {
            assCats = await getAssignedUserCats(_id, collectionAss, collectionRoles);
            count = await getAllFileCountP(assCats, type, collectionFiles);
            return res.json({ fileCount: count });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getFilesP', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFiles, collectionProj, collectionAss, collectionPCat, collectionRoles] = [
            await soda.createCollection('proj_files'), await soda.createCollection('projs'),
            await soda.createCollection('proj_assigned'), await soda.createCollection('proj_cats'),
            await soda.createCollection('proj_roles')
        ];

        const { _id } = req.token;
        const { limit, type, auth } = req.query;

        let assCats, fileList;

        if (auth === 'true') {
            let pIds = await getAllProjectsOfUser(_id, collectionProj);
            assCats = await getProjectManagerUserCats(pIds, collectionPCat);
            fileList = await getAllFileLimitP(limit, assCats, type, collectionFiles, collectionPCat, collectionProj);
            res.json({ files: fileList });
        } else {
            assCats = await getAssignedUserCats(_id, collectionAss, collectionRoles);
            fileList = await getAllFileLimitP(limit, assCats, type, collectionFiles, collectionPCat, collectionProj);
            res.json({ files: fileList });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFileCountP', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFiles, collectionProj, collectionAss, collectionPCat, collectionRoles] = [
            await soda.createCollection('proj_files'), await soda.createCollection('projs'),
            await soda.createCollection('proj_assigned'), await soda.createCollection('proj_cats'),
            await soda.createCollection('proj_roles')
        ];

        const { _id } = req.token;
        const { string, type, auth } = req.query;

        let assCats, count;

        if (auth === 'true') {
            let pIds = await getAllProjectsOfUser(_id, collectionProj);
            assCats = await getProjectManagerUserCats(pIds, collectionPCat);
            count = await getAllFileQueryCountP(string, assCats, type, collectionFiles);
            return res.json({ fileCount: count });
        } else {
            assCats = await getAssignedUserCats(_id, collectionAss, collectionRoles);
            count = await getAllFileQueryCountP(string, assCats, type, collectionFiles);
            return res.json({ fileCount: count });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchFilesP', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFiles, collectionProj, collectionAss, collectionPCat, collectionRoles] = [
            await soda.createCollection('proj_files'), await soda.createCollection('projs'),
            await soda.createCollection('proj_assigned'), await soda.createCollection('proj_cats'),
            await soda.createCollection('proj_roles')
        ];

        const { _id } = req.token;
        const { limit, string, type, auth } = req.query;

        let assCats, fileList;

        if (auth === 'true') {
            let pIds = await getAllProjectsOfUser(_id, collectionProj);
            assCats = await getProjectManagerUserCats(pIds, collectionPCat);
            fileList = await getAllFileQueryLimitP(limit, string, assCats, type, collectionFiles, collectionPCat, collectionProj);
            res.json({ files: fileList })
        } else {
            assCats = await getAssignedUserCats(_id, collectionAss, collectionRoles);
            fileList = await getAllFileQueryLimitP(limit, string, assCats, type, collectionFiles, collectionPCat, collectionProj);
            res.json({ files: fileList });
        }
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


module.exports = router;