const { getPresignedUrl } = require("../../middlewares/oci-sdk");

module.exports = {
    findUserById: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('user not found.');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getUser: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('user not found.');
            let content = doc.getContent();
            content._id = doc.key;

            let urlu;
            if (content && content.image && content.bucketName)
                urlu = await getPresignedUrl(content._id, content.image, content.bucketName);
            if (urlu) content.image = urlu;

            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateStorage: async (key, sU, sA, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let user = docToReplace.getContent();
            user.storageAvailable = Number(sA);
            user.storageUploaded = Number(sU);
            await collection.find().fetchArraySize(0).key(key).replaceOne(user);
        } catch (e) {
            throw new Error(e.meesage);
        }
    },
}
