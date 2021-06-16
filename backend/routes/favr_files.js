const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    findFvrFileById,
    deleteById,
    createFvrFile,
    getFileCount,
    getFileLimit,
    getFileQueryCount,
    getFileQueryLimit
} = require('../schemas/favrFiles');

const {
    findFileById
} = require('../schemas/file');

const {
    findPFileById
} = require('../schemas/projectFile');

const {
    findCFileById
} = require('../schemas/clientFile');

const {
    findUFileById
} = require('../schemas/userFile');

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFvrFile = await soda.createCollection('favr_files');
        const collectionFile = await soda.createCollection('files');
        const collectionPFile = await soda.createCollection('proj_files');
        const collectionUFile = await soda.createCollection('user_files');
        const collectionCFile = await soda.createCollection('client_files');

        const { fileId, fileType, pId } = req.body;

        const { _id } = req.token;

        let favrFile = await findFvrFileById(fileId, _id, collectionFvrFile);

        if (favrFile) await deleteById(favrFile._id, collectionFvrFile);

        var file;
        switch (Number(fileType)) {
            case 0: file = await findFileById(fileId, collectionFile); break;
            case 1: file = await findPFileById(fileId, collectionPFile); break;
            case 2: file = await findUFileById(fileId, collectionUFile); break;
            case 3: file = await findCFileById(fileId, collectionCFile); break;
            default: break;
        }

        const fileData = {
            name: file.name, type: file.type, fileId: file.type < 3 ? file.versionId : file._id, fileType: Number(fileType),
            postedBy: fileType < 3 ? file.postedby : file.postedFor, savedBy: _id, org: file.org, pId: pId ? pId : '', created: Date.now(), date: new Date()
        };

        await createFvrFile(fileData, collectionFvrFile);

        res.json({ file: fileData });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/delete', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { fileId } = req.body;

        const collectionFvrFile = await soda.createCollection('favr_files');
        let favrFile = await findFvrFileById(fileId, req.token._id, collectionFvrFile);
        favrFile && await deleteById(favrFile._id, collectionFvrFile);

        res.json({ suc: true });
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

        const { type } = req.query;
        const collectionFvrFile = await soda.createCollection('favr_files');

        let count = await getFileCount(req.token._id, type, collectionFvrFile);

        return res.json({ fileCount: count });
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

        const collectionFvrFile = await soda.createCollection('favr_files');

        const { type, string } = req.query;
        let fileList;

        if (string) fileList = await getFileQueryLimit(req.token._id, string, type, collectionFvrFile);
        else fileList = await getFileLimit(req.token._id, type, collectionFvrFile);

        return res.json({ files: fileList });
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

        const collectionUser = await soda.createCollection('users');
        const collectionFvrFile = await soda.createCollection('favr_files');

        const { type } = req.query;
        let fileList = await getFileLimit(req.token._id, type, collectionFvrFile, collectionUser);

        return res.json({ files: fileList });
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

        const collectionUser = await soda.createCollection('users');
        const collectionFvrFile = await soda.createCollection('favr_files');

        const { string, type } = req.query;
        let count = await getFileQueryCount(req.token._id, string, type, collectionFvrFile, collectionUser);

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

        const collectionUser = await soda.createCollection('users');
        const collectionFvrFile = await soda.createCollection('favr_files');

        const { string, type } = req.query;
        let fileList = await getFileQueryLimit(req.token._id, string, type, collectionFvrFile, collectionUser);

        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        closeConnection();
    }
});

module.exports = router;