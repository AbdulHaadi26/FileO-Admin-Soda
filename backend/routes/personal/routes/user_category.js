const express = require('express');
const router = express.Router();

const uuidv4 = require('uuid/v4');
const JWT = require('../../../middlewares/jwtAuth');

const {
    deleteObject, copyObject
} = require('../../../middlewares/oci-sdk');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../../../middlewares/oracleDB');

const {
    findUserById,
    updatePackageDetails
} = require('../../../schemas/personal/schemas/user');

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
    updateCategory,
    updateAllChildPCat,
    getAllCatLimitCombinedUSPL
} = require('../../../schemas/personal/schemas/userCategory');

const {
    getAllCatFile,
    deleteAllCatFiles,
    deleteMultipleFilesArr,
    getAllChildFiles,
    getAllFileLimitCombinedUS,
    getAllFileLimitCombinedU,
    findFileByName,
    createFile,
    updateVersionId,
    deleteFile,
    updateUrl,
    findMultipleFilesArrIdVer,
    getAllFileLimitCombinedUSL
} = require('../../../schemas/personal/schemas/userFile');


const {
    deleteMultipleFilesArrRect
} = require('../../../schemas/personal/schemas/recentUserFile');
const { deleteMultipleFilesArrFvr } = require('../../../schemas/personal/schemas/favrFiles');

const { getSetting } = require('../../../schemas/personal/schemas/setting');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const {
            name
        } = req.body;

        let respData = {
            name: name, uId: req.token._id, date: new Date(), created: Date.now(), isChild: false, pCat: [], parentCat: '',
            last_updated: new Date(Date.now()), flag: 'P'
        };

        let cat = await findCatByName(name, req.token._id, '', collectionCat);
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
            name, pCat
        } = req.body;

        let parent = await findCatById(pCat, collectionCat);

        let cats = parent.pCat && parent.pCat.length ? parent.pCat : [];
        cats.push(pCat);

        let cat = await findCatByName(name, req.token._id, pCat, collectionCat);
        if (!cat) {

            let respData = {
                name: name, uId: req.token._id, date: new Date(), created: Date.now(), isChild: true, pCat: cats,
                parentCat: pCat, last_updated: new Date(Date.now()), flag: 'P'
            };

            let data = await createCategory(respData, collectionCat);
            respData._id = data;
            ;
            res.json({ cat: respData });
        } else res.json({ error: 'Category already exists in my space' });
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

        const collectionCat = await soda.createCollection('user_cats');
        const collectionFile = await soda.createCollection('user_files')
        const collectionUser = await soda.createCollection('users');
        const collectionURecfs = await soda.createCollection('urecfs')
        const collectionFvrFiles = await soda.createCollection('favr_files');

        const { _id } = req.params;

        let keys = await getAllChildCats(_id, collectionCat);

        let child_files = await getAllChildFiles(keys, collectionFile);
        let files = await getAllCatFile(_id, collectionFile);
        let user = await findUserById(req.token._id, collectionUser);

        if (!user) return res.json({ error: 'User not found' });

        var uploaded_data = Number(user.data_uploaded)
        var available = Number(user.available);
        var combined_plan = Number(user.combined_plan);

        let arr = [];

        if (files && files.length > 0) await Promise.all(files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);
            await deleteObject(file.url, req.token.bucket);
            arr.push(file._id);
        }));


        if (child_files && child_files.length > 0) await Promise.all(child_files.map(async (file) => {
            uploaded_data = uploaded_data - Number(file.size);
            available = available + Number(file.size);
            if (uploaded_data < 0) uploaded_data = 0;
            if (available > combined_plan) available = Number(combined_plan);

            if (userAvailable > limit) userAvailable = Number(limit);
            if (userUploaded < 0) userUploaded = 0;
            await deleteObject(file.url, req.token.bucket);
            arr.push(file._id);
        }));

        await updatePackageDetails(req.token._id, uploaded_data, available, collectionUser);
        await deleteCat(_id, collectionCat);
        await deleteChildCat(_id, collectionCat);
        await deleteAllCatFiles(_id, collectionFile);
        if (arr && arr.length > 0) {
            await deleteMultipleFilesArr(arr, collectionFile);
            await deleteMultipleFilesArrRect(arr, collectionURecfs);
            await deleteMultipleFilesArrFvr(arr, collectionFvrFiles);
        }

        res.json({ success: 'Category deleted' });
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

router.post('/updateCat', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionCat = await soda.createCollection('user_cats');

        const { value, _id } = req.body;


        let cat = await getCatById(_id, collectionCat);

        if (!cat) throw new Error('Category not found');

        let category = await findCatByName(value, req.token._id, cat.parentCat, collectionCat);

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

        const collectionCat = await soda.createCollection('user_cats');

        const { catId, _id } = req.body;

        let tempCat = await getCatById(_id, collectionCat);

        if (!tempCat) throw new Error('Category not found');

        let cat = await getCatById(catId, collectionCat);

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
                    name: `${tempCat.name}`, uId: tempCat.uId, date: new Date(),
                    created: Date.now(), isChild: tempCats.length > 0 ? true : false, last_updated: new Date(Date.now()),
                    pCat: tempCats, parentCat: tempCats.length > 0 ? tempCats[tempCats.length - 1] : '',
                    last_updated: new Date(Date.now()), flag: 'P'
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
                        category: keyC, versionId: '', flag: 'P',
                        description: file.description, url: '', isVersion: false
                    };

                    var f = await findFileByName(fileData.name, req.token._id, fileData.category, collectionFile);
                    var user = await findUserById(req.token._id, collectionUser);

                    if (!f && fileData.size < fileSize && user.available > fileData.size) {
                        const fl = file.url;
                        const type = fl.split('.').slice(-1);
                        const fileName = `${fileData.name.toLowerCase().split(' ').join('-')}.${type}`;

                        var key = await createFile(fileData, collectionFile);
                        fileData.url = generateFileName(fileName, keyC, key, fileData.postedby);
                        await updateVersionId(key, fileData.url, collectionFile);

                        var url = await copyObject(file.url, fileData.url, req.token.bucket);
                        if (url) {
                            await updateUserStorage(req.token._id, user.data_uploaded, user.available, user.combined_plan, file.size, collectionUser);;
                        }
                        else await deleteFile(key, collectionFile);

                        const vers = await findMultipleFilesArrIdVer(file._id, collectionFile);

                        if (vers && vers.length > 0) await Promise.all(vers.map(async version => {

                            var verData = {
                                name: `${version.name}`, type: version.type, mimeType: version.mimeType,
                                description: version.description, size: version.size,
                                postedby: version.postedby, flag: 'P', category: keyC,
                                created: Date.now(), date: new Date(), last_updated: new Date(Date.now()),
                                isVersion: true, version: Number(version.version), versionId: key,
                                url: '', bucketName: req.token.bucket
                            };

                            var user = await findUserById(req.token._id, collectionUser);

                            if (verData.size < fileSize && user.available > verData.size) {
                                const fl = file.url;
                                const type = fl.split('.').slice(-1);
                                const fileName = `${verData.name.toLowerCase().split(' ').join('-')}.${type}`;

                                var keyV = await createFile(verData, collectionFile);
                                verData.url = generateFileName(fileName, keyC, keyV, verData.postedby);
                                await updateUrl(keyV, verData.url, collectionFile);

                                var url = await copyObject(version.url, verData.url, req.token.bucket);
                                if (url) {
                                    await updateUserStorage(req.token._id, user.data_uploaded, user.available, user.combined_plan, version.size, collectionUser);
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

async function updateUserStorage(_id, d_u, avb, cb_p, size, collectionUser) {
    var uploaded_data = Number(d_u) + Number(size);
    var available = Number(avb) - Number(size);
    if (uploaded_data < 0) uploaded_data = 0;
    if (available > cb_p) available = Number(cb_p);
    await updatePackageDetails(_id, uploaded_data, available, collectionUser);
}


function generateFileName(fileName, catId, _id, userId) {
    return catId ? `FileO/personal/user/myspace/${userId}/category/${catId}/files/${_id}/${uuidv4()}/${fileName}` : `FileO/personal/user/myspace/${userId}/category/files/${_id}/${uuidv4()}/${fileName}`;
}

module.exports = router;