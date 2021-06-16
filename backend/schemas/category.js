const { getPresignedUrl } = require("../middlewares/oci-sdk");

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

    getCatByIdC: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('User Category not found.');
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

    getAllCatLimitS: async (org, catId, _id, collection) => {
        try {
            let doc = await collection.find().filter({ org: org, parentCat: catId }).getDocuments();
            let cats = [];
            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                _id !== content._id && cats.push(content);
            });
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatLimit: async (org, auth, _id, collection) => {
        try {
            let doc;
            if (auth === 'true') doc = await collection.find().filter({ org: org, isChild: { $ne: true } }).getDocuments();
            else doc = await collection.find().filter({ org: org, isChild: { $ne: true }, ids: { $in: [_id] } }).getDocuments();
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

    getAllCatLimitQuery: async (org, string, auth, _id, collection) => {
        try {
            let doc;

            if (auth === 'true') doc = await collection.find().filter({ org: org, isChild: { $ne: true }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            else doc = await collection.find().filter({ org: org, isChild: { $ne: true }, ids: { $in: [_id] }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();

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

    updateCat: async (key, value, desc, collection) => {
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

    updateAssigned: async (key, _id, email, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            let assigned = document.assigned ? document.assigned : [];
            let ids = document.ids ? document.ids : [];
            assigned.push(email);
            ids.push(_id);
            document.assigned = assigned;
            document.ids = ids;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    updateAssignedAll: async (key, arr, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            let assigned = document.assigned ? document.assigned : [];
            let ids = document.ids ? document.ids : [];
            arr.map(i => {
                assigned.push(i.email);
                ids.push(i._id);
            });
            document.assigned = assigned;
            document.ids = ids;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    deleteAssigned: async (key, _id, email, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            let assigned = document.assigned ? document.assigned : [];
            let ids = document.ids ? document.ids : [];
            assigned = assigned.filter(i => i !== email);
            ids = ids.filter(i => i !== _id);
            document.assigned = assigned;
            document.ids = ids;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAssignedAll: async (key, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.assigned = [];
            document.ids = [];
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

    getAllCatUser: async (offsetN, _id, arrId, collection) => {
        try {
            let users = [];
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            let doc = await collection.find().filter({ $query: { current_employer: _id, userType: { $lt: 2 }, email: { $in: arrId } }, $orderby: { created: -1 } })
                .skip(skipInNumber).limit(12).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));

            return users;
        } catch (e) {
            throw new Error(e.message);
        }

    },

    getAllCatUserSearch: async (offsetN, string, _id, arrId, collection) => {
        try {
            let users = [];
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            let doc = await collection.find().filter({ $query: { current_employer: _id, userType: { $lt: 2 }, email: { $in: arrId }, $or: [{ name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }, $orderby: { created: -1 } })
                .skip(skipInNumber).limit(12).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateProfileUrl(tempDoc);
                users.push(tempDoc);
            }));

            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatUserSearchCount: async (string, _id, arrId, collection) => {
        try {
            let count = 0;
            let doc = await collection.find().filter({
                current_employer: _id, userType: { $lt: 2 },
                email: { $in: arrId }, $or: [{ name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }]
            }).count();

            if (doc) return doc.count;
            return count;
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
            document.assigned = [];
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
                    pCats = pCats.filter(i => !tempR.includes(i))
                    pCats = parentCat.concat(pCats);
                    document.pCat = pCats;
                    await collection.find().fetchArraySize(0).key(docToReplace.key).replaceOne(document);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },
}


async function generateProfileUrl(user) {
    var url = '';
    if (user && user.image && user.bucketName) url = await getPresignedUrl(user._id, user.image, user.bucketName)
    if (url) user.image = url;
}


