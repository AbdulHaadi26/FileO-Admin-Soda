const express = require('express');
const router = express.Router();

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../middlewares/oracleDB');

const {
    isExist, isExpired
} = require('../../schemas/clientApp/sharedLink');

const {
    isExistC, isExpiredC
} = require('../../schemas/clientApp/sharedCatLink');

const {
    getFile,
    downloadFile,
    getFiles,
    getChildFolders,
    getCatC,
    getCat
} = require('../../schemas/clientApp/userFile');

const {
    getUser
} = require('../../schemas/clientApp/user');

router.post('/file/:_id', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionFiles = await soda.createCollection('user_files');
        const collectionLink = await soda.createCollection('links');
        const collectionUser = await soda.createCollection('users');

        const { _id } = req.params;

        let isEx = await isExist(_id, collectionLink);
        let isEXP = await isExpired(_id, collectionLink);

        if (!isEx) return res.json({ error: 1 });

        if (!isEXP) return res.json({ error: 2 });

        let file = await getFile(_id, collectionFiles, collectionUser);

        if (!file) return res.json({ error: 1 });

        res.json({ file: file });
    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/category/:_id', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionFiles = await soda.createCollection('user_files');
        const collectionLink = await soda.createCollection('user_cat_links');
        const collectionUser = await soda.createCollection('users');
        const collectionCat = await soda.createCollection('user_cats');

        const { _id } = req.params;

        let isEx = await isExistC(_id, collectionLink);
        let isEXP = await isExpiredC(_id, collectionLink);

        if (!isEx) return res.json({ error: 1 });
        if (!isEXP) return res.json({ error: 2 });


        let category = await getCat(_id, collectionCat);

        if (!category) throw new Error('Category not found');

        let categoryC;

        if (req.query.childCat) {
            categoryC = await getCatC(req.query.childCat, collectionCat);
        }


        let folders = await getChildFolders(req.query.childCat, _id, collectionCat);
        let files = await getFiles(req.query.childCat, _id, collectionFiles);
        let postedby = await getUser(category.uId, collectionUser);

        if (!files) return res.json({ error: 1 });

        res.json({ files: files, folders: folders, postedby: postedby, category: category, categoryC: categoryC });
    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/download/:_id', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('user_files');
        const collectionLink = await soda.createCollection('links');
        const collectionUser = await soda.createCollection('users');

        const { _id } = req.params;

        let isEx = await isExist(_id, collectionLink);
        let isEXP = await isExpired(_id, collectionLink);

        if (!isEx) return res.json({ error: 1 });
        if (!isEXP) return res.json({ error: 2 });

        let file = await downloadFile(_id, collectionFiles, collectionUser);

        if (!file) return res.json({ error: 1 });

        res.json({ file: file });
    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/downloadC/category/:cat/:_id', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('user_files');
        const collectionLink = await soda.createCollection('user_cat_links');
        const collectionUser = await soda.createCollection('users');

        const { _id, cat } = req.params;

        let isEx = await isExistC(cat, collectionLink);
        let isEXP = await isExpiredC(cat, collectionLink);

        if (!isEx) return res.json({ error: 1 });
        if (!isEXP) return res.json({ error: 2 });

        let file = await downloadFile(_id, collectionFiles, collectionUser);

        if (!file) return res.json({ error: 1 });

        res.json({ file: file });
    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;