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

    getAllCatCount: async (org, collection) => {
        try {
            const doc = await collection.find().filter({ org: org }).count();
            if (!doc) throw new Error('Category count not found');
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getCat: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('Category not found');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimit: async (org, collection) => {
        try {
            const doc = await collection.find().filter({ org: org, isChild: { $ne: true } }).getDocuments();
            let cats = [];
            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimitQuery: async (org, string, collection) => {
        try {
            const doc = await collection.find().filter({ org: org, isChild: { $ne: true }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            let cats = [];
            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimitC: async (org, catId, collection) => {
        try {
            const doc = await collection.find().filter({ org: org, parentCat: catId, isChild: { $eq: true } }).getDocuments();
            let cats = [];
            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimitQueryC: async (org, catId, string, collection) => {
        try {
            const doc = await collection.find().filter({ org: org, parentCat: catId, isChild: { $eq: true }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            let cats = [];
            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    getAllCatCountQuery: async (org, string, collection) => {
        try {
            const doc = await collection.find().filter({ org: org, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (!doc) throw new Error('Category count not found');
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findCatByName: async (org, name, cats, collection) => {
        try {
            let doc;
            if (cats) {
                doc = await collection.find().fetchArraySize(0).filter({ org: org, name: name, parentCat: cats }).getOne();
            } else {
                doc = await collection.find().fetchArraySize(0).filter({ org: org, name: name, isChild: { $ne: true } }).getOne();
            }
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCats: async (_id, pCat, collection) => {
        try {
            const doc = await collection.find().filter({ org: _id, parentCat: pCat }).getDocuments();
            let cats = [];
            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateName: async (key, value, desc, collection) => {
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

    deleteCat: async (key, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(key).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllChildCats: async (_id, collection) => {
        try {
            let keys = [];
            let doc = await collection.find().filter({ pCat: { $in: [_id] } }).getDocuments();
            if (doc) doc.map(document => {
                keys.push(document.key);
            });

            return keys;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteChildCat: async (_id, collection) => {
        try {
            await collection.find().filter({ pCat: { $in: [_id] } }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllChildFiles: async (_ids, collection) => {
        let files = [];
        try {
            if (_ids && _ids.length > 0) {
                const doc = await collection.find().filter({ category: { $in: _ids } }).getDocuments();

                if (doc) doc.map(document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    files.push(tempDoc);
                });
            }
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },
}

