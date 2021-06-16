const express = require('express');
const router = express.Router();

const uuidv4 = require('uuid/v4');
const JWT = require('../middlewares/jwtAuth');

const {
    deleteObject, copyObject
} = require('../middlewares/oci-sdk');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    findOrganizationByIdUpt,
    updatePackageDetails
} = require('../schemas/organization');

const {
    findUserById,
    updateStorage
} = require('../schemas/user');

const {
    findCatByName,
    createCategory,
    getCatById,
    getAllCats,
    getAllCatLimit,
    updateName,
    deleteCat,
    findCatById,
    getAllChildCats,
    deleteChildCat,
    getCatByIdC,
    getAllCatLimitCombinedUP,
    getAllCatLimitCombinedUSP,
    getAllCatLimitCombinedUSPL,
    updateCatUpt,
    updateCatUptST,
    updateCategory,
    updateAllChildPCat
} = require('../schemas/userCategory');

const {
    getAllCatFile,
    deleteAllCatFiles,
    deleteMultipleFilesArr,
    getAllChildFiles,
    getAllFileLimitCombinedUS,
    getAllFileLimitCombinedU,
    getAllFileLimitCombinedUSL,
    findFileByName,
    createFile,
    updateVersionId,
    deleteFile,
    updateUrl,
    findMultipleFilesArrIdVer
} = require('../schemas/userFile');

const {
    deleteSharedCats, updateCatUptS, updateCatUptSU, getAllUptCatCountS
} = require('../schemas/sharedCat');

const {
    deleteMultipleFilesArrRect
} = require('../schemas/recentUserFile');
const { deleteMultipleFilesArrFvr } = require('../schemas/favrFiles');
const { filesChanged, fileChanged, updatedChanged } = require('../schemas/notification');

const {
    deleteMultipleFilesArrShared
} = require('../schemas/sharedFile');
const { getSetting } = require('../schemas/setting');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const {
            name, _id, uId
        } = req.body;

        let respData = {
            name: name, org: _id, uId: uId, date: new Date(), created: Date.now(), isChild: false, pCat: [], parentCat: '', sqlC: '0',
            last_updated: new Date(Date.now())
        };

        let cat = await findCatByName(name, uId, '', collectionCat);
        if (!cat) {
            let data = await createCategory(respData, collectionCat);
            respData._id = data;
            res.json({ cat: respData });
        } else res.json({ error: 'Category already exists in my space' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/registerChild', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const {
            name, _id, uId, pCat
        } = req.body;

        let parent = await findCatById(pCat, collectionCat);

        let cats = parent.pCat && parent.pCat.length ? parent.pCat : [];
        cats.push(pCat);

        let cat = await findCatByName(name, uId, pCat, collectionCat);
        if (!cat) {

            let respData = {
                name: name, org: _id, uId: uId, date: new Date(), created: Date.now(), isChild: true, pCat: cats,
                parentCat: pCat, sqlC: '1', last_updated: new Date(Date.now())
            };

            let data = await createCategory(respData, collectionCat);
            respData._id = data;
            await updateCatUptST(data, collectionCat);
            res.json({ cat: respData });
        } else res.json({ error: 'Category already exists in my space' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/getCatShare/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionShared = await soda.createCollection('shrs_cat');
        const collectionNotifs = await soda.createCollection('notifs')

        await updateCatUptSU(req.token._id, req.params._id, false, collectionShared);
        await updatedChanged(req.params._id, req.token._id, collectionNotifs);
        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCat/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const { _id } = req.params;


        await updateCatUpt(_id, false, collectionCat);
        let cat = await getCatById(_id, collectionCat);

        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCatC/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');
        const { _id } = req.params;

        await updateCatUpt(_id, false, collectionCat);
        let cat = await getCatByIdC(_id, collectionCat);

        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getCats/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const { _id } = req.params;
        const { catId } = req.query;
        let cats = await getAllCats(_id, catId ? catId : '', collectionCat);

        return res.json({ catList: cats });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.get('/fetchCatsCombined', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        let collectionFile = await soda.createCollection('user_files');
        let collectionCat = await soda.createCollection('user_cats');

        const { string, type } = req.query;

        let catList, fileList;

        if (string) {
            catList = await getAllCatLimitCombinedUSP(req.token._id, string, collectionCat);
            fileList = await getAllFileLimitCombinedUS(req.token._id, '', type, string, collectionFile);
        } else {
            catList = await getAllCatLimitCombinedUP(req.token._id, collectionCat);
            fileList = await getAllFileLimitCombinedU(req.token._id, '', type, collectionFile);
        }

        return res.json({ files: fileList, cats: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCatsCombinedL', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        let collectionFile = await soda.createCollection('user_files');
        let collectionCat = await soda.createCollection('user_cats');

        const { string, type } = req.query;

        let catList, fileList;

        if (string) {
            catList = await getAllCatLimitCombinedUSPL(req.token._id, string, collectionCat);
            fileList = await getAllFileLimitCombinedUSL(req.token._id, '', type, string, collectionFile);
        }

        return res.json({ files: fileList, cats: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchCats', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        let collectionCat = await soda.createCollection('user_cats');

        const { catId, _id } = req.query;

        let catList, cat = '';

        if (catId)
            cat = await getCatByIdC(catId, collectionCat);

        catList = await getAllCatLimit(req.token._id, _id, catId, collectionCat);

        return res.json({ cat: cat, cats: catList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.delete('/deleteCat/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionShared = await soda.createCollection('shrs');
        const collectionNotif = await soda.createCollection('notifs');
        const collectionCat = await soda.createCollection('user_cats');
        const collectionFile = await soda.createCollection('user_files')
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');
        const collectionSCat = await soda.createCollection('shrs_cat');
        const collectionURecfs = await soda.createCollection('urecfs')
        const collectionFvrFiles = await soda.createCollection('favr_files');

        const { _id } = req.params;

        let keys = await getAllChildCats(_id, collectionCat);

        let child_files = await getAllChildFiles(keys, collectionFile);
        let files = await getAllCatFile(_id, collectionFile);
        let user = await findUserById(req.token._id, collectionUser);
        let organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

        if (!user) return res.json({ error: 'User not found' });
        if (!organ) return res.json({ error: 'Organization not found' });
        var uploaded_data = Number(organ.data_uploaded)
        var available = Number(organ.available);
        var combined_plan = Number(organ.combined_plan);
        var percent_left, percent_used;
        var userUploaded = Number(user.storageUploaded);
        var userAvailable = Number(user.storageAvailable);
        var limit = Number(user.storageLimit);

        let arr = [];

        if (files && files.length > 0) await Promise.all(files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);
            percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
            if (percent_used > 100) percent_left = 100;
            percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;

            userUploaded = userUploaded - Number(file.size);
            userAvailable = userAvailable + Number(file.size);
            if (userAvailable > limit) userAvailable = Number(limit);
            if (userUploaded < 0) userUploaded = 0;
            await deleteObject(file.url, req.token.bucket);
            arr.push(file._id);
        }));


        if (child_files && child_files.length > 0) await Promise.all(child_files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);
            percent_used = (((Number(combined_plan - available)) * 100) % (Number(combined_plan)));
            if (percent_used > 100) percent_left = 100;
            percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;

            userUploaded = userUploaded - Number(file.size);
            userAvailable = userAvailable + Number(file.size);
            if (userAvailable > limit) userAvailable = Number(limit);
            if (userUploaded < 0) userUploaded = 0;
            await deleteObject(file.url, req.token.bucket);
            arr.push(file._id);
        }));

        await updatePackageDetails(req.token.org, uploaded_data, available, percent_left, percent_used, collectionOrg);
        await updateStorage(req.token._id, userUploaded, userAvailable, collectionUser);

        await deleteCat(_id, collectionCat);
        await deleteChildCat(_id, collectionCat);
        await deleteAllCatFiles(_id, collectionFile);
        await deleteSharedCats(_id, collectionSCat);
        if (arr && arr.length > 0) {
            await deleteMultipleFilesArr(arr, collectionFile);
            await deleteMultipleFilesArrRect(arr, collectionURecfs);
            await deleteMultipleFilesArrFvr(arr, collectionFvrFiles);
            await deleteMultipleFilesArrShared(arr, collectionShared);
            await filesChanged(arr, collectionNotif);
        }

        await fileChanged(_id, collectionNotif);

        res.json({ success: 'Category deleted' });
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

        const collectionCats = await soda.createCollection('user_cats');

        let count = await getAllUptCatCountS(req.token._id, collectionCats);
        res.json({ catCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionShared = await soda.createCollection('shrs_cat');
        const collectionCat = await soda.createCollection('user_cats');

        const { value, _id, uId } = req.body;


        let cat = await getCatById(_id, collectionCat);

        if (!cat) throw new Error('Category not found');


        await updateCatUptS(_id, true, collectionShared);
        await updateCatUptST(_id, collectionCat);
        let category = await findCatByName(value, uId, cat.parentCat, collectionCat);

        cat = false;

        if (!category) cat = await updateName(_id, value, collectionCat);

        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/moveCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionShared = await soda.createCollection('shrs_cat');
        const collectionCat = await soda.createCollection('user_cats');

        const { catId, _id } = req.body;

        let tempCat = await getCatById(_id, collectionCat);

        if (!tempCat) throw new Error('Category not found');

        let cat = await getCatById(catId, collectionCat);

        await updateCatUptS(_id, true, collectionShared);
        await updateCatUptST(_id, collectionCat);
        let category = await findCatByName(tempCat.name, req.token._id, catId, collectionCat);

        let cats = cat && cat.pCat && cat.pCat.length ? cat.pCat : [];
        catId && cats.push(catId)

        let tempR = tempCat.pCat && tempCat.pCat.length ? tempCat.pCat : [];

        tempR = tempR.filter(i => !cats.includes(i));

        cat = false;

        if (!category) cat = await updateCategory(_id, catId, cats, collectionCat);

        if (cat) {
            await updateAllChildPCat(_id, tempR, cats, collectionCat);
        }
        return res.json({ cat: cat });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/copyFolder', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionFile = await soda.createCollection('user_files');
        const collectionCats = await soda.createCollection('user_cats');
        const collectionSets = await soda.createCollection('sets');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');

        const { _id, catId } = req.body;

        let pCat = [];

        if (catId) {
            let cat = await getCatById(catId, collectionCats);
            let cats = cat && cat.pCat && cat.pCat.length ? cat.pCat : [];
            cats.push(catId);
            pCat = cats;
        };

        let checkCat = await getCatById(_id, collectionCats);

        if (!checkCat) throw new Error('Folder does not exists');

        let isExist = await findCatByName(`${checkCat.name}`, req.token._id, catId, collectionCats);

        if (isExist) throw new Error('Folder does not exists');

        var cats = [_id];

        const set = await getSetting(collectionSets);

        if (set && set.maxFileSize) fileSize = Number(set.maxFileSize);

        let prevKey = [];

        let childCs = await getAllChildCats(_id, collectionCats);

        if (childCs && childCs.length > 0) {
            cats = cats.concat(childCs);
        };

        let catKeys = [];

        await Promise.all(cats.map(async (cat, count) => {
            let tempCat = await getCatById(cat, collectionCats);
            if (tempCat) {

                prevKey = prevKey.concat([{ _id: tempCat._id, newId: '' }]);

                let tempCats = tempCat.pCat && tempCat.pCat.length > 0 && count !== 0 ? tempCat.pCat : pCat;

                if (count !== 0) {
                    let tempArr = tempCats, item = -1;
                    tempArr.map((i, k) => {
                        if (i === _id) {
                            item = k;
                        }
                    });

                    tempCats = tempCats.filter((i, k) => k >= item);
                    tempCats = pCat.concat(tempCats);
                }

                let tempData = {
                    name: `${tempCat.name}`, org: req.token.org, uId: tempCat.uId, date: new Date(),
                    created: Date.now(), isChild: tempCats.length > 0 ? true : false, last_updated: new Date(Date.now()),
                    pCat: tempCats, parentCat: tempCats.length > 0 ? tempCats[tempCats.length - 1] : '',
                    last_updated: new Date(Date.now())
                };

                let keyC = await createCategory(tempData, collectionCats);

                catKeys.push(keyC);

                prevKey = prevKey.map(i => {
                    if (i._id === cat) {
                        i.newId = keyC;
                    }
                    return i;
                });

                let files = await getAllCatFile(cat, collectionFile);

                files && files.length > 0 && await Promise.all(files.map(async file => {
                    var fileData = {
                        name: `${file.name}`, mimeType: file.mimeType,
                        type: file.type, size: file.size,
                        postedby: file.postedby, bucketName: req.token.bucket,
                        created: Date.now(), date: new Date(), version: 0, last_updated: new Date(Date.now()),
                        org: req.token.org, category: keyC, versionId: '',
                        description: file.description, url: '', isVersion: false
                    };

                    var f = await findFileByName(fileData.name, req.token._id, fileData.category, collectionFile);
                    var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);
                    var user = await findUserById(req.token._id, collectionUser);

                    if (!f && fileData.size < fileSize && (organ.available > fileData.size || fileData.size < user.storageAvailable)) {
                        const fl = file.url;
                        const type = fl.split('.').slice(-1);
                        const fileName = `${fileData.name.toLowerCase().split(' ').join('-')}.${type}`;

                        var key = await createFile(fileData, collectionFile);
                        fileData.url = generateFileName(fileName, fileData.org, keyC, key, fileData.postedby);
                        await updateVersionId(key, fileData.url, collectionFile);

                        var url = await copyObject(file.url, fileData.url, req.token.bucket);
                        if (url) {
                            await updateOrganizationStorage(req.token.org, organ.data_uploaded, organ.available, organ.combined_plan, file.size, collectionOrg);
                            await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, file.size, collectionUser);
                        }
                        else await deleteFile(key, collectionFile);

                        const vers = await findMultipleFilesArrIdVer(file._id, collectionFile);

                        if (vers && vers.length > 0) await Promise.all(vers.map(async version => {

                            var verData = {
                                name: `${version.name}`, type: version.type, mimeType: version.mimeType,
                                description: version.description, size: version.size,
                                postedby: version.postedby, org: version.org, category: keyC,
                                created: Date.now(), date: new Date(), last_updated: new Date(Date.now()),
                                isVersion: true, version: Number(version.version), versionId: key,
                                url: '', bucketName: req.token.bucket
                            };

                            var organ = await findOrganizationByIdUpt(req.token.org, collectionOrg);

                            var user = await findUserById(req.token._id, collectionUser);

                            if (verData.size < fileSize && (organ.available > verData.size || verData.size < user.storageAvailable)) {
                                const fl = file.url;
                                const type = fl.split('.').slice(-1);
                                const fileName = `${verData.name.toLowerCase().split(' ').join('-')}.${type}`;

                                var keyV = await createFile(verData, collectionFile);
                                verData.url = generateFileName(fileName, verData.org, keyC, keyV, verData.postedby);
                                await updateUrl(keyV, verData.url, collectionFile);

                                var url = await copyObject(version.url, verData.url, req.token.bucket);
                                if (url) {
                                    await updateOrganizationStorage(version.org, organ.data_uploaded, organ.available, organ.combined_plan, version.size, collectionOrg);
                                    await updateUserStorage(req.token._id, user.storageUploaded, user.storageAvailable, user.storageLimit, version.size, collectionUser);
                                } else await deleteFile(keyV, collectionFile);
                            }
                        }));
                    }
                }));
            }
        }));

        catKeys && catKeys.length > 0 && await Promise.all(catKeys.map(async (cat, count) => {
            const doc = await collectionCats.find().fetchArraySize(0).key(cat).getOne();
            if (doc) {
                let tempCat = doc.getContent();

                let tempCats = tempCat.pCat;
                let parentCat = tempCat.parentCat;

                tempCats = tempCats.map(i => {
                    prevKey.map(j => {
                        if (j._id === i && j.newId) {
                            i = j.newId;
                        }
                        if (parentCat === j._id && j.newId) {
                            parentCat = j.newId;
                        }
                        return j;
                    });
                    return i;
                });

                tempCat.pCat = tempCats;
                tempCat.parentCat = parentCat;

                await collectionCats.find().fetchArraySize(0).key(cat).replaceOne(tempCat);
            }
        }));

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

async function updateOrganizationStorage(org, d_u, avb, cb_p, size, collectionOrg) {
    var uploaded_data = Number(d_u) + Number(size);
    var available = Number(avb) - Number(size);
    if (uploaded_data < 0) uploaded_data = 0;
    if (available > cb_p) available = Number(cb_p);
    var percent_used = (((Number(cb_p - avb)) * 100) % (Number(cb_p)));
    if (percent_used > 100) percent_used = 100;
    var percent_left = 100 - Number(percent_used);
    if (percent_left < 0) percent_left = 0
    await updatePackageDetails(org, uploaded_data, available, percent_left, percent_used, collectionOrg);
}

async function updateUserStorage(userId, sU, sA, sL, size, collectionUser) {
    var userUploaded = Number(sU) + Number(size);
    var userAvailable = Number(sA) - Number(size);
    if (userUploaded > sL) userUploaded = Number(sL);
    if (userAvailable < 0) userAvailable = Number(0);
    await updateStorage(userId, userUploaded, userAvailable, collectionUser);
}

function generateFileName(fileName, org, catId, _id, userId) {
    return catId ? `FileO/organization/${org}/user/myspace/${userId}/category/${catId}/files/${_id}/${uuidv4()}/${fileName}` : `FileO/organization/${org}/user/myspace/${userId}/category/files/${_id}/${uuidv4()}/${fileName}`;
}

module.exports = router;