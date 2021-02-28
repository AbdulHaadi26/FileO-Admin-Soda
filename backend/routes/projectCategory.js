const express = require('express');
const router = express.Router();

const {
    deleteObject
} = require('../middlewares/oci-sdk');

const JWT = require('../middlewares/jwtAuth');

const {
    getAssignedUserCatsP
} = require('../schemas/projectAssigned');

const {
    getAllProjectsOfUser
} = require('../schemas/projects');

const {
    createCategory,
    findCatByName,
    getCatById,
    getAllCats,
    updateValue,
    getAllCatCount,
    getAllCatLimit,
    getAllQueryCatCount,
    getAllQueryCatLimit,
    deleteCat,
    deleteAllCatFiles,
    getAllCatCountP,
    getAllCatLimitP,
    getAllQueryCatCountP,
    getAllQueryCatLimitP,
    getAllCatLimitSP,
    getAllQueryCatLimitSP,
    getAllCatLimitSPM,
    getAllQueryCatLimitSPM,
    getAllChildCats,
    deleteChildCat,
    getAllChildFiles
} = require('../schemas/projectCategory');

const {
    deleteMultipleFilesArrRect,
} = require('../schemas/recentProjectFiles');

const {
    deleteCatMany
} = require('../schemas/projectRoles');

const {
    getAllCatFileCount
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
    filesChanged
} = require('../schemas/notification');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPCats = await soda.createCollection('proj_cats');

        const { name, _id, pId, desc } = req.body;
        const respData = {
            name: name, org: _id,
            pId: pId, description: desc, sqlC: '0',
            created: Date.now(), date: new Date(),
            isChild: false, pCat: [], parentCat: ''
        };
        let cat = await findCatByName(name, pId, '', collectionPCats);
        if (!cat) {
            await createCategory(respData, collectionPCats);
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

            const respData = {
                name: name, org: req.token.org, uId: req.token._id, pId: pId,
                date: new Date(), created: Date.now(), description: '',
                isChild: true, pCat: cats, parentCat: pCat, sqlC: '1'
            };

            let data = await createCategory(respData, collectionCat);
            res.json({ cat: data });
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

        const { _id, string } = req.query;
        let cats;

        if (string) {
            cats = await getAllQueryCatLimitSP(_id, string, collectionPCats);
        }
        else {
            cats = await getAllCatLimitSP(_id, collectionPCats);
        }

        res.json({ catList: cats });
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

        const [collectionPCats, collectionProj] = [await soda.createCollection('proj_cats'), await soda.createCollection('projs')];

        const { string } = req.query;
        let cats;

        let ids = await getAllProjectsOfUser(req.token._id, collectionProj);

        if (string) {
            cats = await getAllQueryCatLimitSPM(ids, string, collectionPCats);
        }
        else {
            cats = await getAllCatLimitSPM(ids, collectionPCats);
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

        const collectionPCats = await soda.createCollection('proj_cats');

        const { _id, limit } = req.query;
        let p1 = getAllCatLimit(_id, limit, collectionPCats);
        let p2 = getAllCatCount(_id, collectionPCats);
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

        const collectionPCats = await soda.createCollection('proj_cats');

        const { _id, limit, string } = req.query;
        let p1 = getAllQueryCatLimit(_id, limit, string, collectionPCats);
        let p2 = getAllQueryCatCount(_id, string, collectionPCats);
        const [cats, count] = [await p1, await p2];

        res.json({ catList: cats, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchAssignedCatsP', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionPCats, collectionProj, collectionAss, collectionPRoles] = [
            await soda.createCollection('proj_cats'), await soda.createCollection('projs'),
            await soda.createCollection('proj_assigned'), await soda.createCollection('proj_roles')
        ];

        let cats = await getAssignedUserCatsP(req.token._id, collectionAss, collectionPRoles, collectionPCats, collectionProj);
        res.json({ catList: cats });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCatsP', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionPCats, collectionProj] = [
            await soda.createCollection('proj_cats'), await soda.createCollection('projs')
        ];

        const { limit } = req.query;
        let pIds = await getAllProjectsOfUser(req.token._id, collectionProj);

        let p1 = getAllCatLimitP(pIds, limit, collectionPCats, collectionProj);
        let p2 = getAllCatCountP(pIds, collectionPCats);
        const [cats, count] = [await p1, await p2];

        res.json({ catList: cats, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCatsSearchP', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionPCats, collectionProj] = [
            await soda.createCollection('proj_cats'), await soda.createCollection('projs')
        ];

        const { limit, string } = req.query;
        let pIds = await getAllProjectsOfUser(req.token._id, collectionProj);

        let p1 = getAllQueryCatLimitP(pIds, limit, string, collectionPCats, collectionProj);
        let p2 = getAllQueryCatCountP(pIds, string, collectionPCats);
        const [cats, count] = [await p1, await p2];

        res.json({ catList: cats, count: count });
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

        const [collectionPCats, collectionPFiles, collectionOrg, collectionFvrFiles, collectionPrecfs, collectionNotif] = [
            await soda.createCollection('proj_cats'), await soda.createCollection('proj_files'), await soda.createCollection('orgs'),
            await soda.createCollection('favr_files'), await soda.createCollection('precfs'), await soda.createCollection('notifs')
        ];

        const { _id } = req.params;

        let keys = await getAllChildCats(_id, collectionPCats);

        let p1 = deleteCatMany(_id, collectionPCats);
        let p2 = getAllCatFileCount(_id, collectionPFiles);
        let p3 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        let p4 = getAllChildFiles(keys, collectionPFiles);
        var [roles, files, organ, child_files] = [await p1, await p2, await p3, await p4];

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
        arr && arr.length > 0 && [await deleteMultipleFilesArrRect(arr, collectionPrecfs), await deleteMultipleFilesArrFvr(arr, collectionFvrFiles), await filesChanged(arr, collectionNotif)];
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
        if (!category) await updateValue(_id, desc, value, collectionPCats);
        else throw new Error('Folder already exists');

        cat = await getCatById(_id, collectionPCats);

        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;