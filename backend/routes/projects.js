const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    findOrganizationByIdUpt, updatePackageDetails
} = require('../schemas/organization');

const {
    findProjectByName,
    createProject,
    getAllProjectCountM,
    getAllProjectLimitM,
    getAllProjectQueryCountM,
    getAllProjectQueryLimitM,
    getProjectById,
    deleteProject,
    updateDetails
} = require('../schemas/projects');

const {
    deleteAllCatPid
} = require('../schemas/projectCategory');

const {
    getAllUserSharedCountP,
    getAllUserSharedLimitP,
    getAllUserSharedQueryCountP,
    getAllUserSharedQueryLimitP,
} = require('../schemas/user');

const {
    getAllIds,
    deleteAllByPId
} = require('../schemas/projectAssigned');

const {
    getMultipleFiles, deleteFile
} = require('../schemas/projectFile');
const { deleteObject } = require('../middlewares/oci-sdk');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');

        const { name, desc, org, orgName, active, icon } = req.body;
        const { _id } = req.token;

        let projData = {
            name: name, description: desc, icon: icon,
            org: org, orgName: orgName, managerId: _id,
            active: active, created: Date.now(), date: new Date()
        };

        let proj = await findProjectByName(name, org, collectionProj);
        if (!proj) {
            let key = await createProject(projData, collectionProj);
            projData._id = key;
            res.json({ project: projData });
        } else throw new Error('Project Already Exists');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getProjectCountM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { mId } = req.query;
        const collectionProj = await soda.createCollection('projs');

        let count = await getAllProjectCountM(mId, collectionProj);

        return res.json({ projCount: count });;
    } catch (e) {
        console.log();
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getProjectsM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');

        const { limit, mId } = req.query;
        let projList = await getAllProjectLimitM(mId, limit, collectionProj);

        return res.json({ projects: projList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchProjectCountM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');

        const { string, mId } = req.query;

        let count = await getAllProjectQueryCountM(mId, string, collectionProj);

        return res.json({ projCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchProjectM', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');

        const { limit, string, mId } = req.query;
        let projList = await getAllProjectQueryLimitM(mId, string, limit, collectionProj);

        res.json({ projects: projList })
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateProject', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');

        const { name, desc, active, icon, _id } = req.body;
        let project = await getProjectById(_id, collectionProj);

        if (!project) throw new Error('Project not found');

        let pName;

        if (project.name !== name) {
            pName = await findProjectByName(name, req.token.org, collectionProj);
        }

        if (pName) throw new Error('Project with this name already exists');

        let upt = await updateDetails(_id, name, desc, active, icon, collectionProj);

        if (!upt) throw new Error('Project details could not be updated');

        res.json({ project: upt });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getProject/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');

        const { _id } = req.params;
        const project = await getProjectById(_id, collectionProj);

        res.json({ project: project });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
})

router.get('/getProjectDesc/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');

        const { _id } = req.params;
        const project = await getProjectById(_id, collectionProj);

        res.json({ project: project });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
})

router.post('/deleteProject/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');


        const collectionCats = await soda.createCollection('proj_cats');
        const collectionFiles = await soda.createCollection('proj_files');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionProj = await soda.createCollection('projs');


        const { _id } = req.params;
        await deleteAllCatPid(_id, collectionCats);
        await deleteAllByPId(_id, collectionAss);
        var files = await getMultipleFiles(_id, collectionFiles);
        var org = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        var uploaded_data = Number(org.data_uploaded)
        var available = Number(org.available);
        var combined_plan = Number(org.combined_plan);
        var percent_left, percent_used;

        if (files && files.length > 0)
            await Promise.all(files.map(async (file) => {
                uploaded_data = uploaded_data - Number(file.size);
                available = available + Number(file.size);
                if (uploaded_data < 0) uploaded_data = 0;
                if (available > combined_plan) available = Number(combined_plan);
                percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
                if (percent_used > 100) percent_left = 100;
                percent_left = 100 - Number(percent_used);
                if (percent_left < 0) percent_left = 0;
                await deleteObject(file.url, req.token.bucket);
                await deleteFile(file._id, collectionFiles)
            }));

        if (percent_left && percent_used) await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        await deleteProject(_id, collectionProj);

        res.json({ success: 'Project deleted' });
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

        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionUser = await soda.createCollection('users');

        const { _id, pId } = req.query;
        const arrId = await getAllIds(pId, collectionAss, collectionUser);
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

        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionUser = await soda.createCollection('users');

        const { offset, _id, pId } = req.query;

        let arrId = await getAllIds(pId, collectionAss, collectionUser);
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

        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionUser = await soda.createCollection('users');

        const { string, _id, pId } = req.query;

        let arrId = await getAllIds(pId, collectionAss, collectionUser);
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

        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionUser = await soda.createCollection('users');

        const { offset, string, _id, pId } = req.query;
       
        let arrId = await getAllIds(pId, collectionAss, collectionUser);
        let userList = await getAllUserSharedQueryLimitP(offset, string, _id, arrId, req.token._id, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;