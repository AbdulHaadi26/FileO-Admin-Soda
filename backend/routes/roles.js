const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getRole,
    createRole,
    getAllRolesCount,
    getAllRoleLimit,
    getAllRoleCountQuery,
    getAllRoleLimitQuery,
    findRoleByName,
    updateCategories,
    updateValues,
    deleteRole,
    getAllRoles
} = require('../schemas/role');

const {
    createNotification, userRolesChanged
} = require('../schemas/notification');

const {
    deleteRoleMany,
    TagAllUser,
    getAllUserByRole
} = require('../schemas/user');

const {
    getAllCats,
} = require('../schemas/category');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionRole = await soda.createCollection('roles');

        const { name, list, desc } = req.body;
        const respData = { name: name, org: req.token.org, category: list, description: desc, created: Date.now(), date: new Date() };
        var role = await findRoleByName(name, req.token.org, collectionRole);
        if (!role) {
            var data = await createRole(respData, collectionRole);
            res.json({ role: data });
        } else throw new Error('Role already exists');
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

        const [collectionCat, collectionRole] = [await soda.createCollection('cats'), await soda.createCollection('roles')];

        const { _id, org } = req.query;
        const p1 = getRole(_id, collectionRole, collectionCat);
        const p2 = getAllCats(org, '' ,collectionCat);
        var [role, catList] = [await p1, await p2];
        if (!role) throw new Error('Role not found');

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

        const collectionRole = await soda.createCollection('roles');

        const { _id } = req.params;
        let role = await getAllRoles(_id, collectionRole);

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

        const collectionRole = await soda.createCollection('roles');

        const { _id, limit } = req.query;
        var p1 = getAllRoleLimit(_id, limit, collectionRole);
        var p2 = getAllRolesCount(_id, collectionRole);
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

        const collectionRole = await soda.createCollection('roles');

        const { _id, limit, string } = req.query;
        var p1 = getAllRoleLimitQuery(_id, limit, string, collectionRole);
        var p2 = getAllRoleCountQuery(_id, string, collectionRole);
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

        const [collectionCat, collectionRole, collectionNotifs, collectionUser] = [
            await soda.createCollection('cats'), await soda.createCollection('roles'), await soda.createCollection('notifs'),
            await soda.createCollection('users')
        ];

        const { _id, list, org } = req.body;
        await updateCategories(_id, list, collectionRole);
        const p1 = getRole(_id, collectionRole, collectionCat);
        const p2 = getAllCats(org, '', collectionCat);
        const p3 = getAllUserByRole(_id, org, collectionUser);
        const [role, catList, userIds] = [await p1, await p2, await p3];

        var date = parseDate();
        await userRolesChanged(userIds, 0, collectionNotifs);
        let title = `A new category has been added to your role ${role.name}`, message = `A new category has been added to your role ${role.name} on ${date}.`;
        await generateNotification(org, req.token._id, title, message, 7, 1, userIds, collectionNotifs);

        if (!role) throw new Error('Role not found');
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

router.post('/attachRoleAll', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUsers, collectionCat, collectionRole] = [await soda.createCollection('users'), await soda.createCollection('cats'), await soda.createCollection('roles')];

        const { _id, org } = req.body;
        await TagAllUser(_id, org, collectionUsers);
        const p1 = getRole(_id, collectionRole, collectionCat);
        const p2 = getAllCats(org, '', collectionCat);
        var [role, catList] = [await p1, await p2];
        if (!role) throw new Error('Role not found');
        res.json({ role: role, catList: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.delete('/deleteRole/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');
        const [collectionCat, collectionRole] = [await soda.createCollection('cats'), await soda.createCollection('roles')];

        const { _id } = req.params;
        await deleteRoleMany(_id, collectionRole, collectionCat);
        await deleteRole(_id, collectionRole);

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

        const { field, value, _id, org } = req.body;

        const [collectionCat, collectionRole] = [await soda.createCollection('cats'), await soda.createCollection('roles')];

        let err = true;
        switch (field) {
            case 'name': {
                var roleCheck = await findRoleByName(value, org, collectionRole);
                if (!roleCheck) {
                    err = false;
                    await updateValues(_id, 'name', value, collectionRole);
                }
            }; break;
            case 'description':
                await updateValues(_id, 'description', value, collectionRole);
                err = false;
                break;
        }

        const p1 = getRole(_id, collectionRole, collectionCat);
        const p2 = getAllCats(org, '', collectionCat);
        var [role, catList] = [await p1, await p2];

        if (!role) return res.json({ error: 'Role not found' });
        res.json({ role, catList, err });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;