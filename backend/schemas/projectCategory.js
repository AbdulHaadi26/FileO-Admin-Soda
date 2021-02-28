module.exports = {
    getAllCatsCount: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ pId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatsQueryC: async (_id, string, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ parentCat: _id, isChild: { $eq: true }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
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

    getAllCatsC: async (_id, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ parentCat: _id, isChild: { $eq: true } }).getDocuments();
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


    findCatByName: async (name, pId, pCat, collection) => {
        try {
            let doc;
            if (pCat) {
                doc = await collection.find().fetchArraySize(0).filter({ pId: pId, name: name, parentCat: pCat }).getOne();
            } else {
                doc = await collection.find().fetchArraySize(0).filter({ pId: pId, name: name, isChild: { $ne: true } }).getOne();
            }
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createCategory: async (data, collection) => {
        try {
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCats: async (_id, pCat, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ pId: _id, parentCat: pCat }).getDocuments();
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

    getAllCatCount: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ pId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatCountP: async (pIds, collection) => {
        try {
            if (pIds && pIds.length > 0) {
                const doc = await collection.find().filter({ pId: { $in: pIds } }).count();
                if (doc) return doc.count;
            }
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAllCatPid: async (pId, collection) => {
        try {
            await collection.find().filter({ pId: pId }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimit: async (_id, limit, collection) => {
        try {
            let cats = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12
            const doc = await collection.find().filter({ $query: { pId: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
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

    getAllCatLimitSP: async (_id, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ pId: _id, isChild: { $ne: true } }).getDocuments();
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

    getAllCatLimitSPM: async (_ids, collection) => {
        try {
            let cats = [];
            if (_ids && _ids.length > 0) {
                const doc = await collection.find().filter({ pId: { $in: _ids }, isChild: { $ne: true } }).getDocuments();
                if (doc) doc.map(document => {
                    let content = document.getContent();
                    content._id = document.key;
                    cats.push(content);
                });
            }
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimitP: async (pIds, limit, collection, collectionProj) => {
        try {
            let cats = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12
            if (pIds && pIds.length > 0) {
                const doc = await collection.find().filter({ $query: { pId: { $in: pIds } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let content = document.getContent();
                    content._id = document.key;
                    let tempProj = await collectionProj.find().fetchArraySize(0).key(content.pId).getOne();
                    if (tempProj) {
                        let project = tempProj.getContent();
                        project._id = tempProj.key;
                        content.pId = project;
                        cats.push(content);
                    }
                }));
            }
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllQueryCatCount: async (_id, string, collection) => {
        try {
            const doc = await collection.find().filter({ pId: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllQueryCatCountP: async (pIds, string, collection) => {
        try {
            if (pIds && pIds.length > 0) {
                const doc = await collection.find().filter({ pId: { $in: pIds }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                if (doc) return doc.count;
            }
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateValue: async (key, desc, value, collection) => {
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

    deleteAllCatFiles: async (_id, collection) => {
        try {
            await collection.find().filter({ uId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllQueryCatLimit: async (_id, limit, string, collection) => {
        try {
            let cats = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12
            const doc = await collection.find().filter({ $query: { pId: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
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

    getAllQueryCatLimitSP: async (_id, string, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ pId: _id, isChild: { $ne: true }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
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

    getAllQueryCatLimitSPM: async (_ids, string, collection) => {
        try {
            let cats = [];

            if (_ids && _ids.length > 0) {
                const doc = await collection.find().filter({ pId: { $in: _ids }, isChild: { $ne: true }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
                if (doc) doc.map(document => {
                    let content = document.getContent();
                    content._id = document.key;
                    cats.push(content);
                });
            }
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllQueryCatLimitP: async (pIds, limit, string, collection, collectionProj) => {
        try {
            let cats = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12
            if (pIds && pIds.length > 0) {
                const doc = await collection.find().filter({ $query: { pId: { $in: pIds }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let content = document.getContent();
                    content._id = document.key;
                    let tempProj = await collectionProj.find().fetchArraySize(0).key(content.pId).getOne();
                    if (tempProj) {
                        let project = tempProj.getContent();
                        project._id = tempProj.key;
                        content.pId = project;
                        cats.push(content);
                    }
                }));
            }
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getProjectManagerUserCats: async (pIds, collection) => {
        try {
            let arr = [];
            if (pIds && pIds.length > 0) {
                let doc = await collection.find().filter({ pId: { $in: pIds } }).getDocuments();
                doc && doc.map(document => arr.push(document.key));
            }
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getCatById: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('Project Category with this name already exists');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
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