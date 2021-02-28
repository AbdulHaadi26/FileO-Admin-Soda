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
    getAllRoles
} = require('../schemas/role');

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
    getUserByRoles
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
const { userRolesChanged } = require('../schemas/notification');
const { deletePlanUser } = require('../schemas/plans');

router.get('/getEmployee', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionRoles, collectionCats] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
        ];

        const { _id, org } = req.query;
        const p1 = getProfile(_id, collectionUser, collectionOrg, collectionRoles, collectionCats);
        const p2 = getAllRoles(org, collectionRoles);
        var [user, roleList] = [await p1, await p2];
        if (!user) throw new Error('Could not find employee');

        if (!roleList) roleList = [];
        res.json({ user: user, roleList: roleList });
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
        if (count) return res.json({ userCount: count });

        res.json({ userCount: 0 });
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

        const [collectionUser, collectionOrg, collectionRoles, collectionCats, collectionEmpReq] = [
            await soda.createCollection('users'), await soda.createCollection('orgs'), await soda.createCollection('roles'),
            await soda.createCollection('cats'), await soda.createCollection('emp_reqs')
        ];

        const { _id, field, value } = req.body;

        if (field === 'storage') await removeEmpReq(_id, collectionEmpReq);

        if (field === 'email') {
            let userE = await findUserByEmail(value, collectionUser);
            if (userE) {
                let userTemp = await getProfile(_id, collectionUser, collectionOrg, collectionRoles, collectionCats);
                res.json({ user: userTemp });
            }
        }

        const [user, roleList] = [
            await updateValue(_id, field, value, collectionUser, collectionOrg, collectionRoles, collectionCats),
            await getAllRoles(req.token.org, collectionRoles)
        ];

        if (!user) throw new Error('User profile not found');

        res.json({ user: user, roleList: roleList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateRoleId', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { ids, _id, org } = req.body;

        const [collectionUser, collectionOrg, collectionRoles, collectionCats, collectionNotifs] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
            await soda.createCollection('notifs')
        ];

        let userIds = await getUserByRoles(org, ids, collectionUser);
        await userRolesChanged(userIds, 0, collectionNotifs);
        const [user, roleList] = [await updateValue(_id, 'roles', ids, collectionUser, collectionOrg, collectionRoles, collectionCats), await getAllRoles(org, collectionRoles)];

        if (!user) throw new Error('Could not find employee');

        res.json({ user: user, roleList: roleList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function deleteFile(file, bucketName) {
    uploaded_data = uploaded_data - Number(file.size);
    available = available + Number(file.size);
    if (uploaded_data < 0) uploaded_data = 0;
    if (available > combined_plan) available = Number(combined_plan);
    percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
    if (percent_used > 100) percent_left = 100;
    percent_left = 100 - Number(percent_used);
    if (percent_left < 0) percent_left = 0;
    await deleteObject(file.url, bucketName);
}

router.post('/deleteUser/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionUserFile,
            collectionProjects, collectionRecs, collectionClient,
            collectionUserCat, collectionProjF, collectionSes,
            collectionRecfs, collectionsURecfs, collectionPRecfs,
            collectionNotifs, collectionNote, collectionSharedF,
            collectionClientC, collectionSharedN, collectionProjA, collectionEmpReq, collectionPlan] = [
                await soda.createCollection('users'), await soda.createCollection('orgs'), await soda.createCollection('user_files'),
                await soda.createCollection('projs'), await soda.createCollection('recrs'), await soda.createCollection('client_files'),
                await soda.createCollection('user_cats'), await soda.createCollection('proj_files'), await soda.createCollection('sessions'),
                await soda.createCollection('recfs'), await soda.createCollection('urecfs'), await soda.createCollection('precfs'),
                await soda.createCollection('notifs'), await soda.createCollection('notes'), await soda.createCollection('shared_files'),
                await soda.createCollection('client_cats'), await soda.createCollection('shared_notes'), await soda.createCollection('proj_assigned'),
                await soda.createCollection('emp_reqs'), await soda.createCollection('plans')
            ];

        const { _id } = req.params;

        var p1 = findUserById(_id, collectionUser);
        var p2 = UserFile.deleteFilesUser(_id, collectionUserFile);
        var p3 = getAllProjectsOfUser(_id, collectionProjects);
        var p4 = Recs.getAllRecFilesOfUser(_id, collectionRecs);
        var p5 = ClientF.getAllClientFilesOfUser(_id, collectionClient);
        var [user, ufile, pIds, recs, clients] = [await p1, await p2, await p3, await p4, await p5];
        if (!user) throw new Error('User not found')

        let mydate = new Date();
        let month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
        let str = mydate.getDate() + '-' + month + '-' + mydate.getFullYear();
        let sql = `UPDATE user_billing SET end_date='${str}' WHERE userId='${_id}'`;
        await connection.execute(sql);

        var p4 = getMultipleFilesPid(pIds, collectionProjF);
        var p5 = findOrganizationByIdUpt(user.current_employer, collectionOrg);
        var [files, organ] = [await p4, await p5];
        var uploaded_data = organ && organ.data_uploaded ? Number(organ.data_uploaded) : 0;
        var available = Number(organ.available);
        var percent_left, percent_used;

        if (user.image) await deleteObject(user.image, req.token.bucket, () => { });

        if (ufile && ufile.length > 0) await Promise.all(ufile.map(async file => deleteFile(file, req.token.bucket)));
        if (recs && recs.length > 0) await Promise.all(recs.map(async file => deleteFile(file, req.token.bucket)));
        if (clients && clients.length > 0) await Promise.all(clients.map(async file => deleteFile(file, req.token.bucket)));
        if (files && files.length > 0) await Promise.all(files.map(async file => deleteFile(file, req.token.bucket)));
        if (percent_left && percent_used) await updatePackageDetails(organ._id, uploaded_data, available, percent_left, percent_used, collectionOrg);

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
        var size = 1;

        const collection = await soda.createCollection('sets');
        const set = await getSetting(collection);

        if (set && set.maxImageSize) size = Number(set.maxImageSize);
        if (!validateMime(mimeType, size, fileSize)) throw new Error('Image type not supported');
        const fileName = `${uuidv4()}${image.toLowerCase().split(' ').join('-')}`;
        const key = generateFileName(fileName, org, id);
        const url = await putPresignedUrl(id, key, req.token.bucket);

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

        const [collectionUser, collectionOrg, collectionRoles, collectionCats] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
        ];

        var userT = await findUserById(_id, collectionUser);
        if (!userT) throw new Error('User profile not found');

        if (userT.image) await deleteObject(userT.image, req.token.bucket);

        const [user, roleList] = [await updateValue(_id, 'image', key, collectionUser, collectionOrg, collectionRoles, collectionCats), await getAllRoles(req.token.org, collectionRoles)];

        if (!user) throw new Error('Could not find employee');
        res.json({ user: user, roleList: roleList });
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
    return `FileO/organization/${id}/images/user/${_id}/${fileName}`;
}

module.exports = router;