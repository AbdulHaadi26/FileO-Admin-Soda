const { getPresignedUrl } = require("../middlewares/oci-sdk");

module.exports = {

    createEmpReq: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('Category could not be created.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getEmpReqByUserId: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ userId: key }).getOne();
            if (!doc || !doc.key) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    removeEmpReq: async (key, collection) => {
        try {
            await collection.find().filter({ userId: key }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getEmpReqCount: async (org, collection) => {
        try {
            let doc = await collection.find().filter({ org: org }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getEmpReqLimit: async (org, offsetN, collection, collectionUser) => {
        try {
            let skipInNumber = Number(offsetN), reqs = [];
            skipInNumber = skipInNumber * 12;
            let doc = await collection.find().filter({ $query: { org: org }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                if (tempDoc.userId) {
                    let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
                    if (userDoc) {
                        let tempUser = userDoc.getContent();
                        tempUser._id = userDoc.key;
                        tempDoc.userId = tempUser;
                        await generateProfileUrl(tempDoc);
                        reqs.push(tempDoc);
                    }
                }
            }));
            return reqs;
        } catch (e) {
            throw new Error(e.message);
        }
    },

}

async function generateProfileUrl(file) {
    var url = '';
    if (file.userId && file.userId.image && file.userId.bucketName) url = await getPresignedUrl(file.userId._id, file.userId.image, file.userId.bucketName);
    if (url) file.userId.image = url;
}


