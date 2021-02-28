const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    deleteObject
} = require('../middlewares/oci-sdk');

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
    findUserById,
    updateStorage
} = require('../schemas/user');

const {
    findCatByName,
    createCategory,
    getCatById,
    getAllCats,
    getAllCatCount,
    getAllCatLimit,
    getAllQueryCatCount,
    getAllQueryCatLimit,
    getAllCatCountU,
    getAllCatLimitU,
    getAllQueryCatCountU,
    getAllQueryCatLimitU,
    updateName,
    deleteCat,
    findCatById,
    getAllChildCats,
    deleteChildCat,
    getCatByIdC,
    getAllCatLimitCombinedUP,
    getAllCatLimitCombinedUSP,
    updateCatUpt,
    updateCatUptST
} = require('../schemas/userCategory');

const {
    getAllCatFile,
    deleteAllCatFiles,
    deleteMultipleFilesArr,
    getAllChildFiles,
    getAllFileLimitCombinedUS,
    getAllFileLimitCombinedU
} = require('../schemas/userFile');

const {
    deleteSharedCats, updateCatUptS, updateCatUptSU, getAllUptCatCountS
} = require('../schemas/sharedCat');

const {
    deleteMultipleFilesArrRect
} = require('../schemas/recentUserFile');
const { deleteMultipleFilesArrFvr } = require('../schemas/favrFiles');
const { filesChanged, fileChanged, updatedChanged } = require('../schemas/notification');

const {
    deleteMultipleFilesArrShared
} = require('../schemas/sharedFile');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const {
            name, _id, uId
        } = req.body;

        const respData = {
            name: name, org: _id, uId: uId, date: new Date(), created: Date.now(), isChild: false, pCat: [], parentCat: '', sqlC: '0'
        };

        let cat = await findCatByName(name, uId, '', collectionCat);
        if (!cat) {
            let data = await createCategory(respData, collectionCat);
            res.json({ cat: data });
        } else res.json({ error: 'Category already exists in my space' });
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

        const collectionCat = await soda.createCollection('user_cats');

        const {
            name, _id, uId, pCat
        } = req.body;

        let parent = await findCatById(pCat, collectionCat);

        let cats = parent.pCat && parent.pCat.length ? parent.pCat : [];
        cats.push(pCat);

        let cat = await findCatByName(name, uId, pCat, collectionCat);
        if (!cat) {

            const respData = {
                name: name, org: _id, uId: uId, date: new Date(), created: Date.now(), isChild: true, pCat: cats,
                parentCat: pCat, sqlC: '1'
            };

            let data = await createCategory(respData, collectionCat);

            await updateCatUptST(data, collectionCat);
            res.json({ cat: data });
        } else res.json({ error: 'Category already exists in my space' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/getCatShare/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionShared, collectionNotifs] = [await soda.createCollection('shrs_cat'), await soda.createCollection('notifs')];
        await updateCatUptSU(req.token._id, req.params._id, false, collectionShared);
        await updatedChanged(req.params._id, req.token._id, collectionNotifs);
        res.json({ success: true });
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

        const collectionCat = await soda.createCollection('user_cats');
        const { _id } = req.params;


        await updateCatUpt(_id, false, collectionCat);
        let cat = await getCatById(_id, collectionCat);

        return res.json({ cat: cat });
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

        const collectionCat = await soda.createCollection('user_cats');
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

router.get('/getCats/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

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

router.get('/fetchCats', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const { _id, limit } = req.query;
        let p1 = getAllCatLimit(_id, limit, collectionCat);
        let p2 = getAllCatCount(_id, collectionCat);
        const [cats, count] = [await p1, await p2];

        res.json({ catList: cats, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCatsSearch', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const { _id, limit, string } = req.query;

        let p1 = getAllQueryCatLimit(_id, limit, string, collectionCat);
        let p2 = getAllQueryCatCount(_id, string, collectionCat);
        const [cats, count] = [await p1, await p2];

        res.json({ catList: cats, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.get('/fetchCatsC', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const { _id, limit, catId } = req.query;
        let p1 = getAllCatLimitU(_id, limit, catId, collectionCat);
        let p2 = getAllCatCountU(_id, catId, collectionCat);
        const [cats, count] = [await p1, await p2];

        res.json({ catList: cats, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCatsCombined', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        let collectionFile = await soda.createCollection('user_files');
        let collectionCat = await soda.createCollection('user_cats');

        const { _id, string, type } = req.query;

        let catList, fileList;

        if (string) {
            catList = await getAllCatLimitCombinedUSP(_id, string, collectionCat);
            fileList = await getAllFileLimitCombinedUS(_id, '', type, string, collectionFile);
        } else {
            catList = await getAllCatLimitCombinedUP(_id, collectionCat);
            fileList = await getAllFileLimitCombinedU(_id, '', type, collectionFile);
        }

        return res.json({ files: fileList, cats: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCatsSearchC', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const { _id, limit, string, catId } = req.query;

        let p1 = getAllQueryCatLimitU(_id, limit, string, catId, collectionCat);
        let p2 = getAllQueryCatCountU(_id, string, catId, collectionCat);
        const [cats, count] = [await p1, await p2];

        res.json({ catList: cats, count: count });
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

        const [collectionCat, collectionFile, collectionOrg, collectionUser, collectionSCat, collectionURecfs, collectionShared, collectionNotif, collectionFvrFiles] = [
            await soda.createCollection('user_cats'), await soda.createCollection('user_files'),
            await soda.createCollection('orgs'), await soda.createCollection('users'),
            await soda.createCollection('shrs_cat'), await soda.createCollection('urecfs'),
            await soda.createCollection('shrs'), await soda.createCollection('notifs'),
            await soda.createCollection('favr_files')
        ];

        const { _id } = req.params;

        let keys = await getAllChildCats(_id, collectionCat);

        let p1 = getAllChildFiles(keys, collectionFile);
        let p2 = getAllCatFile(_id, collectionFile);
        let p3 = findUserById(req.token._id, collectionUser);
        let p4 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        const [child_files, files, user, organ] = [await p1, await p2, await p3, await p4];

        if (!user) return res.json({ error: 'User not found' });
        if (!organ) return res.json({ error: 'Organization not found' });
        var uploaded_data = Number(organ.data_uploaded)
        var available = Number(organ.available);
        var combined_plan = Number(organ.combined_plan);
        var percent_left, percent_used;
        var userUploaded = Number(user.storageUploaded);
        var userAvailable = Number(user.storageAvailable);
        var limit = Number(user.storageLimit);

        let arr = [];

        if (files && files.length > 0) await Promise.all(files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);
            percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
            if (percent_used > 100) percent_left = 100;
            percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;

            userUploaded = userUploaded - Number(file.size);
            userAvailable = userAvailable + Number(file.size);
            if (userAvailable > limit) userAvailable = Number(limit);
            if (userUploaded < 0) userUploaded = 0;
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

            userUploaded = userUploaded - Number(file.size);
            userAvailable = userAvailable + Number(file.size);
            if (userAvailable > limit) userAvailable = Number(limit);
            if (userUploaded < 0) userUploaded = 0;
            await deleteObject(file.url, req.token.bucket);
            arr.push(file._id);
        }));

        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);

        await deleteCat(_id, collectionCat);
        await deleteChildCat(_id, collectionCat);
        await deleteAllCatFiles(_id, collectionFile);
        await deleteSharedCats(_id, collectionSCat);
        arr && arr.length > 0 && [await deleteMultipleFilesArr(arr, collectionFile), await deleteMultipleFilesArrRect(arr, collectionURecfs),
        await deleteMultipleFilesArrFvr(arr, collectionFvrFiles), await deleteMultipleFilesArrShared(arr, collectionShared), await filesChanged(arr, collectionNotif)];
        await fileChanged(_id, collectionNotif);

        res.json({ success: 'Category deleted' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/updateCatCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCats = await soda.createCollection('user_cat');

        let count = await getAllUptCatCountS(req.token._id, collectionCats);
        res.json({ catCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateCatName', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionCat, collectionShared] = [await soda.createCollection('user_cats'), await soda.createCollection('shrs_cat')];

        const { value, _id, uId } = req.body;


        let cat = await getCatById(_id, collectionCat);

        if (!cat) throw new Error('Category not found');


        await updateCatUptS(_id, true, collectionShared);
        await updateCatUptST(_id, collectionCat);
        let category = await findCatByName(value, uId, cat.parentCat, collectionCat);

        cat = false;

        if (!category)
            cat = await updateName(_id, value, collectionCat);

        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;