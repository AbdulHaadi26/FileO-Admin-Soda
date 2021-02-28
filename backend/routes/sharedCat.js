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

        const [collectionCats, collectionUser, collectionSharedC, collectionNotif] = [
            await soda.createCollection('user_cats'), await soda.createCollection('users'), await soda.createCollection('shrs_cat'), await soda.createCollection('notifs')
        ];

        const { sWith, name, catId } = req.body;
        const p1 = findCatByIdP(catId, collectionCats, collectionUser);
        const p2 = getAllUserCatIds(catId, collectionSharedC, collectionUser);
        const p3 = isExist(sWith, catId, collectionSharedC);
        const p4 = findUserById(sWith, collectionUser);
        const [cat, arrId, isEx, user] = [await p1, await p2, await p3, await p4];
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
        const p5 = getAllUserSharedCountP(cat.org, arrId, req.token._id, collectionUser);
        const p6 = getAllUserSharedLimitP(0, cat.org, arrId, req.token._id, collectionUser);
        const p7 = getAllAssignedCount(catId, collectionSharedC);
        const p8 = getAllAssignedLimit(catId, 0, collectionSharedC, collectionUser);
        const [userCount, userList, assignedCount, assignedList] = [await p5, await p6, await p7, await p8];
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

        const [collectionSharedC, collectionUser] = [
            await soda.createCollection('shrs_cat'), await soda.createCollection('users')
        ];

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

        const [collectionSharedC, collectionUser] = [
            await soda.createCollection('shrs_cat'), await soda.createCollection('users')
        ];

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

        const [collectionSharedC, collectionUser] = [
            await soda.createCollection('shrs_cat'), await soda.createCollection('users')
        ];

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

        const [collectionSharedC, collectionUser] = [
            await soda.createCollection('shrs_cat'), await soda.createCollection('users')
        ];

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

        const [collectionUser, collectionSharedC] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_cat')
        ];

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
        var count = await getAllAssignedQueryCount(_id, string, collectionSharedC);

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

        const [collectionUser, collectionSharedC] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_cat')
        ];

        const { limit, string, _id } = req.query;
        var userList = await getAllAssignedQueryLimit(_id, limit, string, collectionSharedC, collectionUser);
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
        var count = await getAllCatCount(_id, collectionSharedC);

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

        const [collectionUser, collectionSharedC, collectionCats] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_cat'), await soda.createCollection('user_cats')
        ];

        const { limit, _id } = req.query;
        var catList = await getAllCatLimit(_id, limit, collectionSharedC, collectionCats, collectionUser);

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

        const [collectionSharedC, collectionCats] = [await soda.createCollection('shrs_cat'), await soda.createCollection('user_cats')];

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

        const [collectionUser, collectionSharedC, collectionCats] = [
            await soda.createCollection('users'), await soda.createCollection('shrs_cat'), await soda.createCollection('user_cats')
        ];

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

        const [collectionCats, collectionUser, collectionSharedC, collectionNotif] = [
            await soda.createCollection('user_cats'), await soda.createCollection('users'), await soda.createCollection('shrs_cat'),
            await soda.createCollection('notifs')
        ];

        const { sWith, catId } = req.body;
        [await deleteAssigned(sWith, catId, collectionSharedC), await fileChangedU(catId, [sWith], collectionNotif)];

        const p1 = findCatById(catId, collectionCats);
        const p2 = getAllUserCatIds(catId, collectionSharedC, collectionUser);
        const [cat, arrId] = [await p1, await p2];

        var p3 = getAllUserSharedCountP(cat.org, arrId, req.token._id, collectionUser);
        var p4 = getAllUserSharedLimitP(0, cat.org, arrId, req.token._id, collectionUser);
        var p5 = getAllAssignedCount(catId, collectionSharedC);
        var p6 = getAllAssignedLimit(catId, 0, collectionSharedC, collectionUser);
        const [userCount, userList, assignedCount, assignedList] = [await p3, await p4, await p5, await p6];

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

        const [collectionCats, collectionUser, collectionSharedC, collectionNotif] = [
            await soda.createCollection('user_cats'), await soda.createCollection('users'), await soda.createCollection('shrs_cat'),
            await soda.createCollection('notifs')
        ];

        const { catId } = req.body;
        [await deleteAssignedAll(catId, collectionSharedC), await fileChanged(catId, collectionNotif)];

        const p1 = findCatById(catId, collectionCats);
        const p2 = getAllUserCatIds(catId, collectionSharedC, collectionUser);
        const [cat, arrId] = [await p1, await p2];

        var p3 = getAllUserSharedCountP(cat.org, arrId, req.token._id, collectionUser);
        var p4 = getAllUserSharedLimitP(0, cat.org, arrId, req.token._id, collectionUser);
        var p5 = getAllAssignedCount(catId, collectionSharedC);
        var p6 = getAllAssignedLimit(catId, 0, collectionSharedC, collectionUser);
        const [userCount, userList, assignedCount, assignedList] = [await p3, await p4, await p5, await p6];

        res.json({ userCount: userCount, users: userList, assigned: assignedList, assignedCount: assignedCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


module.exports = router;