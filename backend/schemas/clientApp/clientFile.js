module.exports = {
    findFileByName: async (name, _id, cat, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ name: name, postedFor: _id, cat: cat }).getOne();
            if (!doc) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createFile: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('File could not be created.');
            return doc.key
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
            document.versionId = docToReplace.key;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

}
