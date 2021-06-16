const { getPresignedUrl } = require("../middlewares/oci-sdk");

module.exports = {

    createAnnouncement: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('Category could not be created.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }

    },

    getAncById: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('Announcement not found');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    findAncByName: async (pId, userId, name, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ pId, userId, name }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateAnc: async (key, name, desc, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.name = name;
            document.description = desc;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAncList: async (pId, type, collection) => {
        try {

            let params = {
                pId
            };

            if (type !== 'All') params.type = type;

            const doc = await collection.find().filter(params).getDocuments();

            let list = [];

            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                list.push(content);
            });

            return list;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAncListS: async (pId, type, string, collection) => {
        try {

            let params = {
                pId,
                name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }
            };

            if (type !== 'All') params.type = type;

            const doc = await collection.find().filter(params).getDocuments();

            let list = [];

            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                list.push(content);
            });

            return list;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    deleteAnc: async (key, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(key).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getANC: async (_id, collection) => {
        try {
            const document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) throw new Error('Annoucement not found.');
            let tempDoc = document.getContent();
            await generateFileUrl(tempDoc);
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },
}

async function generateFileUrl(file) {
    var url = '';
    if (file && file.rec && file.bucketName) url = await getPresignedUrl(file._id, file.rec, file.bucketName);
    if (url) file.rec = url;
}