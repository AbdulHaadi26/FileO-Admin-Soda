const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');
const uuidv4 = require('uuid/v4');
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    getConnection,
    closeConnection
} = require('../middlewares/oracleDB');

const RectF = require('../schemas/recentFiles');
const URectF = require('../schemas/recentUserFile');
const PRectF = require('../schemas/recentProjectFiles');

const {
    getAllProjectCountM,
    getAllProjectsOfUser
} = require('../schemas/projects');

const {
    createSession, deleteSessionByUserS,
    isSessionActive
} = require('../schemas/session');

const {
    findUserByCredentials,
    getAllUserCount,
    getProfile,
    findUserById,
    updateValue,
    findUserByEmail,
    createUser,
    updateImage
} = require('../schemas/user');

const {
    getSetting
} = require('../schemas/setting');

const {
    getAllUFileLimitDashU,
    getAllFileCountD,
    getAllFileCountOrgU,
} = require('../schemas/userFile');

const {
    getAllFileCountOrgP,
    getAllPFileDashCountU,
    getAllPFileLimitDashU
} = require('../schemas/projectFile');

const {
    getAllFileCountOrgC,
    getAllCFileDashCountU,
    getAllCFileLimitDashU
} = require('../schemas/clientFile');

const {
    getAllCatFileCount,
    getAllFileLimitDashA,
    getAllFileLimitDashU,
    getAllFileDashCountU,
} = require('../schemas/file');

const {
    findOrganizationById, findOrganizationByIdUpt,
} = require('../schemas/organization');

const {
    getAllRolesCount,
} = require('../schemas/role');

const {
    putPresignedUrl,
    deleteObject,
    copyBasicDoc,
    getBucketSize
} = require('../middlewares/oci-sdk');

const {
    updateNoteByUserName,
    updateNoteWithUserName
} = require('../schemas/sharedNote');

const {
    updateFileByUserName,
    updateFileWithUserName
} = require('../schemas/sharedFile');

const {
    getProjectManagerUserCats
} = require('../schemas/projectCategory');

const {
    getAssignedUserCats,
    getAllProjectCountP
} = require('../schemas/projectAssigned');

const {
    getEmpReqByUserId,
    createEmpReq
} = require('../schemas/empReq');

const {
    createFile,
    updateVersionId
} = require('../schemas/userFile');

router.post('/request', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionEmpReq = await soda.createCollection('emp_reqs');

        let data = {
            userId: req.token._id,
            org: req.token.org,
            created: Date.now(),
            date: new Date()
        };

        await createEmpReq(data, collectionEmpReq);

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionSet, collectionFile, collectionSets] = [
            await soda.createCollection('users'), await soda.createCollection('orgs'),
            await soda.createCollection('sets'), await soda.createCollection('user_files'), await soda.createCollection('sets')
        ];

        const { name, email, password, _id, ids, active, image, mimeType, fileSize, userType, clientView } = req.body;
        var p1 = findOrganizationByIdUpt(_id, collectionOrg);
        var p2 = getSetting(collectionSet);
        var p3 = getAllUserCount(_id, collectionUser);
        var [org, set, uCount] = [await p1, await p2, await p3];
        var size = 1;
        if (set && set.maxImageSize) size = Number(set.maxImageSize);
        if (!validateMime(mimeType, size, fileSize)) throw new Error('Image not supported');

        if (uCount && org && org.userCount && uCount >= org.userCount) throw new Error('Organization users limit reached');

        let orgName = org.name;
        let userData = {
            name, email, password, roles: ids, current_employer: _id, created: Date.now(),
            active, orgName, image, userType: Number(userType), clientView, bucketName: req.token.bucket,
            storageAvailable: 1, storageUploaded: 0, storageLimit: 1
        };

        userData.password = await bcrypt.hash(userData.password, 10);

        let user = await findUserByEmail(email, collectionUser);

        if (!user) {
            const fileName = `${uuidv4()}${name.toLowerCase().split(' ').join('-')}`;
            let key = await createUser(userData, collectionUser);

            userData.image = generateFileName(fileName, org._id, key);
            await updateImage(key, userData.image, collectionUser)

            let mydate = new Date();
            let month = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
            let str = mydate.getDate() + '-' + month + '-' + mydate.getFullYear();
            let sql = `INSERT INTO user_billing (orgId, userId, start_date) VALUES ('${req.token.org}', '${key}', '${str}')`;
            await connection.execute(sql);

            const url = await putPresignedUrl(key, userData.image, req.token.bucket);

            let fileData = {
                name: 'File-O Get Started', type: 'pdf', size: 0, mimeType: 'application/pdf', created: Date.now(),
                org: req.token.org, active: true, category: '', isVersion: false, version: 0, postedby: key,
                versionId: '', description: 'File-O Get Started Document', url: '', bucketName: req.token.bucket,
                date: new Date()
            };

            let keyF = await createFile(fileData, collectionFile);
            const fileN = `${uuidv4()}${fileData.name.toLowerCase().split(' ').join('-')}`;
            fileData.url = generateFileNameU(fileN, req.token.org, '', keyF, key);

            fileData._id = keyF;
            await updateVersionId(keyF, fileData.url, collectionFile);

            await copyBasicDoc('GetStarted.pdf', fileData.url, req.token.bucket);

            let html = `  <img src="https://demo1.file-o.com/public/static/logo.png" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3 style="font-weight:400;">Dear <b>${name}</b>,</h3>
            
            <p>You have been added as a user in File-O by the Admin of ${orgName}</p>
            <p>Below are your credentials to login to the application.</p>
            <p><b>User Name:</b>  ${name} <br/><b>Password:</b>  ${password}</p>

            <p>This is suggested that you should change the password of your File-O account as soon as you logged in to the application.</p>

            <br/>
            <a style="text-decoration: none; background-color:#54a0ff; margin-right:12px; color: white; padding:12px 36px; border-radius: 8px;" rel="noopener noreferrer" target="_blank" href="https://demo1login.file-o.com/">Login here</a>
            
            <p><br/>Thank you for using File-O. Questions or concerns? Contact <a rel="noopener noreferrer" target="_blank" href="https://www.file-o.com/support">File-O Support</a>.</p>
            <br/>

            Sincerely,
            <br/>File-O Team<br/> <br/>

            <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
            <p>File-O is an affiliate of CWare Technologies.</p>`

            let set = await getSetting(collectionSets);

            let transporter = nodeMailer.createTransport({
                service: set.service,
                auth: {
                    user: set.email,
                    pass: set.pass
                }
            });

            var mailOptions = {
                from: set.email,
                to: email,
                subject: 'File-O New User',
                html: html
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }

                if (url) res.json({ user: userData, url: url });
                else throw new Error('Could not upload user image.');
            });
        } else throw new Error('User is already registered.');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function generateFileNameU(fileName, org, catId, _id, userId) {
    return catId ? `FileO/organization/${org}/user/myspace/${userId}/category/${catId}/files/${_id}/${fileName}` :
        `FileO/organization/${org}/user/myspace/${userId}/category/files/${_id}/${fileName}`;
}

router.post('/registerN', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionFile, collectionSets] = [
            await soda.createCollection('users'), await soda.createCollection('orgs'),
            await soda.createCollection('user_files'), await soda.createCollection('sets')
        ];

        const { name, email, password, _id, ids, active, userType, clientView } = req.body;

        var p1 = findOrganizationByIdUpt(_id, collectionOrg);
        var p2 = getAllUserCount(_id, collectionUser);

        let [org, uCount] = [await p1, await p2];

        var orgName = org.name;

        if (uCount && org && org.userCount && uCount >= org.userCount) throw new Error('Organization users limit reached');

        let userData = {
            name: name, email: email, password: password, roles: ids, current_employer: _id, created: Date.now(),
            active: active, orgName: orgName, userType: Number(userType), clientView: clientView, bucketName: req.token.bucket,
            storageAvailable: 1, storageUploaded: 0, storageLimit: 1
        };

        userData.password = await bcrypt.hash(password, 10);

        let user = await findUserByEmail(email, collectionUser);

        if (!user) {
            let key = await createUser(userData, collectionUser);

            let mydate = new Date();
            let month = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
            let str = mydate.getDate() + '-' + month + '-' + mydate.getFullYear();
            let sql = `INSERT INTO user_billing (orgId, userId, start_date) VALUES ('${req.token.org}', '${key}', '${str}')`;
            await connection.execute(sql);

            let fileData = {
                name: 'File-O Get Started', type: 'pdf', size: 0, mimeType: 'application/pdf', created: Date.now(),
                org: req.token.org, active: true, category: '', isVersion: false, version: 0, postedby: key,
                versionId: '', description: 'File-O Get Started Document', url: '', bucketName: req.token.bucket, date: new Date()
            };

            let keyF = await createFile(fileData, collectionFile);
            const fileName = `${uuidv4()}${fileData.name.toLowerCase().split(' ').join('-')}`;
            fileData.url = generateFileNameU(fileName, req.token.org, '', keyF, key);

            fileData._id = keyF;
            await updateVersionId(keyF, fileData.url, collectionFile);

            await copyBasicDoc('GetStarted.pdf', fileData.url, req.token.bucket);


            let html = `<img src="https://demo1.file-o.com/public/static/logo.png" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3 style="font-weight:400;">Dear <b>${name}</b>,</h3>
            
            <p>You have been added as a user in File-O by the Admin of ${orgName}</p>
            <p>Below are your credentials to login to the application.</p>
            <p><b>User Name:</b>  ${name} <br/><b>Password:</b>  ${password}</p>

            <p>This is suggested that you should change the password of your File-O account as soon as you logged in to the application.</p>

            <br/>
            <a style="text-decoration: none; background-color:#54a0ff; margin-right:12px; color: white; padding:12px 36px; border-radius: 8px;" rel="noopener noreferrer" target="_blank" href="https://demo1login.file-o.com/">Login here</a>
            
            <p><br/>Thank you for using File-O. Questions or concerns? Contact <a rel="noopener noreferrer" target="_blank" href="https://www.file-o.com/support">File-O Support</a>.</p>
            <br/>

            Sincerely,
            <br/>File-O Team<br/> <br/>

            <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
            <p>File-O is an affiliate of CWare Technologies.</p>`

            let set = await getSetting(collectionSets);

            let transporter = nodeMailer.createTransport({
                service: set.service,
                auth: {
                    user: set.email,
                    pass: set.pass
                }
            });

            var mailOptions = {
                from: set.email,
                to: email,
                subject: 'File-O New User',
                html: html
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                }

                res.json({ user: userData });
            });
        } else throw new Error('User is already registered');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/auth', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionSes] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('sessions')
        ];

        const { email, password, screen } = req.body;

        let user = await findUserByCredentials(email, password, collectionUser, collectionOrg);
        if (!user) throw new Error('User is not registered');
        if (!user.current_employer.active) throw new Error('Organization is not active');

        let sessionActive = await isSessionActive(user._id, screen >= 992 ? 0 : 1, collectionSes);

        if (sessionActive) throw new Error('Session is already active');

        await deleteSessionByUserS(user._id, screen >= 992 ? 0 : 1, collectionSes);

        let token = jwt.sign({ _id: user._id, org: user.current_employer._id, bucket: user.bucketName }, process.env.SECRET, { expiresIn: '1d' });

        let date = new Date(Date.now());
        date = date.addHours(1);

        let data = {
            userId: user._id, name: user.name, email: user.email, screen: screen >= 992 ? 0 : 1,
            current_employer: user.current_employer._id,
            active: true, orgName: user.current_employer.name, last_updated: date,
            token: token
        };

        await createSession(data, collectionSes);

        res.status(200).json({ token: token });
    } catch (e) {
        console.log(e);
        res.status(500).json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

router.post('/logout', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const token = req.headers['authorization'];

        const [collectionSes, collectionBL] = [await soda.createCollection('sessions'), await soda.createCollection('black_list')];


        let date = new Date(Date.now());
        date = date.addHours(24);

        let dataR = {
            token: token,
            expiry: date
        };

        token && await collectionBL.insertOneAndGet(dataR);

        await collectionSes.find().filter({ token: token }).remove();

        res.json({ success: true });
    } catch (e) {
        console.log(e)
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/profile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionRoles, collectionCats] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
        ];

        var user = await getProfile(req.token._id, collectionUser, collectionOrg, collectionRoles, collectionCats);
        if (!user) throw new Error('User is not registered');
        res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateProfile', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionRoles, collectionCats, collectionSharedN, collecitonShared] = [
            await soda.createCollection('users'), await soda.createCollection('orgs'),
            await soda.createCollection('roles'), await soda.createCollection('cats'),
            await soda.createCollection('shrs_note'), await soda.createCollection('shrs')
        ];

        const { _id } = req.token;
        const { field, value } = req.body;

        if (field === 'email') {
            let userE = await findUserByEmail(value, collectionUser);
            if (userE) {
                let userTemp = await getProfile(_id, collectionUser, collectionOrg, collectionRoles, collectionCats);
                res.json({ user: userTemp });
            }
        }
        const user = await updateValue(_id, field, value, collectionUser, collectionOrg, collectionRoles, collectionCats);

        if (field === 'name') [await updateNoteByUserName(_id, value, collectionSharedN), await updateNoteWithUserName(_id, value, collectionSharedN), await updateFileByUserName(_id, value, collecitonShared), await updateFileWithUserName(_id, value, collecitonShared)];
        if (!user) throw new Error('User profile not found');

        return res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/dashboard/admin', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { org, _id } = req.token;

        const [collectionUser, collectionOrg, collectionFiles, collectionRoles, collectionCats, collectionPkgs,
            collectionUFiles, collectionPFiles, collectionCFiles, collectionUCat, collectionPCat, collectionCCat, collectionAss,
            collectionPRoles
        ] = [
                await soda.createCollection('users'), await soda.createCollection('orgs'), await soda.createCollection('files'),
                await soda.createCollection('roles'), await soda.createCollection('cats'), await soda.createCollection('pkgs'),
                await soda.createCollection('user_files'), await soda.createCollection('proj_files'), await soda.createCollection('client_files'),
                await soda.createCollection('user_cats'), await soda.createCollection('proj_cats'), await soda.createCollection('client_cats'),
                await soda.createCollection('proj_assigned'), await soda.createCollection('proj_roles')
            ];

        let assCats = await getAssignedUserCats(_id, collectionAss, collectionPRoles);

        const p1 = getAllUserCount(org, collectionUser);
        const p2 = findOrganizationById(org, collectionOrg, collectionPkgs);
        const p3 = getAllCatFileCount(org, collectionFiles);
        const p4 = getAllFileLimitDashA(org, collectionFiles, collectionCats);
        const p5 = getAllRolesCount(org, collectionRoles);
        const p6 = getAllFileCountOrgU(org, collectionUFiles);
        const p7 = getAllFileCountOrgP(org, collectionPFiles);
        const p8 = getAllFileCountOrgC(org, collectionCFiles);
        const p9 = getAllPFileLimitDashU(assCats, collectionPFiles, collectionPCat);
        const p10 = getAllUFileLimitDashU(_id, collectionUFiles, collectionUCat);
        const p11 = getAllCFileLimitDashU(_id, collectionCFiles, collectionCCat);
        const [userCount, organ, fileCount, files, roleCount, userFileCount, projectFileCount, clientFileCount, pfiles, ufiles, cfiles] = [
            await p1, await p2, await p3, await p4, await p5, await p6, await p7, await p8, await p9, await p10, await p11
        ];

        
        let fileList = [].concat(files, pfiles, ufiles, cfiles), tempList = [];

        if (fileList && fileList.length > 0) {
            tempList = fileList.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
        }

        let count = fileCount + userFileCount + projectFileCount + clientFileCount;
        if (!organ) throw new Error('Could not find organization details');

        
        organ.bucketSize = await getBucketSize(req.token.bucket);
        res.json({ success: true, userCount: userCount, fileCount: count, org: organ, fileList: tempList, roleCount: roleCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/imageUrl/sign', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { id, org, image, mimeType, fileSize } = req.body;
        var size = 1;
        const collection = await soda.createCollection('sets');
        const set = await getSetting(collection);

        if (set && set.maxImageSize) size = Number(set.maxImageSize);
        if (!validateMime(mimeType, size, fileSize)) throw new Error('Image type not supported');
        const fileName = `${uuidv4()}${image.toLowerCase().split(' ').join('-')}`;
        const key = generateFileName(fileName, org, id);
        const url = await putPresignedUrl(id, key, req.token.bucket);

        if (url) res.json({ url: url, key: key });
        else throw new Error('Could not upload user image');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/uploadImage', JWT, async (req, res, next) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionUser, collectionOrg, collectionRoles, collectionCats] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
        ];

        const { _id, key } = req.body;
        const userT = await findUserById(_id, collectionUser);
        if (!userT) throw new Error('User profile not found');
        if (userT.image) await deleteObject(userT.image, req.token.bucket);
        const user = await updateValue(_id, 'image', key, collectionUser, collectionOrg, collectionRoles, collectionCats);

        if (!user) throw new Error('User profile not found');
        res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/dashboard/manager', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFiles, collectionProj, collectionUFiles, collectionCFiles,
            collectionPFiles, collectionCat, collectionUCat, collectionPCat, collectionCCat, collectionEmpReq] = [
                await soda.createCollection('files'), await soda.createCollection('projs'), await soda.createCollection('user_files'),
                await soda.createCollection('client_files'), await soda.createCollection('proj_files'), await soda.createCollection('cats'),
                await soda.createCollection('user_cats'), await soda.createCollection('proj_cats'), await soda.createCollection('client_cats'),
                await soda.createCollection('emp_reqs')
            ];

        const { _id, org } = req.token;
        let { cats } = req.query;

        let pIds = await getAllProjectsOfUser(_id, collectionProj);
        let assCats = await getProjectManagerUserCats(pIds, collectionPCat);

        const p1 = getAllFileLimitDashU(org, cats, collectionFiles, collectionCat);
        const p2 = getAllFileCountD(_id, collectionUFiles);
        const p3 = getAllProjectCountM(_id, collectionProj);
        const p4 = getAllFileDashCountU(org, cats, collectionFiles);
        const p5 = getAllPFileDashCountU(assCats, collectionPFiles);
        const p6 = getAllCFileDashCountU(_id, collectionCFiles);
        const p7 = getAllPFileLimitDashU(assCats, collectionPFiles, collectionPCat);
        const p8 = getAllUFileLimitDashU(_id, collectionUFiles, collectionUCat);
        const p9 = getAllCFileLimitDashU(_id, collectionCFiles, collectionCCat);
        const p10 = getEmpReqByUserId(_id, collectionEmpReq);
        const [files, fileCount, projectCount, ufileCount, pfileCount, cfileCount, pfiles, ufiles, cfiles, empReq] =
            [await p1, await p2, await p3, await p4, await p5, await p6, await p7, await p8, await p9, await p10];

        let fileList = [].concat(files, pfiles, ufiles, cfiles), tempList = [];

        if (fileList && fileList.length > 0) {
            tempList = fileList.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
        }

        let count = fileCount + ufileCount + pfileCount + cfileCount;
        res.json({ success: true, fileList: tempList, fileCount: count, projectCount, empReq: empReq });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/dashboard/user', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionFiles, collectionUFiles, collectionAss, collectionRoles, collectionCFiles,
            collectionPFiles, collectionCat, collectionUCat, collectionPCat, collectionCCat, collectionEmpReq] = [
                await soda.createCollection('files'), await soda.createCollection('user_files'), await soda.createCollection('proj_assigned'),
                await soda.createCollection('proj_roles'), await soda.createCollection('client_files'),
                await soda.createCollection('proj_files'), await soda.createCollection('cats'), await soda.createCollection('user_cats'),
                await soda.createCollection('proj_cats'), await soda.createCollection('client_cats'), await soda.createCollection('emp_reqs')
            ];

        const { _id, org } = req.token;
        var { cats } = req.query;

        let assCats = await getAssignedUserCats(_id, collectionAss, collectionRoles);

        const p1 = getAllFileLimitDashU(org, cats, collectionFiles, collectionCat);
        const p2 = getAllFileCountD(_id, collectionUFiles);
        const p3 = getAllProjectCountP(_id, collectionAss);
        const p4 = getAllFileDashCountU(org, cats, collectionFiles);
        const p5 = getAllPFileDashCountU(assCats, collectionPFiles);
        const p6 = getAllCFileDashCountU(_id, collectionCFiles);
        const p7 = getAllPFileLimitDashU(assCats, collectionPFiles, collectionPCat);
        const p8 = getAllUFileLimitDashU(_id, collectionUFiles, collectionUCat);
        const p9 = getAllCFileLimitDashU(_id, collectionCFiles, collectionCCat);
        const p10 = getEmpReqByUserId(_id, collectionEmpReq);
        const [files, fileCount, projectCount, ufileCount, pfileCount, cfileCount, pfiles, ufiles, cfiles, empReq] =
            [await p1, await p2, await p3, await p4, await p5, await p6, await p7, await p8, await p9, await p10];

        let totalFile = [].concat(files, pfiles, ufiles, cfiles);
        let count = fileCount + ufileCount + pfileCount + cfileCount;
        res.json({ success: true, fileList: totalFile, fileCount: count, projectCount, empReq: empReq });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/recentFilesDate', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [
            collectionRecfs, collectionFiles, collectionURecfs,
            collectionUFiles, collectionPRecfs, collectionPFiles
        ] = [
                await soda.createCollection('recfs'), await soda.createCollection('files'), await soda.createCollection('urecfs'),
                await soda.createCollection('user_files'), await soda.createCollection('precfs'), await soda.createCollection('proj_files')
            ];

        const { _id } = req.token;

        const p1 = RectF.getMostRecentDate(_id, collectionRecfs, collectionFiles);
        const p2 = URectF.getMostRecentDate(_id, collectionURecfs, collectionUFiles);
        const p3 = PRectF.getMostRecentDate(_id, collectionPRecfs, collectionPFiles);

        const [files, userFiles, projectFiles] = [await p1, await p2, await p3];

        let fileList = [].concat(files, userFiles, projectFiles);
        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function validateMime(type, size, expectedSize) {
    return (type === "image/png" || type === "image/jpg" || type === "image/jpeg" || type === 'image/x-png' || type === 'image/gif') && (size <= expectedSize) ? true : false;
}

function generateFileName(fileName, id, _id) {
    return `FileO/organization/${id}/images/user/${_id}/${fileName}`;
}

module.exports = router;