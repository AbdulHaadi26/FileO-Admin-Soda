
const {
    getPresignedUrl
} = require('../middlewares/oci-sdk');

module.exports = {
    getAllRecFilesOfUser: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ postedby: _id }).getDocuments();
            let files = [];
            if (doc) await Promise.all(doc.map(async document => {
                let content = document.getContent();
                content._id = document.key;
                files.push(content);
            }));
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

    findRecById: async (_id, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let content = doc.getContent();
                content._id = doc.key;
                await generateFileUrl(content);
                return content;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findRecByIdDel: async (_id, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let content = doc.getContent();
                content._id = doc.key;
                return content;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    downloadFile: async (_id, collection) => {
        try {
            const document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) throw new Error('File not found');

            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            await generateDownFileUrl(tempDoc);
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getFile: async (_id, collection) => {
        try {
            const document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) throw new Error('File not found');

            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            await generateDownFileUrl(tempDoc);
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createRec: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data)
            if (!doc || !doc.key) throw new Error('Recording could not be created');
            return doc.key;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteRec: async (_id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateUrl: async (key, url, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.url = url;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            await generateFileUrl(document);
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateRecName: async (key, name, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            let tempName = document.name.split('-');
            tempName = tempName[1] ? tempName[1] : tempName[0];
            document.name = `${name}-${tempName}`;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRecCount: async (pId, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedby: pId }).count();
            else doc = await collection.find().filter({ postedby: pId, type: type }).count();
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRecLimit: async (pId, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedby: pId }).getDocuments();
            else doc = await collection.find().filter({ postedby: pId, type: type }).getDocuments();

            let files = [];
            if (doc) doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;;
                files.push(tempDoc);
            });
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRecQueryCount: async (pId, string, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedby: pId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else doc = await collection.find().filter({ postedby: pId, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRecQueryLimit: async (pId, string, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedby: pId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            else doc = await collection.find().filter({ postedby: pId, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();

            let files = [];
            if (doc) doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                files.push(tempDoc);
            });
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

}

async function generateFileUrl(file) {
    var url = '';
    if (file && file.url && file.bucketName) url = await getPresignedUrl(file._id, file.url, file.bucketName);
    if (url) file.url = url;
}

async function generateDownFileUrl(file) {
    var url = '';
    if (file && file.url && file.bucketName) url = await getPresignedUrl(file._id, file.url, file.bucketName);
    if (url) file.url = url;
}
