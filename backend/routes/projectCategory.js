const express = require('express');
const router = express.Router();

const uuidv4 = require('uuid/v4');
const {
    deleteObject, copyObject
} = require('../middlewares/oci-sdk');

const JWT = require('../middlewares/jwtAuth');

const {
    getAllProjectsOfUser, getProjectById, isProjectManager
} = require('../schemas/projects');

const {
    createCategory,
    findCatByName,
    getCatById,
    getAllCats,
    updateValue,
    updateAssigned,
    updateAssignedAll,
    deleteAssigned,
    deleteAssignedAll,
    deleteCat,
    deleteAllCatFiles,
    getAllCatLimitSP,
    getAllQueryCatLimitSP,
    getAllCatLimitSPM,
    getAllQueryCatLimitSPM,
    getAllChildCats,
    deleteChildCat,
    getAllChildFiles,
    getAllCatUser,
    getAllCatUserSearchCount,
    getAllCatUserSearch,
    updateCategory,
    updateAllChildPCat,
    getAllCatLimitSPF,
    getCatByIdC
} = require('../schemas/projectCategory');

const {
    deleteMultipleFilesArrRect,
} = require('../schemas/recentProjectFiles');

const {
    getAllCatFileCount, getAllCatFile, findFileByName, createFile, updateVersionId, deleteFile, findMultipleFilesArrId, updateUrl
} = require('../schemas/projectFile');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    findOrganizationByIdUpt,
    updatePackageDetails
} = require('../schemas/organization');

const {
    deleteMultipleFilesArrFvr
} = require('../schemas/favrFiles');

const {
    filesChanged, fileChangedU, createNotification
} = require('../schemas/notification');
const { findUserById } = require('../schemas/user');
const { getAllUserCountP, getAllUserLimitP, getAllUserQueryCountP, getAllUserQueryLimitP, getAllUserEI, getAssignedProjects } = require('../schemas/projectAssigned');
const { getSetting } = require('../schemas/setting');

router.get('/getCatC/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');
        const { _id } = req.params;

        let cat = await getCatByIdC(_id, collectionCat);

        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPCats = await soda.createCollection('proj_cats');

        const { name, _id, pId, desc } = req.body;
        let respData = {
            name: name, org: _id, assigned: [],
            pId: pId, description: desc, sqlC: '0',
            created: Date.now(), date: new Date(),
            isChild: false, pCat: [], parentCat: ''
        };
        let cat = await findCatByName(name, pId, '', collectionPCats);
        if (!cat) {
            let key = await createCategory(respData, collectionPCats);
            respData._id = key;
            res.json({ cat: respData });
        } else res.json({ error: 'Category already exists in this project' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/registerChild', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');

        const {
            name, pId, pCat
        } = req.body;

        let parent = await getCatById(pCat, collectionCat);

        let cats = parent.pCat && parent.pCat.length ? parent.pCat : [];
        cats.push(pCat);

        let cat = await findCatByName(name, pId, pCat, collectionCat);
        if (!cat) {

            let respData = {
                name: name, org: req.token.org, uId: req.token._id, pId: pId,
                date: new Date(), created: Date.now(), description: '',
                isChild: true, pCat: cats, parentCat: pCat, sqlC: '1'
            };

            let key = await createCategory(respData, collectionCat);
            respData._id = key;
            res.json({ cat: respData });
        } else res.json({ error: 'Category already exists in project' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCat/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPCats = await soda.createCollection('proj_cats');

        const { _id } = req.params;
        let cat = await getCatById(_id, collectionPCats);

        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCats/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPCats = await soda.createCollection('proj_cats');

        const { _id } = req.params;
        const { catId } = req.query;
        let cats = await getAllCats(_id, catId ? catId : '', collectionPCats);

        return res.json({ catList: cats });
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

        const collectionPCats = await soda.createCollection('proj_cats');

        const { _id, string, auth } = req.query;
        let cats;

        if (string) {
            cats = await getAllQueryCatLimitSP(_id, string, auth, req.token._id, collectionPCats);
        }
        else {
            cats = await getAllCatLimitSP(_id, auth, req.token._id, collectionPCats);
        }

        res.json({ catList: cats });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCats', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');
        const { catId, _id, pId } = req.query;

        let cat = '';

        if (catId) cat = await getCatByIdC(catId, collectionCat);

        let cats = await getAllCatLimitSPF(pId, catId, _id, collectionCat);

        res.json({ catList: cats, cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCombinedPM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPCats = await soda.createCollection('proj_cats');
        const collectionProj = await soda.createCollection('projs');
        const collectionAss = await soda.createCollection('proj_assigned');

        const { string, auth } = req.query;
        let cats, ids;

        if (auth === 'true') {
            ids = await getAllProjectsOfUser(req.token._id, collectionProj);
        } else {
            ids = await getAssignedProjects(req.token._id, collectionAss);
        }

        if (string) {
            cats = await getAllQueryCatLimitSPM(ids, string, auth, req.token._id, collectionPCats);
        }
        else {
            cats = await getAllCatLimitSPM(ids, auth, req.token._id, collectionPCats);
        }

        res.json({ catList: cats });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.post('/deleteCat/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPCats = await soda.createCollection('proj_cats');
        const collectionPFiles = await soda.createCollection('proj_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionFvrFiles = await soda.createCollection('favr_files');
        const collectionPrecfs = await soda.createCollection('precfs');
        const collectionNotif = await soda.createCollection('notifs');


        const { _id } = req.params;

        let keys = await getAllChildCats(_id, collectionPCats);

        let files = await getAllCatFileCount(_id, collectionPFiles);
        let organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        let child_files = await getAllChildFiles(keys, collectionPFiles);

        var uploaded_data = Number(organ.data_uploaded)
        var available = Number(organ.available);
        var combined_plan = Number(organ.combined_plan);
        var percent_left, percent_used, arr = [];

        if (files && files.length > 0) await Promise.all(files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);
            percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
            if (percent_used > 100) percent_left = 100;
            percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;
            await deleteObject(file.url, req.token.bucket);
            arr.push(file._id);
        }));

        if (child_files && child_files.length > 0) await Promise.all(child_files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);
            percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
            if (percent_used > 100) percent_left = 100;
            percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;
            await deleteObject(file.url, req.token.bucket);
            arr.push(file._id);
        }));

        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);

        await deleteCat(_id, collectionPCats);
        await deleteAllCatFiles(_id, collectionPCats);
        if (arr && arr.length > 0) {
            await deleteMultipleFilesArrRect(arr, collectionPrecfs);
            await deleteMultipleFilesArrFvr(arr, collectionFvrFiles);
            await filesChanged(arr, collectionNotif);
        }
        await deleteChildCat(_id, collectionPCats);

        res.json({ success: 'Category deleted' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPCats = await soda.createCollection('proj_cats');

        const { desc, value, _id, pId } = req.body;
        let cat = await getCatById(_id, collectionPCats);
        let category;

        category = cat.name !== value && await findCatByName(value, pId, cat.parentCat, collectionPCats);
        if (!category) cat = await updateValue(_id, desc, value, collectionPCats);
        else throw new Error('Folder already exists');

        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});



router.get('/getAssignedCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { _id } = req.query;

        const collectionCat = await soda.createCollection('proj_cats');
        let cat = await getCatById(_id, collectionCat), count = 0;

        if (cat && cat.assigned) {
            count = cat.assigned.length;
        }

        return res.json({ userCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getAssigned', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');
        const collectionUser = await soda.createCollection('users');

        const { limit, _id } = req.query;
        let userList = [];

        let cat = await getCatById(_id, collectionCat);

        if (cat && cat.assigned && cat.assigned.length > 0) {
            userList = await getAllCatUser(limit, req.token.org, cat.assigned, collectionUser);
        }

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchAssignedCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');
        const collectionUser = await soda.createCollection('users');

        const { string, _id } = req.query;
        let cat = await getCatById(_id, collectionCat), count = 0;

        if (cat && cat.assigned && cat.assigned.length > 0) {
            count = await getAllCatUserSearchCount(string, req.token.org, cat.assigned, collectionUser);
        }

        return res.json({ userCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchAssigned', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');
        const collectionUser = await soda.createCollection('users');

        const { limit, string, _id } = req.query;
        let userList = [];

        let cat = await getCatById(_id, collectionCat);

        if (cat && cat.assigned && cat.assigned.length > 0) {
            userList = await getAllCatUserSearch(limit, string, req.token.org, cat.assigned, collectionUser);
        }

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
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

        const collectionCat = await soda.createCollection('proj_cats');
        const collectionAss = await soda.createCollection('proj_assigned');

        const { _id } = req.query;

        let cat = await getCatById(_id, collectionCat), count = 0;

        count = await getAllUserCountP(cat.pId, cat && cat.ids ? cat.ids : [], collectionAss);

        return res.json({ userCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
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

        const collectionCat = await soda.createCollection('proj_cats');
        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionUser = await soda.createCollection('users');

        const { offset, _id } = req.query;
        let userList = [];

        let cat = await getCatById(_id, collectionCat);

        userList = await getAllUserLimitP(offset, cat.pId, cat && cat.ids ? cat.ids : [], collectionAss, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
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


        const collectionCat = await soda.createCollection('proj_cats');
        const collectionAss = await soda.createCollection('proj_assigned');

        const { string, _id } = req.query;

        let cat = await getCatById(_id, collectionCat), count = 0;

        count = await getAllUserQueryCountP(string, cat.pId, cat && cat.ids ? cat.ids : [], collectionAss);

        return res.json({ userCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
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

        const collectionCat = await soda.createCollection('proj_cats');
        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionUser = await soda.createCollection('users');;

        const { offset, string, _id } = req.query;
        let userList = [];

        let cat = await getCatById(_id, collectionCat);

        userList = await getAllUserQueryLimitP(offset, string, cat.pId, cat && cat.ids ? cat.ids : [], collectionAss, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/assign', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionCat = await soda.createCollection('proj_cats');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionUser = await soda.createCollection('users');

        const { _id, cId } = req.body;

        let user = await findUserById(_id, collectionUser);

        if (!user) throw new Error('User not found');

        let cat = await updateAssigned(cId, user._id, user.email, collectionCat);

        if (!cat) throw new Error('Category could not be updated');

        let date = parseDate();
        let title = `Project Manager has shared a folder with you.`, message = `A new folder ${cat.name} has been shared by Project Manager with you on ${date} in File-O.`;
        await generateNotification(req.token.org, req.token._id, title, message, 10, 2, cId, date, '', _id, cat.pId, collectionNotif);

        return res.json({ success: true });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/assignAll', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');
        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionUser = await soda.createCollection('users');
        const collectionNotif = await soda.createCollection('notifs');

        const { cId } = req.body;

        let cat = await getCatById(cId, collectionCat);

        if (!cat) throw new Error('Folder not found');

        let user = await getAllUserEI(cat.pId, cat && cat.ids ? cat.ids : [], collectionAss, collectionUser);

        if (!user) throw new Error('Users not found');

        cat = await updateAssignedAll(cId, user, collectionCat);

        if (!cat) throw new Error('Category could not be updated');

        let date = parseDate();
        let title = `Project Manager has shared a folder with you.`, message = `A new folder ${cat.name} has been shared by Project Manager with you on ${date} in File-O.`;

        await Promise.all(user.map(async i => {
            await generateNotification(req.token.org, req.token._id, title, message, 10, 2, cId, date, '', i._id, cat.pId, collectionNotif);
        }));
        return res.json({ success: true });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/remove', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');
        const collectionUser = await soda.createCollection('users');
        const collectionNotif = await soda.createCollection('notifs');

        const { _id, cId } = req.body;

        let user = await findUserById(_id, collectionUser);

        if (!user) throw new Error('User not found');

        let cat = await deleteAssigned(cId, user._id, user.email, collectionCat);

        if (!cat) throw new Error('Category could not be updated');

        await fileChangedU(cId, [user._id], collectionNotif);

        return res.json({ success: true });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/removeAll', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');
        const collectionNotif = await soda.createCollection('notifs');

        const { cId } = req.body;

        let cat = await deleteAssignedAll(cId, collectionCat);

        if (!cat) throw new Error('Category could not be updated');

        await filesChanged([cId], collectionNotif);

        return res.json({ success: true });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/moveCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('proj_cats');

        const { catId, _id } = req.body;

        let tempCat = await getCatById(_id, collectionCat);

        if (!tempCat) throw new Error('Category not found');

        let cat = await getCatById(catId, collectionCat);

        let category = await findCatByName(tempCat.name, req.token.org, catId, collectionCat);

        let cats = cat && cat.pCat && cat.pCat.length ? cat.pCat : [];
        catId && cats.push(catId)

        let tempR = tempCat.pCat && tempCat.pCat.length ? tempCat.pCat : [];

        tempR = tempR.filter(i => !cats.includes(i));

        cat = false;

        if (!category) cat = await updateCategory(_id, catId, cats, collectionCat);

        if (cat) {
            await updateAllChildPCat(_id, tempR, cats, collectionCat);
        }
        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/copyFolder', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCats = await soda.createCollection('proj_cats');
        const collectionFiles = await soda.createCollection('proj_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionSets = await soda.createCollection('sets');
        const collectionProjs = await soda.createCollection('projs');

        const { _id, catId, pId } = req.body;

        let pCat = [];

        if (catId) {
            let cat = await getCatById(catId, collectionCats);
            let cats = cat && cat.pCat && cat.pCat.length ? cat.pCat : [];
            cats.push(catId);
            pCat = cats;
        }

        let checkCat = await getCatById(_id, collectionCats);

        if (!checkCat) throw new Error('Folder does not exists');

        let isExist = await findCatByName(`${checkCat.name}`, pId, catId, collectionCats);

        if (isExist) throw new Error('Folder with this name already exists');

        var cats = [_id];

        const set = await getSetting(collectionSets);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        let prevKey = [];

        let childCs = await getAllChildCats(_id, collectionCats);

        if (childCs && childCs.length > 0) {
            cats = cats.concat(childCs);
        }

        let catKeys = [];

        await Promise.all(cats.map(async (cat, count) => {
            let tempCat = await getCatById(cat, collectionCats);

            if (tempCat) {
                prevKey = prevKey.concat([{ _id: tempCat._id, newId: '' }]);

                let tempCats = tempCat.pCat && tempCat.pCat.length > 0 && count !== 0 ? tempCat.pCat : pCat;

                if (count !== 0) {
                    let tempArr = tempCats, item = -1;
                    tempArr.map((i, k) => {
                        if (i === _id) {
                            item = k;
                        }
                    });

                    tempCats = tempCats.filter((i, k) => k >= item);
                    tempCats = pCat.concat(tempCats);
                }

                let tempData = {
                    name: `${tempCat.name}`, org: req.token.org, pId: tempCat.pId, description: tempCat.description, date: new Date(), created: Date.now(), isChild: tempCats.length > 0 ? true : false,
                    pCat: tempCats, parentCat: tempCats.length > 0 ? tempCats[tempCats.length - 1] : '', assigned: []
                };

                let keyC = await createCategory(tempData, collectionCats);

                catKeys.push(keyC);

                prevKey = prevKey.map(i => {
                    if (i._id === cat) {
                        i.newId = keyC;
                    }
                    return i;
                });

                let files = await getAllCatFile(cat, collectionFiles);

                files && files.length > 0 && await Promise.all(files.map(async file => {
                    var fileData = {
                        name: `${file.name}`, type: file.type, size: file.size, postedby: file.postedby, date: new Date(),
                        org: file.org, description: file.description, url: '', bucketName: req.token.bucket, version: 0,
                        active: file.active, versioning: file.versioning, category: keyC, versionId: '', compare: file.compare,
                        pId: file.pId, uploadable: file.uploadable, mimeType: file.mimeType, created: Date.now(), isVersion: false
                    };


                    var f = await findFileByName(fileData.name, req.token.org, fileData.category, collectionFiles);
                    var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
                    let project = await getProjectById(fileData.pId, collectionProjs);
                    let PM = await isProjectManager(fileData.pId, fileData.postedby, collectionProjs);

                    if (!f && fileData.size < fileSize && organ.available > fileData.size) {

                        var key = await createFile(fileData, collectionFiles);

                        const fl = file.url;
                        const type = fl.split('.').slice(-1);
                        const fileName = `${fileData.name}.${type}`;
                        fileData.url = generateFileName(fileName, fileData.org, keyC, key, fileData.pId);

                        var date = parseDate();
                        var title = `${PM ? 'Project Manager' : 'Participant'} has copied a new file in project ${project.name}`, message = `A new file ${fileData.name} has been copied to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;

                        await generateNotificationF(file.org, keyC, file.postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, fileData.type, fileData.pId, collectionNotifs, collectionCats);
                        const url = await copyObject(file.url, fileData.url, req.token.bucket);

                        await updateVersionId(key, fileData.url, collectionFiles);

                        if (url) await updateOrganizationStorage(file.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
                        else await deleteFile(key, collectionFiles)

                        const vers = await findMultipleFilesArrId([file._id], collectionFiles);
                        if (vers && vers.length > 0) await Promise.all(vers.map(async version => {

                            var verData = {
                                name: `${version.name}`, type: version.type, size: version.size, mimeType: version.mimeType, created: Date.now(),
                                postedby: version.postedby, org: version.org, active: version.active, category: keyC, isVersion: true, version: Number(version.version),
                                versionId: key, description: version.description, url: '', pId: version.pId, bucketName: req.token.bucket, date: new Date()
                            };

                            var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

                            if (verData.size < fileSize && organ.available > verData.size) {

                                var keyV = await createFile(verData, collectionFiles);
                                const fl = file.url;
                                const type = fl.split('.').slice(-1);
                                const fileName = `${verData.name.toLowerCase().split(' ').join('-')}.${type}`;
                                verData.url = generateFileName(fileName, verData.org, keyC, keyV, verData.pId);

                                await updateUrl(keyV, verData.url, collectionFiles);

                                var date = parseDate();
                                var title = `${PM ? 'Project Manager' : 'Participant'} has copied a new file in project ${project.name}`, message = `A new file ${fileData.name} has been copied to File-O by the ${PM ? 'Project Manager' : 'Participant'} ${date} in project ${project.name}.`;
                                await generateNotification(file.org, keyC, file.postedby, title, message, 1, PM ? 1 : 2, key, project, PM, date, file.type, file.pId, collectionNotifs, collectionCats);
                                const url = await copyObject(version.url, verData.url, req.token.bucket);
                                if (url) await updateOrganizationStorage(version.org, organ.data_uploaded, organ.available, organ.combined_plan, version.size, collectionOrg);
                                else await deleteFile(keyV, collectionFiles);
                            }
                        }))
                    }
                }));
            }
        }));

        catKeys && catKeys.length > 0 && await Promise.all(catKeys.map(async (cat, count) => {
            const doc = await collectionCats.find().fetchArraySize(0).key(cat).getOne();
            if (doc) {
                let tempCat = doc.getContent();

                let tempCats = tempCat.pCat;
                let parentCat = tempCat.parentCat;

                tempCats = tempCats.map(i => {
                    prevKey.map(j => {
                        if (j._id === i && j.newId) {
                            i = j.newId;
                        }
                        if (parentCat === j._id && j.newId) {
                            parentCat = j.newId;
                        }
                        return j;
                    });
                    return i;
                });

                tempCat.pCat = tempCats;
                tempCat.parentCat = parentCat;

                await collectionCats.find().fetchArraySize(0).key(cat).replaceOne(tempCat);
            }
        }));

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

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


async function generateNotification(org, pBy, title, message, t, uT, fileId, dt, mime, sWT, pId, collectionNotif) {

    let data = {
        postedBy: pBy, title: title, message: message, isRead: false,
        recievedBy: sWT, type: t, userType: uT, org: org, pId,
        id: fileId, date: dt, mimeType: mime, created: Date.now()
    };

    await createNotification(data, collectionNotif);
}

function generateFileName(fileName, org, catId, _id, pId) {
    return `FileO/organization/${org}/projects/${pId}/category/${catId}/files/${_id}/${uuidv4()}/${fileName}`;
}

async function generateNotificationF(org, cat, pBy, title, message, t, uT, fileId, project, PM, dt, mime, pId, collectionNotifs, collectionCat) {
    let category = await getCatById(cat, collectionCat);

    category && category.ids && category.ids.length > 0 && await Promise.all(category.ids.map(async id => {
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

module.exports = router;