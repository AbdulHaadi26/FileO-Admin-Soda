
const { getPresignedUrl } = require('../middlewares/oci-sdk');

module.exports = {

    findMultipleFilesArrId: async (list, collection) => {
        try {
            let files = [];
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: list }, isVersion: false }).getDocuments();
                if (doc) doc.map(document => {
                    let content = document.getContent();
                    content._id = document.key;
                    files.push(content);
                });
            }
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findMultipleFilesArrIdVer: async (id, collection) => {
        try {
            let files = [];
            const doc = await collection.find().filter({ versionId: id, isVersion: true }).getDocuments();
            if (doc) doc.map(document => {
                let content = document.getContent();
                content._id = document.key;
                files.push(content);
            });
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateVersionId: async (key, url, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.versionId = docToReplace.key;
            document.url = url;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
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
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFileValue: async (key, field, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            switch (field) {
                case 'name': document.name = value; break;
                case 'description': document.description = value; break;
                case 'category': document.category = value; break;
            }
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFilePerm: async (key, active, versioning, compare, latest, uploadable, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.active = active;
            document.versioning = versioning;
            document.compare = compare;
            document.latest = latest;
            document.uploadable = uploadable;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateDetails: async (key, name, desc, cat, active, versioning, compare, uploadable, latest, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.name = name;
            document.description = desc;
            document.category = cat;
            document.active = active;
            document.versioning = versioning;
            document.compare = compare;
            document.uploadable = uploadable;
            document.latest = latest;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
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

    getAllCatFile: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ category: _id }).getDocuments();
            let files = [];
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                files.push(tempDoc);
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    resetVersion: async (_id, ver, collection) => {
        try {
            var key;
            let doc = await collection.find().filter({ versionId: _id, version: { $gt: Number(ver) } }).getDocuments();

            if (doc) doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc.version = Number(tempDoc.version) - 1;
                if (Number(tempDoc.version) === 0) {
                    key = document.key;
                }
            });

            if (key) {
                if (doc) await Promise.all(doc.map(async document => {
                    let tempDoc = document.getContent();
                    tempDoc.versionId = key;
                    tempDoc.version = Number(tempDoc.version) - 1;
                    if (Number(tempDoc.version) === 0)
                        tempDoc.isVersion = false;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
                }));
            } else {
                await Promise.all(doc.map(async document => {
                    let tempDoc = document.getContent();
                    tempDoc.version = Number(tempDoc.version) - 1;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
                }));
            }

            if (key)
                return key;
            else return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileVersionSkipped: async (_id, fileId, collection, collectionUser) => {
        try {
            const doc = await collection.find().filter({ $query: { versionId: _id }, $orderby: { created: -1 } }).getDocuments();
            let files = [];
            if (doc) await Promise.all(doc.map(async document => {
                if (fileId !== document.key) {
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
                }
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileDelVer: async (key, collection) => {
        try {
            let doc = await collection.find().filter({ versionId: key }).getDocuments();
            let arr = [];
            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                arr.push(tempDoc);
            });
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getLatestVer: async (key, collection) => {
        try {
            let doc = await collection.find().filter({ $query: { versionId: key }, $orderby: { version: 1 } }).getDocuments();
            let item;
            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                item = tempDoc;
            });
            return item;
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

    createFile: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('File could not be created.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findFileByName: async (name, org, category, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ org: org, name: name, category: category }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findFileByNameC: async (name, org, category, collection, collectionCat) => {
        try {
            const document = await collection.find().fetchArraySize(0).filter({ name: name, org: org, category: category }).getOne();
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

    findFileByNameVer: async (name, org, category, version, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ org: org, name: name, version: Number(version), category: category }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFilesCat: async (list, id, collection) => {
        try {
            const doc = await collection.find().filter({ versionId: { $in: list } }).getDocuments();
            if (doc) doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc.category = id;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
            });
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

    findFileById: async (_id, collection) => {
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

    getAllFileCount: async (org, cat, type, auth, collection) => {
        try {
            let doc;
            if (auth === 'true') {
                if (type === 'All') doc = await collection.find().filter({ org: org, category: cat, isVersion: false }).count();
                else doc = await collection.find().filter({ org: org, category: cat, type: type, isVersion: false }).count();
            } else {
                if (type === 'All') doc = await collection.find().filter({ org: org, category: cat, active: true, isVersion: false }).count();
                else doc = await collection.find().filter({ org: org, category: cat, type: type, active: true, isVersion: false }).count();
            }
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimit: async (org, cat, type, auth, collection) => {
        try {
            let doc;

            if (auth === 'true') {
                if (type === 'All') doc = await collection.find().filter({ org: org, category: cat, isVersion: false }).getDocuments();
                else doc = await collection.find().filter({ org: org, category: cat, type: type, isVersion: false }).getDocuments();
            } else {
                if (type === 'All') doc = await collection.find().filter({ org: org, category: cat, active: true, isVersion: false }).getDocuments();
                else doc = await collection.find().filter({ org: org, category: cat, type: type, active: true, isVersion: false }).getDocuments();
            }

            let files = [];
            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                files.push(tempDoc);
            });
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryCount: async (org, string, cat, type, auth, collection) => {
        try {
            let doc;
            if (auth === 'true') {
                if (type === 'All') doc = await collection.find().filter({ org: org, category: cat, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, isVersion: false }).count();
                else doc = await collection.find().filter({ org: org, category: cat, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, isVersion: false }).count();
            } else {
                if (type === 'All') doc = await collection.find().filter({ org: org, category: cat, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, active: true, isVersion: false }).count();
                else doc = await collection.find().filter({ org: org, category: cat, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, active: true, isVersion: false }).count();
            }
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryLimit: async (org, string, cat, type, auth, collection) => {
        try {
            let doc;

            if (auth === 'true') {
                if (type === 'All') doc = await collection.find().filter({ org: org, category: cat, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, isVersion: false }).getDocuments();
                else doc = await collection.find().filter({ org: org, category: cat, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, type: type, isVersion: false }).getDocuments();
            } else {
                if (type === 'All') doc = await collection.find().filter({ org: org, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, category: cat, active: true, isVersion: false }).getDocuments();
                else doc = await collection.find().filter({ org: org, category: cat, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, type: type, active: true, isVersion: false }).getDocuments();
            }

            let files = [];

            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                files.push(tempDoc);
            });
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatFileCount: async (org, collection) => {
        try {
            const doc = await collection.find().filter({ org: org, isVersion: false }).count();
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimitDashA: async (org, collection, collectionC) => {
        try {
            const doc = await collection.find().filter({ $query: { org: org, isVersion: false }, $orderby: { created: -1 } }).limit(5).getDocuments();;
            let files = [];
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let catDoc;
                if (tempDoc.category) {
                    catDoc = await collectionC.find().fetchArraySize(0).key(tempDoc.category).getOne();
                    if (catDoc) {
                        let tempCat = catDoc.getContent();
                        tempCat._id = catDoc.key;
                        tempDoc.location = 'Company Files';
                        tempDoc.category = tempCat;
                        files.push(tempDoc);
                    }
                }
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCountType: async (org, types, collection) => {
        try {
            const doc = await collection.find().filter({ org: org, isVersion: false, type: { $in: types } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFilesByCategory: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ category: _id }).getDocuments();
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

    deleteAllFilesByCategory: async (_id, collection) => {
        try {
            await collection.find().filter({ category: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getVerCount: async (key, collection) => {
        try {
            let doc = await collection.find().filter({ versionId: key }).count();
            if (!doc || doc.count === 0) throw new Error('Count not found');

            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileVersionC: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ $query: { versionId: _id }, $orderby: { created: -1 } }).getDocuments();
            let files = [];
            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                files.push(tempDoc);
            });
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateLatestVer: async (key, len, versionId, cat, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.version = Number(len);
            document.isVersion = true;
            document.versionId = versionId;
            document.category = cat;
            if (Number(len) === 0) {
                document.isVersion = false;
            }
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getFile: async (_id, collection, collectionCat, collectionUser) => {
        try {
            const document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) return false;
            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            let [doc, user] = [await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne(), await collectionUser.find().fetchArraySize(0).key(tempDoc.postedby).getOne()];
            if (doc) {
                let tempCat = doc.getContent();
                tempCat._id = doc.key;
                tempDoc.category = tempCat;
            }
            if (user) {
                let tempUser = user.getContent();
                tempUser._id = user.key;
                tempDoc.postedby = tempUser;
                [await generateFileUrl(tempDoc), generateProfileUrl(tempDoc)];
            }
            return tempDoc;
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

                    [await generateDownFileUrl(tempDoc), await generateProfileUrl(tempDoc)];
                    files.push(tempDoc);
                };
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCountM: async (org, cats, type, auth, collection) => {
        try {
            let doc;
            if (auth === 'true') {
                if (type === 'All') doc = await collection.find().filter({ org: org, isVersion: false }).count();
                else doc = await collection.find().filter({ org: org, type: type, isVersion: false }).count();
            } else {
                if (cats && cats.length > 0) {
                    if (type === 'All') doc = await collection.find().filter({ org: org, category: { $in: cats }, active: true, isVersion: false }).count();
                    else doc = await collection.find().filter({ org: org, category: { $in: cats }, type: type, active: true, isVersion: false }).count();
                }
            }
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCountMD: async (org, cats, admin, collection) => {
        try {
            var end = new Date();
            end = new Date(end.setHours(0, 0, 0, 0));
            end = new Date(end.setDate(end.getDate() - 7));
            let doc;
            if (!admin) { if (cats && cats.length > 0) doc = await collection.find().filter({ org: org, category: { $in: cats }, active: true, isVersion: false, date: { $gte: end } }).count(); }
            else doc = await collection.find().filter({ org: org, active: true, isVersion: false, date: { $gte: end } }).count();
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimitMD: async (org, cats, admin, collection) => {
        try {
            let files = [];
            var end = new Date();
            end = new Date(end.setHours(0, 0, 0, 0));
            end = new Date(end.setDate(end.getDate() - 7));
            if (!admin) {
                if (cats && cats.length > 0) {
                    let doc = await collection.find().filter({ org: org, category: { $in: cats }, active: true, isVersion: false, date: { $gte: end } }).getDocuments();

                    if (doc) doc.map(document => {
                        let tempDoc = document.getContent();
                        tempDoc._id = document.key;
                        tempDoc.renderType = "File";
                        files.push(tempDoc);
                    });
                }
            } else {
                let doc = await collection.find().filter({ org: org, active: true, isVersion: false, date: { $gte: end } }).getDocuments();

                if (doc) doc.map(document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    tempDoc.renderType = "File";
                    files.push(tempDoc);
                });
            }

            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimitM: async (offsetN, org, cats, type, auth, collection, collectionUser, collectionCat) => {
        try {
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;

            let doc;
            let files = [];

            if (auth === 'true') {
                if (type === 'All') doc = await collection.find().filter({ $query: { org: org, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                else doc = await collection.find().filter({ $query: { org: org, type: type, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            } else {
                if (cats && cats.length > 0) {
                    if (type === 'All') doc = await collection.find().filter({ $query: { org: org, category: { $in: cats }, active: true, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    else doc = await collection.find().filter({ $query: { org: org, category: { $in: cats }, type: type, active: true, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                }
            }
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let [userTemp, catTemp] = [await collectionUser.find().fetchArraySize(0).key(tempDoc.postedby).getOne(), await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne()];
                if (userTemp && catTemp) {
                    let user = userTemp.getContent();
                    let cat = catTemp.getContent();
                    cat._id = catTemp.key;
                    user._id = userTemp.key;
                    tempDoc.postedby = user;
                    tempDoc.category = cat;
                    files.push(tempDoc);
                }
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryCountM: async (org, string, cats, type, auth, collection) => {
        try {
            let doc;
            if (auth === 'true') {
                if (type === 'All') doc = await collection.find().filter({ org: org, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, isVersion: false }).count();
                else doc = await collection.find().filter({ org: org, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, isVersion: false }).count();
            } else {
                if (cats && cats.length > 0) {
                    if (type === 'All') doc = await collection.find().filter({ org: org, category: { $in: cats }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, active: true, isVersion: false }).count();
                    else doc = await collection.find().filter({ org: org, category: { $in: cats }, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, active: true, isVersion: false }).count();
                }
            }

            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryLimitM: async (offsetN, org, string, cats, type, auth, collection, collectionUser, collectionCat) => {
        try {
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;

            let doc;

            if (auth === 'true') {
                if (type === 'All') doc = await collection.find().filter({ $query: { org: org, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                else doc = await collection.find().filter({ $query: { org: org, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, type: type, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            } else {
                if (cats && cats.length > 0) {
                    if (type === 'All') doc = await collection.find().filter({ $query: { org: org, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, category: { $in: cats }, active: true, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    else doc = await collection.find().filter({ $query: { org: org, category: { $in: cats }, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, type: type, active: true, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                }
            }

            let files = [];

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let [userTemp, catTemp] = [await collectionUser.find().fetchArraySize(0).key(tempDoc.postedby).getOne(), await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne()];
                if (userTemp && catTemp) {
                    let user = userTemp.getContent();
                    let cat = catTemp.getContent();
                    cat._id = catTemp.key;
                    user._id = userTemp.key;
                    tempDoc.postedby = user;
                    tempDoc.category = cat;
                    files.push(tempDoc);
                }
            }));

            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteMultipleFileArr: async (arr, collection) => {
        try {
            if (arr && arr.length > 0) await collection.find().filter({ versionId: { $in: arr } }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getMultipleFileArr: async (arr, collection) => {
        try {
            let files = [];
            if (arr && arr.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: arr } }).getDocuments();
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

    getAllFileLimitDashU: async (org, cats, collection, collectionCat) => {
        try {
            let files = [];
            if (cats && cats.length > 0) {
                const doc = await collection.find().filter({ $query: { org: org, category: { $in: cats }, isVersion: false }, $orderby: { created: -1 } }).limit(5).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    if (tempDoc.category) {
                        let catDoc = await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne();
                        if (catDoc) {
                            let tempCat = catDoc.getContent();
                            tempCat._id = catDoc.key;
                            tempDoc.category = tempCat;
                            tempDoc.location = 'Company Files';
                            files.push(tempDoc);
                        };
                    }
                }));
            }
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileDashCountU: async (org, cats, collection) => {
        try {
            if (cats && cats.length > 0) {
                const doc = await collection.find().filter({ org: org, category: { $in: cats }, isVersion: false }).count();
                if (doc) return doc.count;
            }
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllCatFileCountU: async (org, cats, collection) => {
        try {
            if (cats && cats.length > 0) {
                const doc = await collection.find().filter({ org: org, category: { $in: cats } }).count();
                if (doc) return doc.count;
            }
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    }
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

