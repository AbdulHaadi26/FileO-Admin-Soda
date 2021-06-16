const {
    getPresignedUrl
} = require('../middlewares/oci-sdk');

module.exports = {

    getAllUserFileIds: async (_id, collection, collectionUser) => {
        try {
            var arr = [];
            const doc = await collection.find().filter({ fileId: _id }).getDocuments();
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


    updateFileUptS: async (_id, value, collection) => {
        try {
            let doc = await collection.find().filter({ fileId: _id }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let file = document.getContent();
                    file.updated = value;
                    file.last_updated = new Date(Date.now());
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(file);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFileUptSU: async (_id, fileId, value, collection) => {
        try {
            let doc = await collection.find().filter({ sharedWith: _id, fileId: fileId }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let file = document.getContent();
                    file.updated = value;
                    file.last_updated = new Date(Date.now());
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(file);
                }))
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUptFileCountS: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ sharedWith: _id, updated: true }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteMultipleFilesArrShared: async (list, collection) => {
        try {
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ fileId: { $in: list } }).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let tempFile = document.getContent();
                    tempFile.isDel = true;
                    tempFile.updated = false;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAssigned: async (_id, fId, collection) => {
        try {
            await collection.find().fetchArraySize(0).filter({ fileId: fId, sharedWith: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAssignedAll: async (fId, collection) => {
        try {
            await collection.find().fetchArraySize(0).filter({ fileId: fId }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isExist: async (_id, fId, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ fileId: fId, sharedWith: _id }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedCount: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ fileId: _id }).count();
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
            const doc = await collection.find().filter({ $query: { fileId: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
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
            const doc = await collection.find().filter({ fileId: _id, $or: [{ sharedWName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { sharedWEmail: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createSharedF: async (data, collection) => {
        try {
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedQueryLimit: async (_id, limit, string, collection, collectionUser) => {
        try {
            let users = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { fileId: _id, $or: [{ sharedWName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { sharedWEmail: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
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

    deleteByUser: async (_id, collection) => {
        try {
            await collection.find().filter({ postedby: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCount: async (_id, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ sharedWith: _id }).count();
            else doc = await collection.find().filter({ sharedWith: _id, type: type }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFileByUserName: async (_id, name, collection) => {
        try {
            let doc = await collection.find().filter({ sharedBy: _id }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let note = document.getContent();
                    note.sharedByName = name;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(note);
                }))
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFileWithUserName: async (_id, name, collection) => {
        try {
            let doc = await collection.find().filter({ sharedWith: _id }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let note = document.getContent();
                    note.sharedWName = name;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(note);
                }))
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateSharedFileName: async (_id, name, collection) => {
        try {
            const doc = await collection.find().filter({ fileId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile.fileName = name;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimit: async (_id, search, type, collection, collectionFile) => {
        try {
            let cats = [], doc;

            if (search === 'updated') {
                if (type === 'All') doc = await collection.find().filter({ sharedWith: _id, updated: true }).getDocuments();
                else doc = await collection.find().filter({ sharedWith: _id, updated: true, type: type }).getDocuments();
            } else {
                if (type === 'All') doc = await collection.find().filter({ sharedWith: _id }).getDocuments();
                else doc = await collection.find().filter({ sharedWith: _id, type: type }).getDocuments();
            }

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                const fileDoc = await collectionFile.find().fetchArraySize(0).key(tempDoc.fileId).getOne();
                if (fileDoc) {
                    let tempFile = fileDoc.getContent();
                    tempDoc._id = fileDoc.key;
                    tempDoc.fileId = tempFile;
                    cats.push(tempDoc);
                }
            }));
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryCount: async (_id, string, type, search, collection) => {
        try {
            let doc;
            if (search === 'file') {
                if (type === 'All') doc = await collection.find().filter({ sharedWith: _id, fileName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                else doc = await collection.find().filter({ sharedWith: _id, type: type, fileName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            } else {
                if (type === 'All') doc = await collection.find().filter({ sharedWith: _id, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                else doc = await collection.find().filter({ sharedWith: _id, type: type, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            }
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryLimit: async (_id, string, type, search, collection, collectionFile) => {
        try {
            let cats = [];
            let doc;
            if (search === 'file') {
                if (type === 'All') doc = await collection.find().filter({ sharedWith: _id, fileName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
                else doc = await collection.find().filter({ sharedWith: _id, type: type, fileName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            } else if (search === 'updated') {
                if (type === 'All') doc = await collection.find().filter({ sharedWith: _id, updated: true, fileName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
                else doc = await collection.find().filter({ sharedWith: _id, updated: true, type: type, fileName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            } else {
                if (type === 'All') doc = await collection.find().filter({ sharedWith: _id, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
                else doc = await collection.find().filter({ sharedWith: _id, type: type, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            }

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                const fileDoc = await collectionFile.find().fetchArraySize(0).key(tempDoc.fileId).getOne();

                if (fileDoc) {
                    let tempFile = fileDoc.getContent();
                    tempDoc._id = fileDoc.key;
                    tempDoc.fileId = tempFile;
                    cats.push(tempDoc);
                }
            }));
            return cats;
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
