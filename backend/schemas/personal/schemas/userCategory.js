module.exports = {
    deleteAllByUser: async (_id, collection) => {
        try {
            await collection.find().filter({ uId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createCategory: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('Category could not be created.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findCatByName: async (name, pId, cats, collection) => {
        try {
            let doc;
            if (cats) {
                doc = await collection.find().fetchArraySize(0).filter({ uId: pId, name: name, parentCat: cats }).getOne();
            } else {
                doc = await collection.find().fetchArraySize(0).filter({ uId: pId, name: name, isChild: { $ne: true } }).getOne();
            }
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimitCombinedUSPL: async (_id, string, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id, isChild: { $ne: true }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).limit(15).getDocuments();
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

    findCatById: async (_id, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('User Category found');
            let document = doc.getContent();
            document._id = doc.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findCatByIdP: async (_id, collection, collectionUser) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('User Category found');
            let document = doc.getContent();
            document._id = doc.key;
            let userDoc = await collectionUser.find().fetchArraySize(0).key(document.uId).getOne();
            if (userDoc) {
                let tempDoc = userDoc.getContent();
                tempDoc._id = userDoc.key;
                document.uId = tempDoc;
            }
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getCatById: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) return false;
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            return false;
        }
    },

    getCatByIdC: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('User Category with this name already exists');
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

    getAllCats: async (_id, pCat, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id, parentCat: pCat }).getDocuments();
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

    getAllCatLimit: async (_id, cat, catId, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id, parentCat: catId }).getDocuments();
            if (doc) doc.map(document => {
                let content = document.getContent();
                content._id = document.key;
                cat !== content._id && cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    getAllQueryCatLimit: async (_id, cat, catId, string, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id, parentCat: catId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            if (doc) doc.map(document => {
                let content = document.getContent();
                content._id = document.key;
                cat !== content._id && cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    getAllCatCountU: async (_id, catId, collection) => {
        try {
            const doc = await collection.find().filter({ uId: _id, parentCat: catId, isChild: { $eq: true } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimitCombinedUP: async (_id, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id, isChild: { $ne: true } }).getDocuments();
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

    getAllCatLimitCombinedUSP: async (_id, string, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id, isChild: { $ne: true }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
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

    getMaxHirerchy: async (catId, collection) => {
        try {
            let len = 0;
            const doc = await collection.find().filter({ pCat: { $in: [catId] } }).getDocuments();
            if (doc) doc.map(docu => {
                let document = docu.getContent();
                if (document.pCat && document.pCat.length > 0 && document.pCat.length > len) len = document.pCat.length;
            });
            return len;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimitCombinedU: async (_id, catId, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id, parentCat: catId }).getDocuments();
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

    getAllCatLimitCombinedUS: async (_id, catId, string, collection) => {
        try {
            let cats = [];
            const doc = await collection.find().filter({ uId: _id, parentCat: catId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
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

    getAllCatLimitU: async (_id, limit, catId, collection) => {
        try {
            let cats = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12
            const doc = await collection.find().filter({ $query: { uId: _id, parentCat: catId, isChild: { $eq: true } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
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

    getAllQueryCatCountU: async (_id, string, catId, collection) => {
        try {
            const doc = await collection.find().filter({ uId: _id, isChild: { $eq: true }, parentCat: catId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllQueryCatLimitU: async (_id, limit, string, catId, collection) => {
        try {
            let cats = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12
            const doc = await collection.find().filter({ $query: { uId: _id, parentCat: catId, isChild: { $eq: true }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
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

    updateName: async (key, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.name = value;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateCategory: async (key, parentCat, pCat, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.parentCat = parentCat;
            document.pCat = pCat;
            document.isChild = parentCat ? true : false
            document.last_updated = new Date(Date.now());
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateAllChildPCat: async (key, tempR, parentCat, collection) => {
        try {
            let doc = await collection.find().filter({ pCat: { $in: [key] } }).getDocuments();

            if (doc) {
                await Promise.all(doc.map(async docToReplace => {
                    let document = docToReplace.getContent();
                    let pCats = document.pCat ? document.pCat : [];
                    pCats = pCats.filter(i => !tempR.includes(i));
                    pCats = parentCat.concat(pCats);
                    document.pCat = pCats;
                    await collection.find().fetchArraySize(0).key(docToReplace.key).replaceOne(document);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUptCatCountSC: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ uId: _id, updated: true }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateCatUpt: async (key, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.updated = value;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateCatUptST: async (key, collection) => {
        try {
            if (!key) return false;
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.last_updated = new Date(Date.now());
            document.pCat && document.pCat.length > 0 && await Promise.all(document.pCat.map(async i => {
                let docToR = await collection.find().fetchArraySize(0).key(i).getOne();
                if (docToR) {
                    let doc = docToR.getContent();
                    doc.last_updated = new Date(Date.now());
                    await collection.find().fetchArraySize(0).key(i).replaceOne(doc);
                }
            }));
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

}