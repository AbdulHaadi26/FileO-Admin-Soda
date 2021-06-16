const express = require('express');
const router = express.Router();
const JWT = require('../../../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../../middlewares/oracleDB');

const {
    createCategory,
    findCatByName,
    getAllCatCount,
    getAllCatLimit,
    getAllQueryCatCount,
    getAllQueryCatLimit,
    getCatById,
    getAllCats,
    updateValue,
    deleteCat,
    updateCatUpt
} = require('../../../schemas/personal/schemas/clientsCategory');

const {
    getAllCatFileCount,
    getAllFileLimit,
    getAllFileQueryLimit
} = require('../../../schemas/personal/schemas/clientFile');

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('client_cats');

        const {
            name, _id, uId, desc
        } = req.body;

        let respData = {
            name: name, flag:'P', uId: uId, description: desc,
            created: Date.now(), date: new Date(), updated: false
        };

        let cat = await findCatByName(name, uId, collectionCat);
        if (!cat) {
            let key = await createCategory(respData, collectionCat);

            respData._id = key;

            res.json({ cat: respData });
        } else res.json('Category already exists in storage');
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

        const collectionCat = await soda.createCollection('client_cats');

        const { _id } = req.params;
        let cat = await getCatById(_id, collectionCat);
        await updateCatUpt(_id, collectionCat);

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

        const collectionCat = await soda.createCollection('client_cats');

        const { _id } = req.params;
        let cats = await getAllCats(_id, collectionCat);

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

        const collectionCat = await soda.createCollection('client_cats');

        const { _id, limit } = req.query;
        let cats = await getAllCatLimit(_id, limit, collectionCat);
        let count = await getAllCatCount(_id, collectionCat);

        res.json({ catList: cats, count: count });
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

        const collectionCat = await soda.createCollection('client_cats');
        const collectionFile = await soda.createCollection('client_files');

        const { _id, string, type } = req.query;

        let cats, fileList;

        if (string) {
            cats = await getAllQueryCatLimit(_id, string, collectionCat);
            fileList = await getAllFileQueryLimit(_id, string, '', type, collectionFile);
        }
        else {
            cats = await getAllCatLimit(_id, collectionCat);
            fileList = await getAllFileLimit(_id, '', type, collectionFile);
        }
        res.json({ catList: cats, files: fileList });
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

        const collectionCat = await soda.createCollection('client_cats');

        const { _id, limit, string } = req.query;

        let cats = await getAllQueryCatLimit(_id, limit, string, collectionCat);
        let count = await getAllQueryCatCount(_id, string, collectionCat);

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

        const collectionCat = await soda.createCollection('client_cats');
        const collectionFiles = await soda.createCollection('client_files');

        const { _id } = req.params;

        let count = await getAllCatFileCount(_id, collectionFiles);

        if (count < 1) {
            await deleteCat(_id, collectionCat);
            return res.json({ success: 'Category deleted' })
        } else {
            throw new Error('Category could not be deleted');
        }
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

        const collectionCat = await soda.createCollection('client_cats');

        const { value, _id, uId, desc } = req.body;

        let cat = await getCatById(_id, collectionCat);

        let category = cat.name !== value && await findCatByName(value, uId, collectionCat);

        if (category) return res.json({ error: 'Category already exists' });

        cat = await updateValue(_id, value, desc, collectionCat);

        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;