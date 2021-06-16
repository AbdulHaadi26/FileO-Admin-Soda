const {
    getPresignedUrl
} = require('../../../middlewares/oci-sdk');

module.exports = {

    getAllCFileLimitDashU: async (_id, collection, collectionCat) => {
        try {
            let files = [];
            const doc = await collection.find().filter({ $query: { postedFor: _id, isVersion: false }, $orderby: { created: -1 } }).limit(5).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                if (tempDoc.category) {
                    let catDoc = await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne();
                    if (catDoc) {
                        let tempCat = catDoc.getContent();
                        tempCat._id = catDoc.key;
                        tempDoc.category = tempCat;
                    };
                }
                tempDoc.location = 'Client Files';
                files.push(tempDoc)
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCFileDashCountU: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ postedFor: _id, isVersion: false }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllClientFilesOfUser: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ postedby: _id }).getDocuments();
            let files = [];
            if (doc) await Promise.all(doc.map(async document => {
                let content = document.getContent();
                content._id = document.key;
                files.push(content);
            }));
            return files;
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
            document.versionId = key;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateValue: async (key, field, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            switch (field) {
                case 'name': document.name = value; break;
                case 'description': document.description = value; break;
                case 'category': document.category = value; break;
                case 'updated': document.updated = value; break;
            }
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateDetails: async (key, name, desc, cat, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.name = name;
            document.description = desc;
            document.category = cat;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteFile: async (key, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(key).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNamesByArr: async (list, cat, collection) => {
        try {
            let names = [], nameS = [], filterArr = [], arr = [];
            if (list && list.length > 0) {
                const docName = await collection.find().filter({ versionId: { $in: list } }).getDocuments();
                if (docName) {
                    docName.map(document => {
                        let tempDocName = document.getContent();
                        tempDocName._id = document.key;
                        names.push(tempDocName);
                        nameS.push(tempDocName.name);
                    })
                }
                if (names && names.length > 0) {
                    const docFilter = await collection.find().filter({ name: { $in: nameS }, category: cat }).getDocuments();
                    if (docFilter) {
                        docFilter.map(document => {
                            let tempFilter = document.getContent();
                            filterArr.push(tempFilter);
                        });
                    }
                }
                if (filterArr && filterArr.length > 0 && names && names.length > 0) {
                    names = names.filter(rt => !filterArr.find(i => rt.name === i.name));
                    names.map(i => arr.push(i._id));
                } else if (names && names.length > 0) names.map(i => arr.push(i._id));
            }
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFilesCat: async (list, id, collection) => {
        try {
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: list } }).getDocuments();
                if (doc) doc.map(async document => {
                    let tempDoc = document.getContent();
                    tempDoc.category = id;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
                });
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findMultipleFilesArr: async (list, collection) => {
        try {
            let files = [];
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: list } }).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    files.push(tempDoc);
                }));
            }
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteMultipleFilesArr: async (list, collection) => {
        try {
            await collection.find().filter({ versionId: { $in: list } }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFilePerm: async (key, active, versioning, compare, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.active = active;
            document.versioning = versioning;
            document.compare = compare;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findFileByName: async (name, _id, category, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ name: name, postedFor: _id, category: category }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findFileByNameC: async (name, postedby, category, collection, collectionCat) => {
        try {
            const document = await collection.find().fetchArraySize(0).filter({ name: name, postedFor: postedby, category: category }).getOne();
            if (!document) return false;

            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            let doc = await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne();
            if (doc) {
                let tempCat = doc.getContent();
                tempCat._id = doc.key;
                tempDoc.category = tempCat;
            }
            return tempDoc;

        } catch (e) {
            throw new Error(e.message);
        }
    },

    getFile: async (_id, collection, collectionCat) => {
        try {
            const document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) return false;
            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            let doc;
            if (tempDoc.category) doc = await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne();
            if (doc) {
                let tempCat = doc.getContent();
                tempCat._id = doc.key;
                tempDoc.category = tempCat;
            }
            await generateFileUrl(tempDoc);
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileVersion: async (_id, collection, collectionUser) => {
        try {
            const doc = await collection.find().filter({ $query: { versionId: _id }, $orderby: { created: -1 } }).getDocuments();
            let files = [];
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let tempUser = await collectionUser.find().fetchArraySize(0).key(tempDoc.postedby).getOne();
                if (tempUser) {
                    let user = tempUser.getContent();
                    user._id = tempUser.key;
                    tempDoc.postedby = user;
                };
                [await generateFileUrl(tempDoc), await generateProfileUrl(tempDoc)];
                files.push(tempDoc);
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatFileCount: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ category: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteFileUser: async (_id, collection) => {
        try {
            await collection.find().filter({ userId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCFileUptCount: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ postedFor: _id, isVersion: false, updated: true }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimitUCD: async (pId, collection) => {
        try {
            let files = [];
            var end = new Date();
            end = new Date(end.setHours(0, 0, 0, 0));
            end = new Date(end.setDate(end.getDate() - 7));
            let doc = await collection.find().filter({ postedFor: pId, date: { $gte: end } }).getDocuments();
            if (doc) {
                doc.map(document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    tempDoc.renderType = "Client File";
                    files.push(tempDoc);
                });
            }
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateCat: async (key, cat, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.category = cat;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);

            let docArr = await collection.find().filter({ versionId: document.versionId, isVersion: true }).getDocuments();
            if (docArr) await Promise.all(docArr.map(async doc => {
                let docR = doc.getContent();
                docR.category = cat;
                await collection.find().fetchArraySize(0).key(doc.key).replaceOne(docR);
            }));

            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findCFileById: async (_id, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('File with this key does not exists');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryCount: async (pId, string, cat, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedFor: pId, category: cat, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else doc = await collection.find().filter({ postedFor: pId, category: cat, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryLimit: async (pId, string, cat, type, collection) => {
        try {
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ postedFor: pId, category: cat, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            else doc = await collection.find().filter({ postedFor: pId, category: cat, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();

            if (doc) doc.map(document => {
                let tempFile = document.getContent();
                tempFile._id = document.key;
                files.push(tempFile);
            });
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCount: async (pId, cat, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedFor: pId, category: cat }).count();
            else doc = await collection.find().filter({ postedFor: pId, category: cat, type: type }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimit: async (pId, cat, type, collection) => {
        try {
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ postedFor: pId, category: cat }).getDocuments();
            else doc = await collection.find().filter({ postedFor: pId, category: cat, type: type }).getDocuments();

            if (doc) doc.map(document => {
                let tempFile = document.getContent();
                tempFile._id = document.key;
                files.push(tempFile);
            });
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFileCountS: async (_id, collection) => {
        try {
            const document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (document) {
                let tempDoc = document.getContent();
                if (tempDoc.updated) {
                    tempDoc.updated = false;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
                }
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    downloadFile: async (_id, collection) => {
        try {
            const document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) return false;
            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            await generateDownFileUrl(tempDoc);
            return tempDoc;
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

    getAllFileQueryCountC: async (pId, string, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedFor: pId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else doc = await collection.find().filter({ postedFor: pId, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryLimitC: async (offsetN, pId, string, type, collection, collectionCat) => {
        try {
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ $query: { postedFor: pId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { postedFor: pId, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile._id = document.key;
                let category = tempFile.category;
                if (category) {
                    let tempCat = await collectionCat.find().fetchArraySize(0).key(category).getOne();
                    if (tempCat) {
                        let cat = tempCat.getContent();
                        cat._id = tempCat.key;
                        tempFile.category = cat;
                    }
                }
                files.push(tempFile);
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCountC: async (pId, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedFor: pId }).count();
            else doc = await collection.find().filter({ postedFor: pId, type: type }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimitC: async (offsetN, pId, type, collection, collectionCat) => {
        try {
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ $query: { postedFor: pId }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { postedFor: pId, type: type }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile._id = document.key;
                let category = tempFile.category;
                if (category) {
                    let tempCat = await collectionCat.find().fetchArraySize(0).key(category).getOne();
                    if (tempCat) {
                        let cat = tempCat.getContent();
                        cat._id = tempCat.key;
                        tempFile.category = cat;
                    }
                }
                files.push(tempFile);
            }));
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

async function generateProfileUrl(file) {
    var url = '';
    if (file.postedby && file.postedby.image && file.postedby.bucketName) url = await getPresignedUrl(file.postedby._id, file.postedby.image, file.postedby.bucketName);
    if (url) file.postedby.image = url;
}