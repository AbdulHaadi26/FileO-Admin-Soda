const express = require('express');
const router = express.Router();
const JWT = require('../../../middlewares/jwtAuth');
const uuidv4 = require('uuid/v4');

const {
    putPresignedUrl,
    deleteObject,
    copyObject
} = require('../../../middlewares/oci-sdk');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../../middlewares/oracleDB');

const {
    getSetting
} = require('../../../schemas/personal/schemas/setting');

const {
    getAllFileLimitUD
} = require('../../../schemas/personal/schemas/userFile');

const {
    getAllFileLimitUCD
} = require('../../../schemas/personal/schemas/clientFile');

router.get('/getAllFiles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFiles = await soda.createCollection('client_files');
        const collectionUFiles = await soda.createCollection('user_files');

        const { _id } = req.token;

        let files = await getAllFileLimitUCD(_id, collectionFiles);

        let userFiles = await getAllFileLimitUD(_id, collectionUFiles);

        let tempList = [].concat(files, userFiles);

        return res.json({ files: tempList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;