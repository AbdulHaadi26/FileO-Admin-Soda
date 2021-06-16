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
    createSession, deleteSessionByUserS
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
    getAllFileCountTypeU,
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
    getAllFileCountType,
} = require('../schemas/file');

const {
    findOrganizationById, findOrganizationByIdUpt,
} = require('../schemas/organization');

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
    getProjectManagerUserCats,
    getAssignedUserCats
} = require('../schemas/projectCategory');

const {
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
const { baseUrl, fileOUrl, logoUrl } = require('../constants');

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

        const collectionUser = await soda.createCollection('user');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSet = await soda.createCollection('sets');
        const collectionFile = await soda.createCollection('user_files');


        const { name, email, password, _id, active, image, mimeType, fileSize, userType, clientView } = req.body;

        let org = await findOrganizationById(_id, collectionOrg);
        let set = await getSetting(collectionSet);
        let uCount = await getAllUserCount(_id, collectionUser);

        var size = 1;
        if (set && set.maxImageSize) size = Number(set.maxImageSize);

        if (!validateMime(mimeType, size, fileSize)) throw new Error('Image not supported');

        if (uCount && org && org.userCount && uCount >= org.userCount) throw new Error('Organization users limit reached');

        let orgName = org.name;
        let userData = {
            name, email, password, current_employer: _id, created: Date.now(),
            active, orgName, image, userType: Number(userType), clientView, bucketName: req.token.bucket,
            storageAvailable: 1, storageUploaded: 0, storageLimit: 1, flag: 'B'
        };

        userData.password = await bcrypt.hash(userData.password, 10);

        let user = await findUserByEmail(email, collectionUser);

        if (!user) {
            const fileName = `${name.toLowerCase().split(' ').join('-')}`;
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
            const fileN = fileData.name;
            fileData.url = generateFileNameU(fileN, req.token.org, '', keyF, key);

            fileData._id = keyF;
            await updateVersionId(keyF, fileData.url, collectionFile);

            await copyBasicDoc('GetStarted.pdf', fileData.url, req.token.bucket);

            let html = `  <img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3 style="font-weight:400;">Dear <b>${name}</b>,</h3>
            
            <p>You have been added as a user in File-O by the Admin of ${orgName}</p>
            <p>Below are your credentials to login to the application.</p>
            <p><b>User Name:</b>  ${name} <br/><b>Password:</b>  ${password}</p>

            <p>This is suggested that you should change the password of your File-O account as soon as you logged in to the application.</p>

            <br/>
            <a style="text-decoration: none; background-color:#54a0ff; margin-right:12px; color: white; padding:12px 36px; border-radius: 8px;" rel="noopener noreferrer" target="_blank" href="${baseUrl}">Login here</a>
            
            <p><br/>Thank you for using File-O. Questions or concerns? Contact <a rel="noopener noreferrer" target="_blank" href="${fileOUrl}/support">File-O Support</a>.</p>
            <br/>

            Sincerely,
            <br/>File-O Team<br/> <br/>

            <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
            <p>File-O is an affiliate of CWare Technologies.</p>`

            let set = await getSetting(collectionSet);

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

            });

            if (url) res.json({ user: userData, url: url });
            else throw new Error('Could not upload user image.');
        } else throw new Error('User is already registered.');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function generateFileNameU(fileName, org, catId, _id, userId) {
    return catId ? `FileO/organization/${org}/user/myspace/${userId}/category/${catId}/files/${_id}/${uuidv4()}/${fileName}` :
        `FileO/organization/${org}/user/myspace/${userId}/category/files/${_id}/${uuidv4()}/${fileName}`;
}

router.post('/registerN', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionFile = await soda.createCollection('user_files');
        const collectionSets = await soda.createCollection('sets');

        const { name, email, password, _id, active, userType, clientView } = req.body;

        let org = await findOrganizationByIdUpt(_id, collectionOrg);
        let uCount = await getAllUserCount(_id, collectionUser);

        var orgName = org.name;

        if (uCount && org && org.userCount && uCount >= org.userCount) throw new Error('Organization users limit reached');

        let userData = {
            name: name, email: email, password: password, current_employer: _id, created: Date.now(),
            active: active, orgName: orgName, userType: Number(userType), clientView: clientView, bucketName: req.token.bucket,
            storageAvailable: 1, storageUploaded: 0, storageLimit: 1, flag: 'B'
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
            const fileName = fileData.name;
            fileData.url = generateFileNameU(fileName, req.token.org, '', keyF, key);

            fileData._id = keyF;
            await updateVersionId(keyF, fileData.url, collectionFile);

            await copyBasicDoc('GetStarted.pdf', fileData.url, req.token.bucket);

            let html = `<img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3 style="font-weight:400;">Dear <b>${name}</b>,</h3>
            
            <p>You have been added as a user in File-O by the Admin of ${orgName}</p>
            <p>Below are your credentials to login to the application.</p>
            <p><b>User Name:</b>  ${name} <br/><b>Password:</b>  ${password}</p>

            <p>This is suggested that you should change the password of your File-O account as soon as you logged in to the application.</p>

            <br/>
            <a style="text-decoration: none; background-color:#54a0ff; margin-right:12px; color: white; padding:12px 36px; border-radius: 8px;" rel="noopener noreferrer" target="_blank" href="${baseUrl}">Login here</a>
            
            <p><br/>Thank you for using File-O. Questions or concerns? Contact <a rel="noopener noreferrer" target="_blank" href="${fileOUrl}/support">File-O Support</a>.</p>
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

            });

            res.json({ user: userData });
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

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSes = await soda.createCollection('sessions');

        const { email, password, screen } = req.body;

        let user = await findUserByCredentials(email, password, collectionUser, collectionOrg);

        if (!user) throw new Error('User is not registered');
        if (user.flag === 'B' && !user.current_employer.active) throw new Error('Organization is not active');

        await deleteSessionByUserS(user._id, screen >= 992 ? 0 : 1, collectionSes);

        let token;

        if (user.flag === 'P')
            token = jwt.sign({ _id: user._id, bucket: user.bucketName }, process.env.SECRET, { expiresIn: '1d' });
        else {
            token = jwt.sign({ _id: user._id, org: user.current_employer._id, bucket: user.bucketName }, process.env.SECRET, { expiresIn: '1d' });
        }

        let date = new Date(Date.now());
        date = date.addHours(0.5);

        let data = {
            userId: user._id, name: user.name, email: user.email, screen: screen >= 992 ? 0 : 1,
            current_employer: user.current_employer ? user.current_employer._id : '',
            active: true, orgName: user.current_employer ? user.current_employer.name : '', last_updated: date,
            token: token
        };

        await createSession(data, collectionSes);

        res.status(200).json({ token: token });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
};

router.post('/logout', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const token = req.headers['authorization'];

        const collectionSes = await soda.createCollection('sessions');
        const collectionBL = await soda.createCollection('black_list');

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

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');

        let user = await getProfile(req.token._id, collectionUser, collectionOrg);

        if (user.flag === 'P') {
            user.bucketSize = await getBucketSize(req.token.bucket);
        }

        if (!user) throw new Error('User is not registered');

        res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/bill', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionBilling = await soda.createCollection('billing_ep');
        const collectionUser = await soda.createCollection('users');

        let user = await findUserById(req.token._id, collectionUser);

        let billCount;
        if (user && user.flag === 'P') {
            billCount = await collectionBilling.find().filter({ orgId: req.token._id, status: 'Unpaid', date: { $lte: date } }).count();
        } else {

            billCount = await collectionBilling.find().filter({ orgId: req.token.org, status: 'Unpaid', date: { $lte: date } }).count();
        }

        let date = new Date(Date.now());

        let count = 0;
        if (billCount && billCount.count) count = billCount.count;

        res.json({ count, date });
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

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSharedN = await soda.createCollection('shrs_note');
        const collecitonShared = await soda.createCollection('shrs');

        const { _id } = req.token;
        const { field, value } = req.body;

        if (field === 'email') {
            let userE = await findUserByEmail(value, collectionUser);
            if (userE) {
                let userTemp = await getProfile(_id, collectionUser, collectionOrg);
                res.json({ user: userTemp });
            }
        }

        const user = await updateValue(_id, field, value, collectionUser, collectionOrg);

        if (user.flag === 'P') {
            user.bucketSize = await getBucketSize(req.token.bucket);
        }

        if (user.flag === 'B') {
            if (field === 'name') {
                await updateNoteByUserName(_id, value, collectionSharedN);
                await updateNoteWithUserName(_id, value, collectionSharedN);
                await updateFileByUserName(_id, value, collecitonShared);
                await updateFileWithUserName(_id, value, collecitonShared);
            }
        }

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

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionFiles = await soda.createCollection('files');
        const collectionCats = await soda.createCollection('cats');
        const collectionPkgs = await soda.createCollection('pkgs');
        const collectionUFiles = await soda.createCollection('user_files');
        const collectionPFiles = await soda.createCollection('proj_files');
        const collectionCFiles = await soda.createCollection('client_files');
        const collectionUCat = await soda.createCollection('user_cats');
        const collectionPCat = await soda.createCollection('proj_cats');
        const collectionCCat = await soda.createCollection('client_cats');

        let assCats = await getAssignedUserCats(_id, collectionPCat);

        let userCount = await getAllUserCount(org, collectionUser);
        let organ = await findOrganizationById(org, collectionOrg, collectionPkgs);
        let fileCount = await getAllCatFileCount(org, collectionFiles);
        let files = await getAllFileLimitDashA(org, collectionFiles, collectionCats);
        let userFileCount = await getAllFileCountOrgU(org, collectionUFiles);
        let projectFileCount = await getAllFileCountOrgP(org, collectionPFiles);
        let clientFileCount = await getAllFileCountOrgC(org, collectionCFiles);
        let pfiles = await getAllPFileLimitDashU(assCats, collectionPFiles, collectionPCat);
        let ufiles = await getAllUFileLimitDashU(_id, collectionUFiles, collectionUCat);
        let cfiles = await getAllCFileLimitDashU(_id, collectionCFiles, collectionCCat);
        let docCount = await getAllFileCountType(org, ['pdf', 'word', 'excel', 'powerpoint', 'text'], collectionFiles);
        let mediaCount = await getAllFileCountType(org, ['video', 'audio'], collectionFiles);
        let otherCount = await getAllFileCountType(org, ['others'], collectionFiles);
        let imageCount = await getAllFileCountType(org, ['image'], collectionFiles);

        let fileList = [].concat(files, pfiles, ufiles, cfiles), tempList = [];

        if (fileList && fileList.length > 0) {
            tempList = fileList.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
        }

        let count = fileCount + userFileCount + projectFileCount + clientFileCount;
        if (!organ) throw new Error('Could not find organization details');

        organ.bucketSize = await getBucketSize(req.token.bucket);

        res.json({ success: true, userCount: userCount, fileCount: count, org: organ, fileList: tempList, docCount, mediaCount, imageCount, otherCount, orgFileCount: fileCount });
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

        let fileName = `${image.toLowerCase().split(' ').join('-')}`;
        let key = generateFileName(fileName, org, id);
        let url = await putPresignedUrl(id, key, req.token.bucket);

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

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');

        const { _id, key } = req.body;
        const userT = await findUserById(_id, collectionUser);

        if (!userT) throw new Error('User profile not found');
        if (userT.image) await deleteObject(userT.image, req.token.bucket);

        const user = await updateValue(_id, 'image', key, collectionUser, collectionOrg);

        if (user.flag === 'P') {
            user.bucketSize = await getBucketSize(req.token.bucket);
        }

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

        const collectionFiles = await soda.createCollection('files');
        const collectionProj = await soda.createCollection('projs');
        const collectionUFiles = await soda.createCollection('user_files');
        const collectionCFiles = await soda.createCollection('client_files');
        const collectionPFiles = await soda.createCollection('proj_files');
        const collectionCat = await soda.createCollection('cats');
        const collectionUCat = await soda.createCollection('user_cats');
        const collectionPCat = await soda.createCollection('proj_cats');
        const collectionCCat = await soda.createCollection('client_cats');
        const collectionEmpReq = await soda.createCollection('emp_reqs');

        const { _id, org } = req.token;
        let { cats } = req.query;

        let pIds = await getAllProjectsOfUser(_id, collectionProj);
        let assCats = await getProjectManagerUserCats(pIds, collectionPCat);

        let files = await getAllFileLimitDashU(org, cats, collectionFiles, collectionCat);
        let fileCount = await getAllFileCountD(_id, collectionUFiles);
        let projectCount = await getAllProjectCountM(_id, collectionProj);
        let ufileCount = await getAllFileDashCountU(org, cats, collectionFiles);
        let pfileCount = await getAllPFileDashCountU(assCats, collectionPFiles);
        let cfileCount = await getAllCFileDashCountU(_id, collectionCFiles);
        let pfiles = await getAllPFileLimitDashU(assCats, collectionPFiles, collectionPCat);
        let ufiles = await getAllUFileLimitDashU(_id, collectionUFiles, collectionUCat);
        let cfiles = await getAllCFileLimitDashU(_id, collectionCFiles, collectionCCat);
        let empReq = await getEmpReqByUserId(_id, collectionEmpReq);
        let docCount = await getAllFileCountTypeU(_id, ['pdf', 'word', 'excel', 'powerpoint', 'text'], collectionUFiles);
        let mediaCount = await getAllFileCountTypeU(_id, ['video', 'audio'], collectionUFiles);
        let otherCount = await getAllFileCountTypeU(_id, ['others'], collectionUFiles);
        let imageCount = await getAllFileCountTypeU(_id, ['image'], collectionUFiles);

        let fileList = [].concat(files, pfiles, ufiles, cfiles), tempList = [];

        if (fileList && fileList.length > 0) {
            tempList = fileList.sort(function (a, b) {
                return new Date(b.date) - new Date(a.date);
            });
        }

        let count = fileCount + ufileCount + pfileCount + cfileCount;
        res.json({ success: true, fileList: tempList, fileCount: count, projectCount, empReq: empReq, orgFileCount: fileCount, docCount, mediaCount, otherCount, imageCount });
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

        const collectionFiles = await soda.createCollection('files');
        const collectionUFiles = await soda.createCollection('user_files');
        const collectionAss = await soda.createCollection('proj_assigned');
        const collectionCFiles = await soda.createCollection('client_files');
        const collectionPFiles = await soda.createCollection('proj_files');
        const collectionCat = await soda.createCollection('cats');
        const collectionUCat = await soda.createCollection('user_cats');
        const collectionPCat = await soda.createCollection('proj_cats');
        const collectionCCat = await soda.createCollection('client_cats');
        const collectionEmpReq = await soda.createCollection('emp_reqs');

        const { _id, org } = req.token;
        let { cats } = req.query;

        let assCats = await getAssignedUserCats(_id, collectionPCat);

        let files = await getAllFileLimitDashU(org, cats, collectionFiles, collectionCat);
        let fileCount = await getAllFileCountD(_id, collectionUFiles);
        let projectCount = await getAllProjectCountP(_id, collectionAss);
        let ufileCount = await getAllFileDashCountU(org, cats, collectionFiles);
        let pfileCount = await getAllPFileDashCountU(assCats, collectionPFiles);
        let cfileCount = await getAllCFileDashCountU(_id, collectionCFiles);
        let pfiles = await getAllPFileLimitDashU(assCats, collectionPFiles, collectionPCat);
        let ufiles = await getAllUFileLimitDashU(_id, collectionUFiles, collectionUCat);
        let cfiles = await getAllCFileLimitDashU(_id, collectionCFiles, collectionCCat);
        let empReq = await getEmpReqByUserId(_id, collectionEmpReq);
        let docCount = await getAllFileCountTypeU(_id, ['pdf', 'word', 'excel', 'powerpoint', 'text'], collectionUFiles);
        let mediaCount = await getAllFileCountTypeU(_id, ['video', 'audio'], collectionUFiles);
        let otherCount = await getAllFileCountTypeU(_id, ['others'], collectionUFiles);
        let imageCount = await getAllFileCountTypeU(_id, ['image'], collectionUFiles);

        let totalFile = [].concat(files, pfiles, ufiles, cfiles);
        let count = fileCount + ufileCount + pfileCount + cfileCount;
        res.json({ success: true, fileList: totalFile, fileCount: count, projectCount, empReq: empReq, orgFileCount: fileCount, docCount, mediaCount, otherCount, imageCount });
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

        const collectionRecfs = await soda.createCollection('recfs');
        const collectionFiles = await soda.createCollection('files');
        const collectionURecfs = await soda.createCollection('urecfs');
        const collectionUFiles = await soda.createCollection('user_files');
        const collectionPRecfs = await soda.createCollection('precfs');
        const collectionPFiles = await soda.createCollection('proj_files');

        const { _id } = req.token;

        let files = await RectF.getMostRecentDate(_id, collectionRecfs, collectionFiles);
        let userFiles = await URectF.getMostRecentDate(_id, collectionURecfs, collectionUFiles);
        let projectFiles = await PRectF.getMostRecentDate(_id, collectionPRecfs, collectionPFiles);

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
    return `FileO/organization/${id}/images/user/${_id}/${uuidv4()}/${fileName}`;
}

module.exports = router;