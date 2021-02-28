const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');
const { deleteObject } = require('../middlewares/oci-sdk');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    deleteCatMany
} = require('../schemas/role');

const {
    getAllFilesByCategory,
    deleteAllFilesByCategory
} = require('../schemas/file');

const {
    filesChanged
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
    getAllCatCount,
    getAllCatCountQuery,
    getAllCatLimit,
    getAllCatLimitQuery,
    updateDesc,
    updateName,
    deleteCat,
    getAllChildCats,
    deleteChildCat,
    getAllChildFiles
} = require('../schemas/category');

const {
    findOrganizationByIdUpt, updatePackageDetails
} = require('../schemas/organization');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('cats');

        const { _id, name, desc } = req.body;
        const respData = {
            name: name, org: _id, description: desc,
            created: Date.now(), date: new Date(), sqlC: '0',
            isChild: false, pCat: [], parentCat: ''
        };

        let cat = await findCatByName(_id, name, '', collectionCat);
        if (!cat) {
            let data = await createCategory(respData, collectionCat);
            res.json({ cat: data });
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

            const respData = {
                name: name, org: req.token.org, description: '',
                date: new Date(), created: Date.now(), sqlC: '1',
                isChild: true, pCat: cats, parentCat: pCat
            };

            let data = await createCategory(respData, collectionCat);
            res.json({ cat: data });
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
        var cats = await getAllCats(_id, catId ? catId : '', collectionCat);

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
        const { _id, string } = req.query;
        let cats;

        if (string) cats = await getAllCatLimitQuery(_id, string, collectionCat);
        else cats = await getAllCatLimit(_id, collectionCat);

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
        const { _id, limit } = req.query;
        var p1 = getAllCatLimit(_id, limit, collectionCat);
        var p2 = getAllCatCount(_id, collectionCat);
        var [cats, count] = [await p1, await p2];

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

        const collectionCat = await soda.createCollection('cats');
        const { _id, limit, string } = req.query;
        var p1 = getAllCatLimitQuery(_id, limit, string, collectionCat);
        var p2 = getAllCatCountQuery(_id, string, collectionCat);
        var [cats, count] = [await p1, await p2];

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

        const [collectionFiles, collectionOrg, collectionRoles, collectionCats, collectionNotifs, collectionFav, collectionRecf] = [
            await soda.createCollection('files'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
            await soda.createCollection('notifs'),
            await soda.createCollection('favr_files'),
            await soda.createCollection('recfs')
        ];

        const { _id } = req.params;

        let keys = await getAllChildCats(_id, collectionCats);

        var p1 = deleteCatMany(_id, collectionRoles);
        var p2 = getAllFilesByCategory(_id, collectionFiles);
        var p3 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        let p4 = getAllChildFiles(keys, collectionFiles);
        var [roles, files, organ, child_files] = [await p1, await p2, await p3, await p4];

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
        arr && arr.length > 0 && [await deleteMultipleRecfFileArr(arr, collectionRecf), await deleteMultipleFvrFileArr(arr, collectionFav), await filesChanged(arr, collectionNotifs)];
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
            cat = await updateName(_id, value, desc, collectionCat);
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

module.exports = router;