const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');

const {
    putPresignedUrl
} = require('../../middlewares/oci-sdk');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../middlewares/oracleDB');

const {
    isExpired
} = require('../../schemas/clientApp/sharedClientLink');

const {
    findUserById,
    updateStorage
} = require('../../schemas/clientApp/user');


const UserB = require('../../schemas/personal/schemas/user');

const {
    findOrgById,
    updatePackageDetails
} = require('../../schemas/clientApp/organization');

const {
    getSetting
} = require('../../schemas/clientApp/setting');

const {
    findFileByName,
    createFile,
    updateUrl
} = require('../../schemas/clientApp/clientFile');

const {
    createNotification
} = require('../../schemas/clientApp/notification');

router.put('/:postedby/category/:category/file/upload', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('client_files');
        const collectionLink = await soda.createCollection('client_links');
        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSet = await soda.createCollection('sets');
        const collectionNotifs = await soda.createCollection('notifs');
        const collectionCat = await soda.createCollection('client_cats');

        const { postedby, category } = req.params;

        const { name, size, type, description, mime, fName, uname, email, contact } = req.body;

        const isEXP = await isExpired(postedby, category, collectionLink);

        if (!isEXP) return res.json({ error: 2 });

        var dataSize = size / (1024 * 1024 * 1024);
        var fileSize = 5;

        const user = await findUserById(postedby, collectionUser);

        let set = await getSetting(collectionSet);

        if (user.flag === 'B') {
            var org = user.current_employer;
            var organ = await findOrgById(org, collectionOrg);
            var file = await findFileByName(name, user._id, category, collectionFile);

            if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
            if (dataSize > fileSize) return res.json({ error: 3 });
            if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 4 });
            if (file) return res.json({ error: 5 });

            var fileData = {
                name: name, mimeType: mime, type: type, size: dataSize, postedFor: postedby, date: new Date(),
                org: org, category: category, description: description, url: '', postedBy: uname, created: Date.now(),
                email: email, contact: contact, bucketName: `${organ.bucketName}`, isVersion: false, version: 0,
                updated: true,
            };

            var key = await createFile(fileData, collectionFile);
            await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
            await updateUserStorage(postedby, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser);

            var fileName = fName;
            fileData.url = generateFileName(fileName, org, category, key, postedby);

            if (category) {
                var catDoc = await collectionCat.find().fetchArraySize(0).key(category).getOne();
                if (catDoc) {
                    var tempCat = catDoc.getContent();
                    tempCat.updated = true;
                    await collectionCat.find().fetchArraySize(0).key(category).replaceOne(tempCat);
                }
            }

            await updateUrl(key, fileData.url, collectionFile);

            var url = await putPresignedUrl(key, fileData.url, `${organ.bucketName}`);

            var date = parseDate();
            var title = "Client has uploaded a file.", message = `File ${fileData.name} has been added to File-O by the client on ${date} in client requests.`;
            await generateNotification(org, postedby, title, message, 8, 0, key, date, type, collectionNotifs);

            if (url) res.status(200).json({ file: fileData, url: url });
            else res.json({ error: 6 });

        } else {
            var file = await findFileByName(name, user._id, category, collectionFile);

            if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
            if (dataSize > fileSize) return res.json({ error: 3 });
            if (user.available < dataSize) return res.json({ error: 4 });
            if (file) return res.json({ error: 5 });

            var fileData = {
                name: name, mimeType: mime, type: type, size: dataSize, postedFor: postedby, date: new Date(),
                flag: 'P', category: category, description: description, url: '', postedBy: uname, created: Date.now(),
                email: email, contact: contact, bucketName: `${user.bucketName}`, isVersion: false, version: 0,
                updated: true,
            };

            var key = await createFile(fileData, collectionFile);

            await updateUserStorageB(user._id, user.data_uploaded, user.available, user.combined_plan, dataSize, collectionUser);

            var fileName = fName;
            fileData.url = generateFileName(fileName, '', category, key, postedby);

            if (category) {
                var catDoc = await collectionCat.find().fetchArraySize(0).key(category).getOne();
                if (catDoc) {
                    var tempCat = catDoc.getContent();
                    tempCat.updated = true;
                    await collectionCat.find().fetchArraySize(0).key(category).replaceOne(tempCat);
                }
            }

            await updateUrl(key, fileData.url, collectionFile);

            var url = await putPresignedUrl(key, fileData.url, `${user.bucketName}`);

            var date = parseDate();
            var title = "Client has uploaded a file.", message = `File ${fileData.name} has been added to File-O by the client on ${date} in client requests.`;
            await generateNotificationB(postedby, title, message, 8, 0, key, date, type, collectionNotifs);

            if (url) res.status(200).json({ file: fileData, url: url });
            else res.json({ error: 6 });

        }


    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.put('/:postedby/file/upload', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('client_files');
        const collectionLink = await soda.createCollection('client_links');
        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSet = await soda.createCollection('sets');
        const collectionNotifs = await soda.createCollection('notifs');


        let category = '';

        const { postedby } = req.params;
        const { name, size, type, description, mime, fName, uname, email, contact } = req.body;

        const isEXP = await isExpired(postedby, category, collectionLink);

        if (!isEXP) return res.json({ error: 2 });

        var dataSize = size / (1024 * 1024 * 1024);
        var fileSize = 5;

        const user = await findUserById(postedby, collectionUser);


        if (user.flag === 'B') {
            var org = user.current_employer;

            var organ = await findOrgById(org, collectionOrg);
            var file = await findFileByName(name, user._id, category, collectionFile);
            var set = await getSetting(collectionSet);

            if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
            if (dataSize > fileSize) return res.json({ error: 3 });
            if (organ.available < dataSize || user.storageAvailable < dataSize) return res.json({ error: 4 });
            if (file) return res.json({ error: 5 });

            var fileData = {
                name: name, mimeType: mime, type: type, size: dataSize, postedFor: postedby, date: new Date(),
                org: org, category: category, description: description, url: '', postedBy: uname, created: Date.now(),
                email: email, contact: contact, bucketName: `${organ.bucketName}`, isVersion: false, version: 0,
                updated: true,
            };

            var key = await createFile(fileData, collectionFile);
            await updateOrganizationStorage(org, organ.data_uploaded, organ.available, organ.combined_plan, dataSize, collectionOrg);
            await updateUserStorage(postedby, user.storageUploaded, user.storageAvailable, user.storageLimit, dataSize, collectionUser);

            var fileName = fName;
            fileData.url = generateFileName(fileName, org, category, key, postedby);

            await updateUrl(key, fileData.url, collectionFile);

            var url = await putPresignedUrl(key, fileData.url, `${organ.bucketName}`);

            var date = parseDate();
            var title = "Client has uploaded a new file to your folder.", message = `File ${fileData.name} has been added to File-O by the client on ${date} in client requests.`;
            await generateNotification(org, postedby, title, message, 8, 0, key, date, type, collectionNotifs);

            if (url) res.status(200).json({ file: fileData, url: url });
            else res.json({ error: 6 });
        } else {
            var file = await findFileByName(name, user._id, category, collectionFile);
            var set = await getSetting(collectionSet);

            if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);
            if (dataSize > fileSize) return res.json({ error: 3 });
            if (user.available < dataSize) return res.json({ error: 4 });
            if (file) return res.json({ error: 5 });

            var fileData = {
                name: name, mimeType: mime, type: type, size: dataSize, postedFor: postedby, date: new Date(),
                org: org, category: category, description: description, url: '', postedBy: uname, created: Date.now(),
                email: email, contact: contact, bucketName: `${user.bucketName}`, isVersion: false, version: 0,
                updated: true,
            };

            var key = await createFile(fileData, collectionFile);
            await updateUserStorageB(user._id, user.data_uploaded, user.available, user.combined_plan, dataSize, collectionUser);

            var fileName = fName;
            fileData.url = generateFileName(fileName, '', category, key, postedby);

            await updateUrl(key, fileData.url, collectionFile);

            var url = await putPresignedUrl(key, fileData.url, `${user.bucketName}`);

            var date = parseDate();
            var title = "Client has uploaded a new file to your folder.", message = `File ${fileData.name} has been added to File-O by the client on ${date} in client requests.`;
            await generateNotificationB(postedby, title, message, 8, 0, key, date, type, collectionNotifs);

            if (url) res.status(200).json({ file: fileData, url: url });
            else res.json({ error: 6 });
        }


    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function generateNotification(org, pBy, title, message, t, uT, fileId, dt, mime, collectionNotif) {
    let data = {
        postedBy: pBy, title: title, message: message,
        recievedBy: pBy, type: t, userType: uT, org: org,
        id: fileId, date: dt, mimeType: mime, created: Date.now(),
        isRead: false
    };
    await createNotification(data, collectionNotif);
}

async function generateNotificationB(pBy, title, message, t, uT, fileId, dt, mime, collectionNotif) {
    let data = {
        postedBy: pBy, title: title, message: message,
        recievedBy: pBy, type: t, userType: uT, flag: 'P',
        id: fileId, date: dt, mimeType: mime, created: Date.now(),
        isRead: false
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

function generateFileName(fileName, org, catId, _id, userId) {
    return org ? `FileO/organization/${org}/user/${userId}/myclients${catId ? `/category/${catId}`: ''}/files/${_id}/${uuidv4()}/${fileName}`
        : `FileO/personal/user/${userId}/myclients${catId ? `/category/${catId}`: ''}/${catId}/files/${_id}/${uuidv4()}/${fileName}`;
}

async function updateOrganizationStorage(org, d_u, avb, cb_p, size, collectionOrg) {
    var uploaded_data = Number(d_u) + Number(size);
    var available = Number(avb) - Number(size);
    if (uploaded_data < 0) uploaded_data = 0;
    if (available > cb_p) available = Number(cb_p);
    var percent_used = (((Number(cb_p - avb)) * 100) % (Number(cb_p)));
    if (percent_used > 100) percent_used = 100;
    var percent_left = 100 - Number(percent_used);
    if (percent_left < 0) percent_left = 0;
    await updatePackageDetails(org, uploaded_data, available, percent_left, percent_used, collectionOrg);
}

async function updateUserStorage(userId, sU, sA, sL, size, collectionUser) {
    var userUploaded = Number(sU) + Number(size);
    var userAvailable = Number(sA) - Number(size);
    if (userUploaded > sL) userUploaded = Number(sL);
    if (userAvailable < 0) userAvailable = Number(0);
    await updateStorage(userId, userUploaded, userAvailable, collectionUser);
}

async function updateUserStorageB(_id, d_u, avb, cb_p, size, collectionUser) {
    var uploaded_data = Number(d_u) + Number(size);
    var available = Number(avb) - Number(size);
    if (uploaded_data < 0) uploaded_data = 0;
    if (available > cb_p) available = Number(cb_p);

    await UserB.updatePackageDetails(_id, uploaded_data, available, collectionUser);
}

module.exports = router;