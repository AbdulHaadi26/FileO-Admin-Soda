module.exports = {

    createCategory: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('Category could not be created.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCats: async (_id, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id }).getDocuments();
            if (doc) doc.map(document => {
                let content = document.getContent();
                content._id = document.key;
                cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findCatByName: async (name, pId, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ uId: pId, name: name }).getOne();
            if (doc) throw new Error('User Category with this name already exists');
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getCatById: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('User Category with this name already exists');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatCount: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ uId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCCatUptCountS: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ uId: _id, updated: true }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimit: async (_id, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id }).getDocuments();
            if (doc) doc.map(document => {
                let content = document.getContent();
                content._id = document.key;
                cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllQueryCatCount: async (_id, string, collection) => {
        try {
            const doc = await collection.find().filter({ uId: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllQueryCatLimit: async (_id, string, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            if (doc) doc.map(document => {
                let content = document.getContent();
                content._id = document.key;
                cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteFileUser: async (_id, collection) => {
        try {
            await collection.find().filter({ uId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateValue: async (key, value, desc, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.name = value;
            document.description = desc;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateCatUpt: async (key, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.updated = false;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteCat: async (_id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

}