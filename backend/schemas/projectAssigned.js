const {
    getPresignedUrl
} = require('../middlewares/oci-sdk');

module.exports = {

    deleteFileUser: async (_id, collection) => {
        try {
            await collection.find().filter({ userId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isExist: async (_id, org, pId, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ userId: _id, org: org, projId: pId }).getOne();
            let tempDoc;
            if (doc) {
                tempDoc = doc.getContent();
                tempDoc._id = doc.key;
            }
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAllByPId: async (pId, collection) => {
        try {
            await collection.find().filter({ pId: pId }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllIds: async (_id, collection, collectionUser) => {
        try {
            let emails = [];
            let doc = await collection.find().filter({ projId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
                let tempUser = userDoc.getContent();
                emails.push(tempUser.email);
            }));
            return emails;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    getAssignedUserById: async (_id, pId, collection, collectionUser) => {
        try {
            let document = await collection.find().fetchArraySize(0).filter({ userId: _id, projId: pId }).getOne();
            if (!document) throw new Error('Assigned item not found');
            let tempDoc = document.getContent();
            let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
            if (!userDoc) throw new Error('User not found');
            let tempUser = userDoc.getContent();
            tempUser._id = userDoc.key;
            tempDoc.userId = tempUser;

            await generateProfileUrl(tempDoc);

            tempDoc._id = document.key;
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAssignedProjects: async (_id, collection) => {
        try {
            let pIds = [];
            let document = await collection.find().filter({ userId: _id }).getDocuments();
            if (document) document.map(doc => {
                    let tempDoc = doc.getContent();
                    tempDoc.projId && pIds.push(tempDoc.projId);
                });
            return pIds;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectCountP: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ userId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createProjAssigned: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('User could not be assigned.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectLimitP: async (offsetN, _id, collection, collectionProj) => {
        try {
            let skipInNumber = Number(offsetN);
            let projs = [];
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { userId: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let projDoc = await collectionProj.find().fetchArraySize(0).key(tempDoc.projId).getOne();
                if (projDoc) {
                    let tempProj = projDoc.getContent();
                    tempProj._id = projDoc.key;
                    tempDoc.projId = tempProj;
                    projs.push(tempDoc);
                }
            }));
            return projs;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getCountByPId: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ projId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectQueryCountP: async (string, _id, collection) => {
        try {
            let doc = await collection.find().filter({ userId: _id, projName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectQueryLimitP: async (offsetN, string, _id, collection, collectionProj) => {
        try {
            let skipInNumber = Number(offsetN);
            let projs = [];
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { userId: _id, projName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let projDoc = await collectionProj.find().fetchArraySize(0).key(tempDoc.projId).getOne();
                if (projDoc) {
                    let tempProj = projDoc.getContent();
                    tempProj._id = projDoc.key;
                    tempDoc.projId = tempProj;
                    projs.push(tempDoc);
                }
            }));
            return projs;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    getAllUserQueryCountP: async (string, _id, arrId, collection) => {
        try {
            let doc;

            if (arrId && arrId.length > 0)
                doc = await collection.find().filter({ projId: _id, userId: { $nin: arrId }, userName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else
                doc = await collection.find().filter({ projId: _id, userName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserQueryLimitP: async (offsetN, string, _id, arrId, collection, collectionUser) => {
        try {
            let skipInNumber = Number(offsetN);
            let assigned = [];
            skipInNumber = skipInNumber * 12;
            let doc;

            if (arrId && arrId.length > 0)
                doc = await collection.find().filter({ $query: { projId: _id, userId: { $nin: arrId }, userName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else
                doc = await collection.find().filter({ $query: { projId: _id, userName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
                if (userDoc) {
                    let userProj = userDoc.getContent();
                    userProj._id = userDoc.key;
                    await generateProfileUrl(userProj);
                    assigned.push(userProj);
                }
            }));
            return assigned;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserCountP: async (_id, arrId, collection) => {
        try {
            let doc;

            if (arrId && arrId.length > 0)
                doc = await collection.find().filter({ projId: _id, userId: { $nin: arrId } }).count();
            else
                doc = await collection.find().filter({ projId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserEI: async (_id, arrId, collection, collectionUser) => {
        try {
            let arr = [];
            let doc;

            if (arrId && arrId.length > 0) {
                doc = await collection.find().filter({ projId: _id, userId: { $nin: arrId } }).getDocuments();
            } else {
                doc = await collection.find().filter({ projId: _id }).getDocuments();
            }

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
                if (userDoc) {
                    let userProj = userDoc.getContent();
                    arr.push({ _id: userDoc.key, email: userProj.email });
                }
            }));
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserLimitP: async (offsetN, _id, arrId, collection, collectionUser) => {
        try {
            let skipInNumber = Number(offsetN);
            let assigned = [];
            skipInNumber = skipInNumber * 12;
            let doc;

            if (arrId && arrId.length > 0)
                doc = await collection.find().filter({ $query: { projId: _id, userId: { $nin: arrId } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else
                doc = await collection.find().filter({ $query: { projId: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();


            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
                if (userDoc) {
                    let userProj = userDoc.getContent();
                    userProj._id = userDoc.key;
                    await generateProfileUrl(userProj);
                    assigned.push(userProj);
                }
            }));
            return assigned;
        } catch (e) {
            throw new Error(e.message);
        }
    },


}

async function generateProfileUrl(assigned) {
    var url = '';
    if (assigned && assigned.image && assigned.bucketName) url = await getPresignedUrl(assigned._id, assigned.image, assigned.bucketName);
    if (url) assigned.image = url;
}