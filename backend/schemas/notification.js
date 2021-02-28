
const { getPresignedUrl } = require('../middlewares/oci-sdk');

module.exports = {

    filesChanged: async (arr, collection) => {
        try {
            if (arr && arr.length > 0) {
                const doc = await collection.find().filter({ id: { $in: arr } }).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let content = document.getContent();
                    content.id = '';
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(content);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updatedChangedAll: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ recievedBy: _id, updated: { $ne: true } }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let content = document.getContent();
                content.updated = true;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(content);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updatedChanged: async (id, _id, collection) => {
        try {
            const doc = await collection.find().filter({ id: id, recievedBy: _id, updated: { $ne: true } }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let content = document.getContent();
                content.updated = true;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(content);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    userRolesChanged: async (arr, type, collection) => {
        try {
            if (arr && arr.length > 0) {
                const doc = await collection.find().filter({ recievedBy: { $in: arr }, type: Number(type) }).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let content = document.getContent();
                    content.id = '';
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(content);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    fileChanged: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ id: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let content = document.getContent();
                content.id = '';
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(content);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    fileChangedU: async (_id, uId, collection) => {
        try {
            if (uId && uId.length > 0) {
                const doc = await collection.find().filter({ id: _id, recievedBy: { $in: uId } }).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let content = document.getContent();
                    content.id = '';
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(content);
                }));
            }

        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteFileUser: async (_id, collection) => {
        try {
            await collection.find().filter({ userId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createNotification: async (data, collection) => {
        try {
            data.date = new Date();
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUnread: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ recievedBy: _id, isRead: { $ne: true } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateRead: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) return false;
            let content = doc.getContent();
            content._id = doc.key;
            content.isRead = true;
            content.updated = true;
            await collection.find().fetchArraySize(0).key(_id).replaceOne(content);
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUnreadList: async (_id, collection, collectionUser) => {
        try {
            let list = [];
            let document = await collection.find().filter({ recievedBy: _id, isRead: { $ne: true }, updated: { $ne: true } }).getDocuments();
            if (document) await Promise.all(document.map(async doc => {
                let content = doc.getContent();
                let contentU = doc.getContent();
                contentU._id = doc.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(contentU.postedBy).getOne();
                if (userDoc) {
                    let tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                    contentU.postedBy = tempUser;
                    await generateProfileUrl(contentU);
                    list.push(contentU);
                }
                content.updated = true;
                await collection.find().fetchArraySize(0).key(doc.key).replaceOne(content);
            }));
            return list;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    readAllNotification: async (_id, collection) => {
        try {
            let document = await collection.find().filter({ recievedBy: _id, isRead: { $ne: true } }).getDocuments();
            if (document) await Promise.all(document.map(async doc => {
                let content = doc.getContent();
                content._id = doc.key;
                content.isRead = true;
                content.updated = true;
                await collection.find().fetchArraySize(0).key(doc.key).replaceOne(content);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteNotification: async (_id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAllNotification: async (_id, collection) => {
        try {
            await collection.find().filter({ recievedBy: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getUserNotifCount: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ recievedBy: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getUserNotifLimit: async (_id, offsetN, collection, collectionUser) => {
        try {
            let skipInNumber = Number(offsetN), list = [];
            skipInNumber = skipInNumber * 12;
            let doc = await collection.find().filter({ $query: { recievedBy: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.postedBy).getOne();
                if (userDoc) {
                    let tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                    tempDoc.postedBy = tempUser;
                    await generateProfileUrl(tempDoc);
                    list.push(tempDoc);
                }
            }));
            return list;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getNotification: async (_id, collection, collectionUser) => {
        try {
            let document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) throw new Error('Notification not found')
            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.postedBy).getOne();
            if (userDoc) {
                let tempUser = userDoc.getContent();
                tempUser._id = userDoc.key;
                tempDoc.postedBy = tempUser;
            }
            await generateProfileUrl(tempDoc);;
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteByUser: async _id => {
        try {
            await collection.find().filter({ postedBy: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },
}

async function generateProfileUrl(notif) {
    var url = '';
    if (notif && notif.postedBy && notif.postedBy.image && notif.postedBy.bucketName) url = await getPresignedUrl(notif.postedBy._id, notif.postedBy.image, notif.postedBy.bucketName);
    if (url) notif.postedBy.image = url;
}
