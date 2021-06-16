const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const JWT = require('../middlewares/jwtAuth');
const { deleteObject, copyObject } = require('../middlewares/oci-sdk');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getAllFilesByCategory,
    deleteAllFilesByCategory,
    getAllCatFile,
    deleteFile,
    findFileByName,
    createFile,
    updateVersionId,
    findMultipleFilesArrIdVer,
    updateUrl
} = require('../schemas/file');

const {
    filesChanged,
    createNotification,
    fileChangedU
} = require('../schemas/notification');

const {
    deleteMultipleFvrFileArr
} = require('../schemas/favrFiles');

const {
    deleteMultipleRecfFileArr
} = require('../schemas/recentFiles');

const {
    getCat,
    getAllCats,
    findCatByName,
    createCategory,
    getAllCatLimit,
    getAllCatLimitQuery,
    updateCat,
    deleteCat,
    getAllChildCats,
    deleteChildCat,
    getAllChildFiles,
    getAllCatUser,
    getAllCatUserSearchCount,
    getAllCatUserSearch,
    updateAssigned,
    deleteAssigned,
    updateAssignedAll,
    deleteAssignedAll,
    getCatByIdC,
    getAllCatLimitS,
    updateCategory,
    updateAllChildPCat
} = require('../schemas/category');

const {
    findOrganizationByIdUpt,
    updatePackageDetails
} = require('../schemas/organization');

const {
    getAllUserSharedCountP,
    getAllUserSharedLimitP,
    getAllUserSharedQueryCountP,
    getAllUserSharedQueryLimitP,
    findUserById,
    getAllUserEI
} = require('../schemas/user');

const {
    getSetting
} = require('../schemas/setting');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('cats');

        const { _id, name, desc } = req.body;

        let respData = {
            name: name, org: _id, description: desc,
            created: Date.now(), date: new Date(), sqlC: '0',
            isChild: false, pCat: [], parentCat: '',
            assigned: []
        };

        let cat = await findCatByName(_id, name, '', collectionCat);
        if (!cat) {
            let data = await createCategory(respData, collectionCat);
            respData._id = data;
            res.json({ cat: respData });
        } else throw new Error('Category already exists');
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

        const collectionCat = await soda.createCollection('cats');

        const {
            name, pCat
        } = req.body;

        let parent = await getCat(pCat, collectionCat);

        let cats = parent.pCat && parent.pCat.length ? parent.pCat : [];
        cats.push(pCat);

        let cat = await findCatByName(req.token.org, name, pCat, collectionCat);
        if (!cat) {

            let respData = {
                name: name, org: req.token.org, description: '',
                date: new Date(), created: Date.now(), sqlC: '1',
                isChild: true, pCat: cats, parentCat: pCat
            };

            let data = await createCategory(respData, collectionCat);

            respData._id = data;
            res.json({ cat: respData });
        } else res.json({ error: 'Category already exists in company' });
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

        const collectionCat = await soda.createCollection('cats');
        const { _id } = req.params;
        const cat = await getCat(_id, collectionCat);

        if (cat) return res.json({ cat: cat });
        else throw new Error('Category not found');
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

        const collectionCat = await soda.createCollection('cats');

        const { _id } = req.params;

        const { catId } = req.query;

        let cats = await getAllCats(_id, catId ? catId : '', collectionCat);

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

        const collectionCat = await soda.createCollection('cats');
        const { string, auth } = req.query;
        let cats;

        if (string) cats = await getAllCatLimitQuery(req.token.org, string, auth, req.token._id, collectionCat);
        else cats = await getAllCatLimit(req.token.org, auth, req.token._id, collectionCat);

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

        const collectionCat = await soda.createCollection('cats');
        const { catId, _id } = req.query;

        let cat = '';

        if (catId) cat = await getCatByIdC(catId, collectionCat);

        let cats = await getAllCatLimitS(req.token.org, catId, _id, collectionCat);

        res.json({ catList: cats, cat: cat });
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

        const collectionCat = await soda.createCollection('cats');

        const { catId, _id } = req.body;

        let tempCat = await getCat(_id, collectionCat);

        if (!tempCat) throw new Error('Category not found');

        let cat = await getCat(catId, collectionCat);

        let category = await findCatByName(req.token.org, tempCat.name, catId, collectionCat);

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

router.delete('/deleteCat/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionCats = await soda.createCollection('cats');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionFav = await soda.createCollection('favr_files');
        const collectionRecf = await soda.createCollection('recfs');

        const { _id } = req.params;

        let keys = await getAllChildCats(_id, collectionCats);

        let files = await getAllFilesByCategory(_id, collectionFiles);
        let organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        let child_files = await getAllChildFiles(keys, collectionFiles);

        if (!organ) throw new Error('Organization not found');
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
            await deleteObject(file.url, file.bucketName);
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
            await deleteObject(file.url, file.bucketName);
            arr.push(file._id);
        }));

        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);

        await deleteCat(_id, collectionCats);

        await deleteAllFilesByCategory(_id, collectionFiles);

        if (arr && arr.length > 0) {
            await deleteMultipleRecfFileArr(arr, collectionRecf);
            await deleteMultipleFvrFileArr(arr, collectionFav);
            await filesChanged(arr, collectionNotifs);
        }

        await deleteChildCat(_id, collectionCats);

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

        const collectionCat = await soda.createCollection('cats');
        const { desc, value, _id, org } = req.body;

        let cat, category;
        cat = await getCat(_id, collectionCat);
        category = cat.name !== value && await findCatByName(org, value, cat.parentCat, collectionCat);

        if (!category) {
            cat = await updateCat(_id, value, desc, collectionCat);
        } else throw new Error('Category with this name already exists');

        if (cat) return res.json({ cat });
        throw new Error('Category not found');
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

        const collectionCat = await soda.createCollection('cats');

        let cat = await getCat(_id, collectionCat), count = 0;

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

        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');

        const { limit, _id } = req.query;
        let userList = [];

        let cat = await getCat(_id, collectionCat);

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


        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');


        const { string, _id } = req.query;
        let cat = await getCat(_id, collectionCat), count = 0;

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

        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');

        const { limit, string, _id } = req.query;
        let userList = [];

        let cat = await getCat(_id, collectionCat);

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

        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');

        const { _id } = req.query;

        let cat = await getCat(_id, collectionCat), count = 0;

        count = await getAllUserSharedCountP(req.token.org, cat && cat.assigned ? cat.assigned : [], req.token._id, collectionUser);

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

        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');

        const { offset, _id } = req.query;
        let userList = [];

        let cat = await getCat(_id, collectionCat);

        userList = await getAllUserSharedLimitP(offset, req.token.org, cat && cat.assigned ? cat.assigned : [], req.token._id, collectionUser);

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

        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');

        const { string, _id } = req.query;

        let cat = await getCat(_id, collectionCat), count = 0;

        count = await getAllUserSharedQueryCountP(string, req.token.org, cat && cat.assigned ? cat.assigned : [], req.token._id, collectionUser);

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

        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');

        const { offset, string, _id } = req.query;
        let userList = [];

        let cat = await getCat(_id, collectionCat);

        userList = await getAllUserSharedQueryLimitP(offset, string, req.token.org, cat && cat.assigned ? cat.assigned : [], req.token._id, collectionUser);

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

        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');
        const collectionNotif = await soda.createCollection('notifs');

        const { _id, cId } = req.body;

        let user = await findUserById(_id, collectionUser);

        if (!user) throw new Error('User not found');

        let cat = await updateAssigned(cId, user._id, user.email, collectionCat);

        if (!cat) throw new Error('Category could not be updated');

        let date = parseDate();
        let title = `Admin has shared a folder with you.`, message = `A new folder ${cat.name} has been shared by Admin with you on ${date} in File-O.`;
        await generateNotification(req.token.org, req.token._id, title, message, 10, 1, cId, date, '', _id, collectionNotif);

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

        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');
        const collectionNotif = await soda.createCollection('notifs');

        const { cId } = req.body;

        let cat = await getCat(cId, collectionCat);

        if (!cat) throw new Error('Folder not found');

        let user = await getAllUserEI(req.token.org, cat && cat.assigned ? cat.assigned : [], collectionUser);

        if (!user) throw new Error('Users not found');

        cat = await updateAssignedAll(cId, user, collectionCat);

        if (!cat) throw new Error('Category could not be updated');

        let date = parseDate();
        let title = `Admin has shared a folder with you.`, message = `A new folder ${cat.name} has been shared by Admin with you on ${date} in File-O.`;

        await Promise.all(user.map(async i => {
            await generateNotification(req.token.org, req.token._id, title, message, 10, 1, cId, date, '', i._id, collectionNotif);
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

        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('cats');
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

        const collectionCat = await soda.createCollection('cats');
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

router.get('/getCatC/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('cats');
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

router.post('/copyFolder', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSets = await soda.createCollection('sets');
        const collectionCats = await soda.createCollection('cats');
        const collectionNotifs = await soda.createCollection('notifs');

        const { _id, catId } = req.body;

        var pCat = [];

        if (catId) {
            let cat = await getCat(catId, collectionCats);
            let cats = cat && cat.pCat && cat.pCat.length ? cat.pCat : [];
            cats.push(catId);
            pCat = cats;
        }

        let checkCat = await getCat(_id, collectionCats);

        if (!checkCat) throw new Error('Folder does not exists');

        let isExist = await findCatByName(req.token.org, `${checkCat.name}`, catId, collectionCats);

        if (isExist) throw new Error('Folder with this name already exists');

        var cats = [_id];

        const set = await getSetting(collectionSets);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        let prevKey = [];

        let childCs = await getAllChildCats(_id, collectionCats);

        if (childCs && childCs.length > 0) {
            cats = cats.concat(childCs);
        }

        var catKeys = [];

        await Promise.all(cats.map(async (cat, count) => {
            let tempCat = await getCat(cat, collectionCats);

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
                    name: `${tempCat.name}`, org: req.token.org, date: new Date(), created: Date.now(), isChild: tempCats.length > 0 ? true : false,
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

                let files = await getAllCatFile(cat, collectionFile);

                files && files.length > 0 && await Promise.all(files.map(async file => {

                    var fileData = {
                        name: `${file.name}`, type: file.type, size: file.size, postedby: file.postedby,
                        org: file.org, mimeType: file.mimeType, bucketName: req.token.bucket, date: new Date(),
                        active: file.active, versioning: file.versioning, category: keyC, versionId: '', version: 0,
                        compare: file.compare, description: file.description, url: '', created: Date.now(),
                        isVersion: false,
                    };

                    var p3 = findFileByName(fileData.name, req.token.org, fileData.category, collectionFile);
                    var p4 = findOrganizationByIdUpt(req.token.org, collectionOrg);
                    var [f, organ] = [await p3, await p4];
                    if (!f && fileData.size < fileSize && organ.available > fileData.size) {
                        var key = await createFile(fileData, collectionFile);
                        var fl = file.url;
                        var type = fl.split('.').slice(-1);
                        var fileName = `${fileData.name.toLowerCase().split(' ').join('-')}.${type}`;
                        fileData.url = generateFileName(fileName, file.org, keyC, key);

                        await updateVersionId(key, fileData.url, collectionFile);

                        var date = parseDate();
                        var title = "Administrator has copied file", message = `A new file ${fileData.name} has been copied to File-O by the administrator on ${date} in company files.`;

                        await generateNotificationF(file.org, keyC, file.postedby, title, message, 0, 1, key, date, file.type, collectionCats, collectionNotifs);

                        var url = await copyObject(file.url, fileData.url, req.token.bucket);

                        if (url) await updateOrganizationStorage(file.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
                        else await deleteFile(key, collectionFile);

                        const vers = await findMultipleFilesArrIdVer(file._id, collectionFile);

                        if (vers && vers.length > 0) await Promise.all(vers.map(async version => {
                            var verData = {
                                name: `${version.name}`, type: version.type, size: version.size, mimeType: version.mimeType,
                                postedby: version.postedby, org: version.org, active: version.active, category: keyC, isVersion: true,
                                version: Number(version.version), created: Date.now(), date: new Date(),
                                versionId: fileData._id, description: version.description, url: '', bucketName: req.token.bucket
                            };

                            var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

                            if (verData.size < fileSize && organ.available > verData.size) {
                                const keyV = await createFile(verData, collectionFile);

                                var fl = version.url;
                                var type = fl.split('.').slice(-1);
                                var fileName = `${verData.name.toLowerCase().split(' ').join('-')}.${type}`;
                                verData.url = generateFileName(fileName, verData.org, keyC, keyV);

                                await updateUrl(keyV, verData.url, collectionFile);

                                var date = parseDate();
                                var title = "Administrator has copied a file", message = `A new file ${verData.name} has been copied to File-O by the administrator on ${date} in company files.`;

                                await generateNotificationF(version.org, catId, version.postedby, title, message, 0, 1, keyV, date, version.type, collectionCats, collectionNotifs);

                                var url = await copyObject(version.url, verData.url, req.token.bucket);

                                if (url) await updateOrganizationStorage(version.org, organ.data_uploaded, organ.available, organ.combined_plan, version.size, collectionOrg);
                                else await deleteFile(keyV, collectionFile);
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

async function generateNotification(org, pBy, title, message, t, uT, fileId, dt, mime, sWT, collectionNotif) {

    let data = {
        postedBy: pBy, title: title, message: message, isRead: false,
        recievedBy: sWT, type: t, userType: uT, org: org,
        id: fileId, date: dt, mimeType: mime, created: Date.now()
    };

    await createNotification(data, collectionNotif);
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

function generateFileName(fileName, org, catId, _id) {
    return `FileO/organization/${org}/category/${catId}/files/${_id}/${uuidv4()}/${fileName}`;
}

async function generateNotificationF(org, cat, pBy, title, message, t, uT, fileId, dt, mime, collectionCat, collectionNotif) {
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

module.exports = router;