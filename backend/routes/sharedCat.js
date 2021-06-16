const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    createNotification, fileChanged, fileChangedU
} = require('../schemas/notification');

const {
    findCatByIdP,
    findCatById,
} = require('../schemas/userCategory');

const {
    getAllUserCatIds,
    isExist,
    createSharedCat,
    getAllAssignedCount,
    getAllAssignedLimit,
    getAllAssignedQueryCount,
    getAllAssignedQueryLimit,
    deleteAssigned,
    getAllCatCount,
    getAllCatLimit,
    getAllCatQueryCount,
    getAllCatQueryLimit,
    getAllUptCatCountS,
    deleteAssignedAll
} = require('../schemas/sharedCat');

const {
    getAllUserSharedCountP,
    getAllUserSharedLimitP,
    getAllUserSharedQueryCountP,
    getAllUserSharedQueryLimitP,
    findUserById
} = require('../schemas/user');

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedC = await soda.createCollection('shrs_cat');
        const collectionNotif = await soda.createCollection('notifs');

        const { sWith, name, catId } = req.body;

        let cat = await findCatByIdP(catId, collectionCats, collectionUser);
        let arrId = await getAllUserCatIds(catId, collectionSharedC, collectionUser);
        let isEx = await isExist(sWith, catId, collectionSharedC);
        let user = await findUserById(sWith, collectionUser);

        arrId.push(user.email);

        if (!isEx) {
            let sharedData = {
                sharedWName: name, sharedWith: sWith, sharedBy: cat.uId._id,
                sharedByName: cat.uId.name, catId: catId,
                catTitle: cat.name, org: cat.org, updated: true,
                sharedWEmail: user.email
            };
            await createSharedCat(sharedData, collectionSharedC);
        }

        let userCount = await getAllUserSharedCountP(cat.org, arrId, req.token._id, collectionUser);
        let userList = await getAllUserSharedLimitP(0, cat.org, arrId, req.token._id, collectionUser);
        let assignedCount = await getAllAssignedCount(catId, collectionSharedC);
        let assignedList = await getAllAssignedLimit(catId, 0, collectionSharedC, collectionUser);

        let date = parseDate();
        let title = `${cat.uId.name} has shared a folder with you.`, message = `A new folder ${cat.name} has been shared by ${cat.uId.name} with you on ${date} in File-O.`;
        await generateNotification(cat.org, cat.uId._id, title, message, 5, 1, catId, date, '', sWith, collectionNotif);

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

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

router.get('/getEmployeeCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { _id, cId } = req.query;

        let arrId = await getAllUserCatIds(cId, collectionSharedC, collectionUser);
        let count = await getAllUserSharedCountP(_id, arrId, req.token._id, collectionUser);

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
        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { offset, _id, cId } = req.query;

        let arrId = await getAllUserCatIds(cId, collectionSharedC, collectionUser);
        let userList = await getAllUserSharedLimitP(offset, _id, arrId, req.token._id, collectionUser);

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
        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { string, _id, cId } = req.query;

        let arrId = await getAllUserCatIds(cId, collectionSharedC, collectionUser);
        let count = await getAllUserSharedQueryCountP(string, _id, arrId, req.token._id, collectionUser);

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
        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { offset, string, _id, cId } = req.query;

        let arrId = await getAllUserCatIds(cId, collectionSharedC, collectionUser);
        let userList = await getAllUserSharedQueryLimitP(offset, string, _id, arrId, req.token._id, collectionUser);

        return res.json({ users: userList });
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

        const collectionCats = await soda.createCollection('shrs_cat');

        let count = await getAllUptCatCountS(req.token._id, collectionCats);
        res.json({ catCount: count });
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

        const collectionSharedC = await soda.createCollection('shrs_cat');

        let count = await getAllAssignedCount(_id, collectionSharedC);

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
        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { limit, _id } = req.query;
        let userList = await getAllAssignedLimit(_id, limit, collectionSharedC, collectionUser);

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

        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { string, _id } = req.query;
        let count = await getAllAssignedQueryCount(_id, string, collectionSharedC);

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
        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { limit, string, _id } = req.query;
        let userList = await getAllAssignedQueryLimit(_id, limit, string, collectionSharedC, collectionUser);
        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCatCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { _id } = req.query;
        let count = await getAllCatCount(_id, collectionSharedC);

        return res.json({ catCount: count });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCats', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { limit, _id } = req.query;
        let catList = await getAllCatLimit(_id, limit, collectionSharedC, collectionCats, collectionUser);

        return res.json({ cats: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCats = await soda.createCollection('user_cats');
        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { _id, search, string } = req.query;
        if (string) catList = await getAllCatQueryLimit(_id, string, search, collectionSharedC, collectionCats);
        else catList = await getAllCatLimit(_id, search, collectionSharedC, collectionCats);

        return res.json({ cats: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchCatCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionSharedC = await soda.createCollection('shrs_cat')

        const { string, _id, search } = req.query;
        let count = await getAllCatQueryCount(_id, string, search, collectionSharedC);

        return res.json({ catCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedC = await soda.createCollection('shrs_cat');

        const { limit, string, _id, search } = req.query;
        let catList = await getAllCatQueryLimit(_id, limit, string, search, collectionSharedC, collectionCats, collectionUser);

        return res.json({ cats: catList });
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

        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedC = await soda.createCollection('shrs_cat');
        const collectionNotif = await soda.createCollection('notifs');

        const { sWith, catId } = req.body;
        await deleteAssigned(sWith, catId, collectionSharedC);
        await fileChangedU(catId, [sWith], collectionNotif);

        let cat = await findCatById(catId, collectionCats);
        let arrId = await getAllUserCatIds(catId, collectionSharedC, collectionUser);

        let userCount = await getAllUserSharedCountP(cat.org, arrId, req.token._id, collectionUser);
        let userList = await getAllUserSharedLimitP(0, cat.org, arrId, req.token._id, collectionUser);
        let assignedCount = await getAllAssignedCount(catId, collectionSharedC);
        let assignedList = await getAllAssignedLimit(catId, 0, collectionSharedC, collectionUser);

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteAll', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCats = await soda.createCollection('user_cats');
        const collectionUser = await soda.createCollection('users');
        const collectionSharedC = await soda.createCollection('shrs_cat');
        const collectionNotif = await soda.createCollection('notifs');

        const { catId } = req.body;

        await deleteAssignedAll(catId, collectionSharedC);
        await fileChanged(catId, collectionNotif);

        let cat = await findCatById(catId, collectionCats);
        let arrId = await getAllUserCatIds(catId, collectionSharedC, collectionUser);

        let userCount = await getAllUserSharedCountP(cat.org, arrId, req.token._id, collectionUser);
        let userList = await getAllUserSharedLimitP(0, cat.org, arrId, req.token._id, collectionUser);
        let assignedCount = await getAllAssignedCount(catId, collectionSharedC);
        let assignedList = await getAllAssignedLimit(catId, 0, collectionSharedC, collectionUser);

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


module.exports = router;