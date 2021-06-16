const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const JWT = require('../middlewares/jwtAuth');
const { putPresignedUrl, deleteObject } = require('../middlewares/oci-sdk');
const UserCat = require('../schemas/userCategory');
const ProjF = require('../schemas/projectFile');
const Proj = require('../schemas/projects');
const UserFile = require('../schemas/userFile');
const Session = require('../schemas/session');
const RectF = require('../schemas/recentFiles');
const RectPF = require('../schemas/recentProjectFiles');
const RectUF = require('../schemas/recentUserFile');
const Notif = require('../schemas/notification');
const ClientF = require('../schemas/clientFile');
const Note = require('../schemas/note');
const SharedF = require('../schemas/sharedFile');
const Recs = require('../schemas/recordings');
const ProjA = require('../schemas/projectAssigned');
const ClientC = require('../schemas/clientsCategory');
const SharedN = require('../schemas/sharedNote');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    findOrganizationByIdUpt
} = require('../schemas/organization');

const {
    getProfile,
    getAllUserCount,
    getAllUserLimit,
    getAllUserQueryCount,
    findUserByEmail,
    getAllUserQueryLimit,
    updateValue,
    findUserById,
    deleteUser,
} = require('../schemas/user');

const {
    getAllProjectsOfUser,
} = require('../schemas/projects');

const {
    getMultipleFilesPid
} = require('../schemas/projectFile');

const {
    updatePackageDetails
} = require('../schemas/organization');

const {
    getSetting
} = require('../schemas/setting');
const { removeEmpReq } = require('../schemas/empReq');
const { deletePlanUser } = require('../schemas/plans');
const { deleteDPlanUser } = require('../schemas/dailyPlan');
const { removeDescUser } = require('../schemas/description');

router.get('/getEmployee', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');

        const { _id } = req.query;
        let user = await getProfile(_id, collectionUser, collectionOrg);

        if (!user) throw new Error('Could not find employee');

        res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.meesage });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getEmployeeCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');

        const { _id } = req.query;

        let count = await getAllUserCount(_id, collectionUser);

        return res.json({ userCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.meesage });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getEmployees', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const { offset, _id } = req.query;
        let userList = await getAllUserLimit(offset, _id, collectionUser);
        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.meesage });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchEmployeeCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const { string, _id, type } = req.query;
        let count = await getAllUserQueryCount(string, _id, type, collectionUser);

        return res.json({ userCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.meesage });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchEmployees', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');

        const { offset, string, _id, type } = req.query;
        let userList = await getAllUserQueryLimit(offset, string, _id, type, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.meesage });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateProfile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionEmpReq = await soda.createCollection('emp_reqs');

        const { _id, field, value } = req.body;

        if (field === 'storage') await removeEmpReq(_id, collectionEmpReq);

        if (field === 'email') {
            let userE = await findUserByEmail(value, collectionUser);
            if (userE) {
                let userTemp = await getProfile(_id, collectionUser, collectionOrg);
                res.json({ user: userTemp });
            }
        }

        let user = await updateValue(_id, field, value, collectionUser, collectionOrg);

        if (!user) throw new Error('User profile not found');

        res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteUser/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUserFile = await soda.createCollection('user_files');
        const collectionProjects = await soda.createCollection('projs');
        const collectionRecs = await soda.createCollection('recrs');
        const collectionClient = await soda.createCollection('client_files');
        const collectionUserCat = await soda.createCollection('user_cats');
        const collectionProjF = await soda.createCollection('proj_files');
        const collectionSes = await soda.createCollection('sessions');
        const collectionRecfs = await soda.createCollection('recfs');
        const collectionsURecfs = await soda.createCollection('urecfs');
        const collectionPRecfs = await soda.createCollection('precfs');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionNote = await soda.createCollection('notes');
        const collectionSharedF = await soda.createCollection('shared_files');
        const collectionClientC = await soda.createCollection('client_cats');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collectionProjA = await soda.createCollection('proj_assigned');
        const collectionEmpReq = await soda.createCollection('emp_reqs');
        const collectionPlan = await soda.createCollection('plans');
        const collectionDPlan = await soda.createCollection('daily_plans');
        const collectionDesc = await soda.createCollection('note_desc');

        const { _id } = req.params;

        let user = await findUserById(_id, collectionUser);
        let ufile = await UserFile.deleteFilesUser(_id, collectionUserFile);
        let pIds = await getAllProjectsOfUser(_id, collectionProjects);
        let recs = await Recs.getAllRecFilesOfUser(_id, collectionRecs);
        let clients = await ClientF.getAllClientFilesOfUser(_id, collectionClient);

        if (!user) throw new Error('User not found')

        let mydate = new Date();
        let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
        let str = mydate.getDate() + '-' + month + '-' + mydate.getFullYear();
        let sql = `UPDATE user_billing SET end_date='${str}' WHERE userId='${_id}'`;
        await connection.execute(sql);

        let files = await getMultipleFilesPid(pIds, collectionProjF);
        let organ = await findOrganizationByIdUpt(user.current_employer, collectionOrg);

        var combined_plan = Number(organ.combined_plan);
        var uploaded_data = organ && organ.data_uploaded ? Number(organ.data_uploaded) : 0;
        var available = Number(organ.available);
        var percent_left, percent_used;

        if (user.image) await deleteObject(user.image, req.token.bucket, () => { });

        if (ufile && ufile.length > 0) await Promise.all(ufile.map(async file => {
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

        if (recs && recs.length > 0) await Promise.all(recs.map(async file => {
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

        if (clients && clients.length > 0) await Promise.all(clients.map(async file => {
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

        if (files && files.length > 0) await Promise.all(files.map(async file => {
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

        await updatePackageDetails(organ._id, uploaded_data, available, percent_left, percent_used, collectionOrg);

        await UserCat.deleteAllByUser(_id, collectionUserCat);
        await ProjF.deleteMultipleFilesPid(pIds, collectionProjF);
        await Proj.deleteAllUserProjects(_id, collectionProjects);
        await UserFile.deleteMultipleFiles(_id, collectionUserFile);
        await Session.deleteSessionByUser(_id, collectionSes);
        await RectF.deleteFileUser(_id, collectionRecfs);
        await RectUF.deleteFileUser(_id, collectionsURecfs);
        await RectPF.deleteFileUser(_id, collectionPRecfs);
        await Notif.deleteFileUser(_id, collectionNotifs);
        await SharedF.deleteByUser(_id, collectionSharedF);
        await ClientF.deleteFileUser(_id, collectionClient);
        await Note.deleteFileUser(_id, collectionNote);
        await SharedN.deleteByUser(_id, collectionSharedN);
        await Recs.deleteByUser(_id, collectionRecs);
        await ProjA.deleteFileUser(_id, collectionProjA);
        await ClientC.deleteFileUser(_id, collectionClientC);
        await removeEmpReq(_id, collectionEmpReq);
        await deletePlanUser(_id, collectionPlan);
        await deleteUser(_id, collectionUser);
        await deleteDPlanUser(_id, collectionDPlan);
        await removeDescUser(_id, collectionDesc);

        res.json({ success: 'User deleted' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/imageUrl/sign', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { id, org, image, mimeType, fileSize } = req.body;
        let size = 1;

        const collection = await soda.createCollection('sets');
        const set = await getSetting(collection);

        if (set && set.maxImageSize) size = Number(set.maxImageSize);
        if (!validateMime(mimeType, size, fileSize)) throw new Error('Image type not supported');
        const fileName = `${image.toLowerCase().split(' ').join('-')}`;
        let key = generateFileName(fileName, org, id);
        let url = await putPresignedUrl(id, key, req.token.bucket);

        if (url) res.json({ url: url, key: key });
        else throw new Error('Could not upload user image');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/uploadImage', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { _id, key } = req.body;

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');

        let userT = await findUserById(_id, collectionUser);
        if (!userT) throw new Error('User profile not found');

        if (userT.image) await deleteObject(userT.image, req.token.bucket);

        let user = await updateValue(_id, 'image', key, collectionUser, collectionOrg);

        if (!user) throw new Error('Could not find employee');
        res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function validateMime(type, size, expectedSize) {
    return (type === "image/png" || type === "image/jpg" || type === "image/jpeg" || type === 'image/x-png' || type === 'image/gif') && (size <= expectedSize) ? true : false;
}

function generateFileName(fileName, id, _id) {
    return `FileO/organization/${id}/images/user/${_id}/${uuidv4()}/${fileName}`;
}

module.exports = router;