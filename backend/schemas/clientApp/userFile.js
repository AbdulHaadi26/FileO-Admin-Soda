
const {
    getPresignedUrl
} = require('../../middlewares/oci-sdk');

module.exports = {
    getFile: async (_id, collection, collectionUser) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('File not found');

            let content = doc.getContent();
            content._id = doc.key;

            let userDoc = await collectionUser.find().fetchArraySize(0).key(content.postedby).getOne();

            if (userDoc) {
                let tempUser = userDoc.getContent();
                tempUser._id = userDoc.key;
                content.postedby = tempUser;
            }

            let url, urlu;
            if (content && content.url && content.bucketName) url = await getPresignedUrl(content._id, content.url, content.bucketName);
            if (url) content.url = url;

            if (content && content.postedby && content.postedby.image && content.postedby.bucketName)
                urlu = await getPresignedUrl(content.postedby._id, content.postedby.image, content.postedby.bucketName);
            if (urlu) content.postedby.image = urlu;

            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getCatC: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('Category does not exist');
            let content = doc.getContent();
            content._id = doc.key;

            let tempCats = [];

            if (content.pCat && content.pCat.length > 0) {
                await Promise.all(content.pCat.map(async cat => {
                    let tempDoc = await collection.find().fetchArraySize(0).key(cat).getOne();
                    if (tempDoc) {
                        let cat = tempDoc.getContent();
                        cat._id = tempDoc.key;
                        tempCats.push(cat);
                    }
                }));
            }

            content.pCat = tempCats;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getCat: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('Category does not exist');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getFiles: async (_id, pCat, collection) => {
        try {
            let arr = [];

            let catToSearch = pCat;
            if (_id) catToSearch = _id;

            let doct = await collection.find().filter({ category: catToSearch, isVersion: false }).getDocuments();

            if (doct) {
                await Promise.all(doct.map(async doc => {
                    let content = doc.getContent();
                    content._id = doc.key;

                    let url;
                    if (content && content.url && content.bucketName) url = await getPresignedUrl(content._id, content.url, content.bucketName);
                    if (url) content.url = url;

                    arr.push(content);
                }));
            }
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getChildFolders: async (_id, pCat, collection) => {
        try {
            let arr = [];
            let catToSearch = pCat;
            if (_id) catToSearch = _id;

            let doct = await collection.find().filter({ parentCat: catToSearch }).getDocuments();

            if (doct) {
                await Promise.all(doct.map(async doc => {
                    let content = doc.getContent();
                    content._id = doc.key;
                    arr.push(content);
                }));
            }
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    downloadFile: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('File not found');

            let content = doc.getContent();
            content._id = doc.key;

            let url;
            if (content && content.url && content.bucketName) url = await getPresignedUrl(content._id, content.url, content.bucketName);
            if (url) content.url = url;

            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}
