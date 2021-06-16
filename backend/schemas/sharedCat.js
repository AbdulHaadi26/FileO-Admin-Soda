const {
    getPresignedUrl
} = require('../middlewares/oci-sdk');

module.exports = {
    getAllUserCatIds: async (_id, collection, collectionUser) => {
        try {
            var arr = [];
            const doc = await collection.find().filter({ catId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                let tempUser = await collectionUser.find().fetchArraySize(0).key(tempDoc.sharedWith).getOne();
                if (tempUser) arr.push(tempUser.getContent().email);
            }));
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateCatUptS: async (_id, value, collection) => {
        try {
            let doc = await collection.find().filter({ catId: _id }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let file = document.getContent();
                    file.updated = value;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(file);
                }))
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateCatUptSParent: async (_id, collection, collectionShared) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let file = doc.getContent();
                if (file.pCat && file.pCat[0]) {
                    let cats = await collectionShared.find().filter({ catId: file.pCat[0] }).getDocuments();
                    if (cats) {
                        await Promise.all(cats.map(async cat => {
                            let tempCat = cat.getContent();
                            tempCat.updated = true;
                            await collectionShared.find().fetchArraySize(0).key(cat.key).replaceOne(tempCat);
                        }));    
                    }
                }
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateCatUptSU: async (_id, fileId, value, collection) => {
        try {
            let doc = await collection.find().filter({ sharedWith: _id, catId: fileId }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let file = document.getContent();
                    file.updated = value;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(file);
                }))
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUptCatCountS: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ sharedWith: _id, updated: true }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isExist: async (_id, cId, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ catId: cId, sharedWith: _id }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAssigned: async (_id, cId, collection) => {
        try {
            await collection.find().fetchArraySize(0).filter({ catId: cId, sharedWith: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAssignedAll: async (cId, collection) => {
        try {
            await collection.find().fetchArraySize(0).filter({ catId: cId }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createSharedCat: async (data, collection) => {
        try {
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedCount: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ catId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedLimit: async (_id, limit, collection, collectionUser) => {
        try {
            let users = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { catId: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.sharedWith).getOne();
                if (userDoc) {
                    let tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                    tempDoc.sharedWith = tempUser;
                    await generateProfileUrl(tempDoc);
                    users.push(tempDoc);
                }
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedQueryCount: async (_id, string, collection) => {
        try {
            const doc = await collection.find().filter({ catId: _id, $or: [{ sharedWName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { sharedWEmail: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedQueryLimit: async (_id, limit, string, collection, collectionUser) => {
        try {
            let users = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { catId: _id, $or: [{ sharedWName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { sharedWEmail: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.sharedWith).getOne();
                if (userDoc) {
                    let tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                    tempDoc.sharedWith = tempUser;
                    await generateProfileUrl(tempDoc);
                    users.push(tempDoc);
                }
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatCount: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ sharedWith: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimit: async (_id, search, collection, collectionCat) => {
        try {
            let cats = [], doc;
            if (search === 'updated') doc = await collection.find().filter({ sharedWith: _id, updated: true }).getDocuments();
            else doc = await collection.find().filter({ sharedWith: _id }).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let catDoc = await collectionCat.find().fetchArraySize(0).key(tempDoc.catId).getOne();

                if (catDoc) {
                    let tempCat = catDoc.getContent();
                    tempCat._id = catDoc.key;
                    tempDoc.catId = tempCat;
                    cats.push(tempDoc);
                }
            }));
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatQueryCount: async (_id, string, search, collection) => {
        try {
            let doc;
            if (search === 'category') doc = await collection.find().filter({ sharedWith: _id, catTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else doc = await collection.find().filter({ sharedWith: _id, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatQueryLimit: async (_id, string, search, collection, collectionCat) => {
        try {
            let cats = [];
            let doc;
            if (search === 'category') doc = await collection.find().filter({ sharedWith: _id, catTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            else if (search === 'updated') doc = await collection.find().filter({ sharedWith: _id, updated: true, catTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            else doc = await collection.find().filter({ sharedWith: _id, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let catDoc = await collectionCat.find().fetchArraySize(0).key(tempDoc.catId).getOne();

                if (catDoc) {
                    let tempCat = catDoc.getContent();
                    tempCat._id = catDoc.key;
                    tempDoc.catId = tempCat;
                    cats.push(tempDoc);
                }
            }));
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteSharedCats: async (_id, collection) => {
        try {
            await collection.find().filter({ catId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

async function generateProfileUrl(shared) {
    var url = '';
    if (shared.sharedWith && shared.sharedWith.bucketName && shared.sharedWith.image) url = await getPresignedUrl(shared.sharedWith._id, shared.sharedWith.image, shared.sharedWith.bucketName);
    if (url) shared.sharedWith.image = url;
}
