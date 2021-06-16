const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');
const nodeMailer = require('nodemailer');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getAllProjectCountP,
    getAllProjectLimitP,
    getAllProjectQueryCountP,
    getAllProjectQueryLimitP,
    getAssignedUserById,
    isExist,
    createProjAssigned,
    getAllUserCountP,
    getAllUserLimitP,
    getAllUserQueryCountP,
    getAllUserQueryLimitP
} = require('../schemas/projectAssigned');

const {
    getProjectById
} = require('../schemas/projects');

const {
    updateFvrFileU
} = require('../schemas/favrFiles');

const {
    updateRecFileU
} = require('../schemas/recentProjectFiles');
const { createNotification } = require('../schemas/notification');
const { findUserById } = require('../schemas/user');
const { getSetting } = require('../schemas/setting');
const { fileOUrl, baseUrl, logoUrl } = require('../constants');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProjs = await soda.createCollection('projs');
        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionSets = await soda.createCollection('sets');
        const collectionUser = await soda.createCollection('users');

        const { name, org, userId, pId, orgName } = req.body;

        let project = await getProjectById(pId, collectionProjs);

        if (!project) throw new Error('Project not found.');

        let isEx = await isExist(userId, org, pId, collectionAss);
        let user = await findUserById(userId, collectionUser);
        let projectManager = await findUserById(project.managerId, collectionUser);

        if (!isEx && user && projectManager) {
            let projData = {
                projId: pId, orgName: orgName, org: org, userId: userId, created: Date.now(), date: new Date(),
                userName: name, projName: project.name
            };

            await createProjAssigned(projData, collectionAss);

            var date = parseDate();
            var title = `Project Manager has added you in project ${project.name}`, message = `Project Manager ${projectManager.name} has added you in project ${project.name} a on ${date}.`;
            await generateNotification(org, project.managerId, title, message, 6, 1, userId, pId, collectionNotifs);

            let set = await getSetting(collectionSets);

            let transporter = nodeMailer.createTransport({
                service: set.service,
                auth: {
                    user: set.email,
                    pass: set.pass
                }
            });

            let mailOptions = {
                from: set.email,
                to: user.email,
                subject: 'File-O Projects',
                html: `
                <img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
                <h2 style="margin-left: 50%;">File-O</h2>
                <br/>
                <h3 style="font-weight:400;">Dear <b>${user.name}</b>,</h3>
            
                <p>You have been added as a participant in ${project.name} by ${projectManager.name} in File-O. </p>
                <p> 
                    <a rel="noopener noreferrer" target="_blank" href="${baseUrl}">Login</a> now to know more about this project, your role and the files related to your role.
                </p>

                <p>Thank you for using File-O. Questions or concerns? Contact <a rel="noopener noreferrer" target="_blank" href="${fileOUrl}/support">File-O Support</a>.</p>
                <br/>

                Sincerely,
                <br/>File-O Team<br/> <br/>

                <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
                <p>File-O is an affiliate of CWare Technologies.</p>
            `};

            transporter.sendMail(mailOptions, async function (error, info) {

            });

            res.json({ assigned: projData });
        } else throw new Error('User already assigned to project');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function generateNotification(org, pBy, title, message, t, uT, uId, pId, collectionNotifs) {
    let data = {
        postedBy: pBy, title: title, message: message,
        recievedBy: uId, type: t, userType: uT, org: org,
        id: '', pId: pId, date: new Date(), created: Date.now()
    };
    await createNotification(data, collectionNotifs);
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

router.get('/getEmployee', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionUser = await soda.createCollection('users');

        const { _id, pId } = req.query;
        let user = await getAssignedUserById(_id, pId, collectionAss, collectionUser);

        res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getUser/:pId', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionUser = await soda.createCollection('users');

        const { _id } = req.token;
        const { pId } = req.params;

        let user = await getAssignedUserById(_id, pId, collectionAss, collectionUser);

        if (!user) throw new Error('Could not find employee.');

        res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteAssigned', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionPRecfs = await soda.createCollection('precfs');
        const collectionFvrFiles = await soda.createCollection('favr_files');

        const { _id, pId } = req.body;
        await collectionAss.find().filter({ userId: _id, projId: pId }).remove();

        await updateRecFileU(_id, pId, collectionPRecfs);
        await updateFvrFileU(_id, pId, collectionFvrFiles);

        return res.json({ success: true });
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

        const { pId } = req.query;

        let count = await getAllUserCountP(pId, [], collectionAss);

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

        const { offset, pId } = req.query;
        let userList = await getAllUserLimitP(offset, pId, [], collectionAss, collectionUser);

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

        const { string, pId } = req.query;
        let count = await getAllUserQueryCountP(string, pId, [], collectionAss);

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

        const { offset, string, pId } = req.query;
        let userList = await getAllUserQueryLimitP(offset, string, pId, [], collectionAss, collectionUser);

        return res.json({ users: userList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getProjectCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAssigned = await soda.createCollection('proj_assigned');

        const { uId } = req.query;
        let count = await getAllProjectCountP(uId, collectionAssigned);

        return res.json({ projCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getProjects', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');
        const collectionAssigned = await soda.createCollection('proj_assigned');

        const { limit, uId } = req.query;

        let projList = await getAllProjectLimitP(limit, uId, collectionAssigned, collectionProj);

        return res.json({ projects: projList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchProjectCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionAssigned = await soda.createCollection('proj_assigned');

        const { string, uId } = req.query;
        let count = await getAllProjectQueryCountP(string, uId, collectionAssigned);

        return res.json({ projCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchProjects', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionProj = await soda.createCollection('projs');
        const collectionAssigned = await soda.createCollection('proj_assigned');

        const { limit, string, uId } = req.query;
        let projList = await getAllProjectQueryLimitP(limit, string, uId, collectionAssigned, collectionProj);

        return res.json({ projects: projList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;
