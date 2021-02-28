const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getProfile,
    getAllUserCountDT,
    getAllUserLimitDT,
    getAllUserQueryCountDT,
    getAllUserQueryLimitDT,
    findUserById,
    updateStorage
} = require('../schemas/user');

const {
    createCategory,
    findCatByName,
} = require('../schemas/userCategory');

const {
    transferFiles,
    transferFilesSize
} = require('../schemas/userFile');

router.get('/getEmployee', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionRole, collectionCat] = [await soda.createCollection('users'), await soda.createCollection('orgs'), await soda.createCollection('roles'), await soda.createCollection('cats')];

        const { _id } = req.query;
        const user = await getProfile(_id, collectionUser, collectionOrg, collectionRole, collectionCat);
        if (!user) throw new Error('User not found');

        res.json({ user: user });
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

        const { _id, skipId } = req.query;
        let count = await getAllUserCountDT(_id, skipId, collectionUser);

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

        const { offset, _id, skipId } = req.query;
        var userList = await getAllUserLimitDT(offset, _id, skipId, collectionUser);

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
        const { string, _id, skipId, type } = req.query;
        let count = await getAllUserQueryCountDT(string, _id, skipId, type, collectionUser);

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

        const { offset, string, _id, skipId, type } = req.query;
        let userList = await getAllUserQueryLimitDT(offset, string, _id, skipId, type, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/transfer', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFiles, collectionCat, collectionUser] = [
            await soda.createCollection('user_files'), await soda.createCollection('user_cats'), await soda.createCollection('users')
        ];

        const { tId, tbyId, tbyName, org } = req.body;

        let name = `${tbyName}-${tbyId}`;
        let fname = name.toLowerCase().split(' ').join('-')
        const respData = { name: fname, org: org, uId: tId, created: Date.now(), date: new Date() };
        let cat = await findCatByName(respData.name, tId, collectionCat);
        if (!cat) {
            let size = await transferFilesSize(tbyId, collectionFiles);
            if (!size) size = 0;

            let [user1, user2] = [await findUserById(tId, collectionUser), await findUserById(tbyId, collectionUser)];

            if (user1 && user2) {
                let strAvb = user1.storageAvailable;

                if (strAvb > size) {
                    let key = await createCategory(respData, collectionCat);
                    [await updateUserStorage(tId, user1.storageUploaded, user1.storageAvailable, user1.storageLimit, size, collectionUser), await updateMUserStorage(tbyId, user2.storageUploaded, user2.storageAvailable, user2.storageLimit, size, collectionUser)]
                    await transferFiles(tbyId, key, tId, collectionFiles);
                }
            }
            res.json({ success: true });
        } else res.json({ error: 'Storage transfer was already done for this user' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function updateUserStorage(userId, sU, sA, sL, size, collectionUser) {
    var userUploaded = Number(sU) + Number(size);
    var userAvailable = Number(sA) - Number(size);
    if (userUploaded > sL) userUploaded = Number(sL);
    if (userAvailable < 0) userAvailable = Number(0);
    await updateStorage(userId, userUploaded, userAvailable, collectionUser);
}

async function updateMUserStorage(userId, sU, sA, sL, size, collectionUser) {
    var userUploaded = Number(sU) - Number(size);
    var userAvailable = Number(sA) + Number(size);
    if (userUploaded < 0) userUploaded = 0;
    if (userAvailable > sL) userAvailable = Number(sL);
    await updateStorage(userId, userUploaded, userAvailable, collectionUser);
}

module.exports = router;