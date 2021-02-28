const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    deleteRoleMany,
    getUserByRole
} = require('../schemas/projectAssigned');

const {
    createRole,
    findRoleByName,
    getRole,
    getAllRoles,
    getAllRolesCount,
    getAllRolesLimit,
    getAllRolesQueryCount,
    getAllRolesQueryLimit,
    updateCategories,
    updateValues,
    deleteRole,
} = require('../schemas/projectRoles');

const {
    createNotification, userRolesChanged
} = require('../schemas/notification');

const {
    getAllCats
} = require('../schemas/projectCategory');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPRoles = await soda.createCollection('proj_roles');

        const { name, _id, list, pId, desc } = req.body;

        const respData = {
            name: name, org: _id, pId: pId,
            category: list, description: desc,
            created: Date.now(), date: new Date()
        };

        var role = await findRoleByName(name, pId, collectionPRoles);
        if (!role) {
            await createRole(respData, collectionPRoles);

            res.json({ role: respData });
        } else res.json({ error: 'Role already exists' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getRole', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionPRoles, collectionPCats] = [
            await soda.createCollection('proj_roles'), await soda.createCollection('proj_cats')
        ];

        const { _id, pId } = req.query;
        const p1 = getRole(_id, collectionPRoles, collectionPCats);
        const p2 = getAllCats(pId, '' ,collectionPCats);
        var [role, catList] = [await p1, await p2];

        res.json({ role: role, catList: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getRoles/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPRoles = await soda.createCollection('proj_roles');

        const { _id } = req.params;
        var role = await getAllRoles(_id, collectionPRoles);

        res.json({ roleList: role });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchRoles', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPRoles = await soda.createCollection('proj_roles');

        const { _id, limit } = req.query;
        var p1 = getAllRolesLimit(_id, limit, collectionPRoles);
        var p2 = getAllRolesCount(_id, collectionPRoles);
        var [role, count] = [await p1, await p2];

        res.json({ roleList: role, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchRolesSearch', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPRoles = await soda.createCollection('proj_roles');

        const { _id, limit, string } = req.query;
        var p1 = getAllRolesQueryLimit(_id, limit, string, collectionPRoles);
        var p2 = getAllRolesQueryCount(_id, string, collectionPRoles);
        var [role, count] = [await p1, await p2];

        res.json({ roleList: role, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateRolesCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionPRoles, collectionPCats, collectionAss, collectionNotifs] = [
            await soda.createCollection('proj_roles'), await soda.createCollection('proj_cats'),
            await soda.createCollection('proj_assigned'), await soda.createCollection('notifs')
        ];

        const { _id, list, pId } = req.body;
        await updateCategories(_id, list, collectionPRoles);
        const p1 = getRole(_id, collectionPRoles, collectionPCats);
        const p2 = getAllCats(pId, '', collectionPCats);
        const p3 = getUserByRole(req.token.org, _id, collectionAss)
        var [role, catList, userIds] = [await p1, await p2, await p3];

        await userRolesChanged(userIds, 1, collectionNotifs);
        let date = parseDate();
        let title = `A new category has been added to your project role ${role.name}`, message = `A new category has been added to your project role ${role.name} on ${date}.`;
        await generateNotification(req.token.org, req.token._id, title, message, 7, 1, userIds, collectionNotifs);

        res.json({ role: role, catList: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function generateNotification(org, pBy, title, message, t, uT, userIds, collectionNotifs) {
    userIds && userIds.length > 0 && await Promise.all(userIds.map(async uId => {
        let data = {
            postedBy: pBy, title: title, message: message,
            recievedBy: uId, type: t, userType: uT, org: org,
            id: '', pId: '', date: new Date(), created: Date.now()
        };
        await createNotification(data, collectionNotifs);
    }));
};

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
};

router.post('/deleteRole/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionPRoles, collectionPAss] = [
            await soda.createCollection('proj_roles'), await soda.createCollection('proj_assigned')
        ];

        const { _id } = req.params;
        await deleteRoleMany(_id, collectionPAss);
        await deleteRole(_id, collectionPRoles);

        return res.json({ success: 'Role deleted' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateRole', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionPRoles, collectionPCats] = [
            await soda.createCollection('proj_roles'), await soda.createCollection('proj_cats')
        ];

        const { field, value, _id, pId } = req.body;
        switch (field) {
            case 'name': {
                let roleCheck = await findRoleByName(value, pId, collectionPRoles);
                if (!roleCheck) await updateValues(_id, field, value, collectionPRoles);
                break;
            };
            case 'description': await updateValues(_id, field, value, collectionPRoles);
                break;
        }
        const p1 = getRole(_id, collectionPRoles, collectionPCats);
        const p2 = getAllCats(pId, '', collectionPCats);
        const [role, catList] = [await p1, await p2];

        res.json({ role: role, catList: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;