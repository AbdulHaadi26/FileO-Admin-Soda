const { getPresignedUrl } = require('../middlewares/oci-sdk');

module.exports = {

    deleteFilesUser: async (key, collection) => {
        try {
            await collection.find().filter({ postedby: key }).remove();
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

    updateFileUpt: async (key, value, collection) => {
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

    updateFileUptST: async (key, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.last_updated = new Date(Date.now());
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteMultipleFiles: async (_id, collection) => {
        try {
            await collection.find().filter({ postedby: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findUFileById: async (_id, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let content = doc.getContent();
                content._id = doc.key;
                return content;
            }
            return false;
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
                if (doc) await Promise.all(doc.map(async document => {
                    let tempDoc = document.getContent();
                    tempDoc.category = id;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
                }));
            }
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
                case 'update': document.updated = value; break;
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

    downloadFile: async (_id, collection) => {
        try {
            const document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) throw new Error('File not found');

            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            await generateDownFileUrl(tempDoc);
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUFileLimitDashU: async (_id, collection) => {
        try {
            let files = [];
            const doc = await collection.find().filter({ $query: { postedby: _id, isVersion: false }, $orderby: { created: -1 } }).limit(5).getDocuments();
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

    createFile: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('File could not be created.');
            return doc.key
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

    findFileByIdP: async (_id, collection, collectionUser) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('File with this key does not exists');
            let content = doc.getContent();

            content._id = doc.key;
            let userDoc = await collectionUser.find().fetchArraySize(0).key(content.postedby).getOne();

            if (!userDoc) throw new Error('User with this key does not exists');

            let tempUser = userDoc.getContent();
            tempUser._id = userDoc.key;

            content.postedby = tempUser;
            return content;
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

    findFileByName: async (name, postedby, category, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ name: name, postedby: postedby, category: category }).getOne();
            if (doc) throw new Error('File with this name already exists');
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findFileByNameVer: async (name, postedby, category, version, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ postedby: postedby, name: name, version, category: category }).getOne();
            if (doc) throw new Error('File with this name already exists');
            return false;
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

    getAllFileCount: async (pId, cat, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedby: pId, category: cat, isVersion: false }).count();
            else doc = await collection.find().filter({ postedby: pId, category: cat, type: type, isVersion: false }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCountD: async (pId, collection) => {
        try {
            let doc = await collection.find().filter({ postedby: pId, isVersion: false }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUFileLimitDashU: async (_id, collection, collectionCat) => {
        try {
            let files = [];
            const doc = await collection.find().filter({ $query: { postedby: _id, isVersion: false }, $orderby: { created: -1 } }).limit(5).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                if (tempDoc.category) {
                    let catDoc = await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne();
                    if (catDoc) {
                        let tempCat = catDoc.getContent();
                        tempCat._id = catDoc.key;
                        tempDoc.location = 'User Files';
                        tempDoc.category = tempCat;
                        files.push(tempDoc)
                    };
                }
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCountOrgU: async (org, collection) => {
        try {
            let doc = await collection.find().filter({ org: org, isVersion: false }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimit: async (offsetN, pId, cat, type, collection, collectionUser) => {
        try {
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ $query: { postedby: pId, category: cat, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { postedby: pId, category: cat, type: type, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) {
                let userDoc = await collectionUser.find().fetchArraySize(0).key(pId).getOne();
                let tempUser;

                if (userDoc) {
                    tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                } else tempUser = pId;

                doc.map(document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    tempDoc.postedby = tempUser;
                    files.push(tempDoc);
                });
            }
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimitCombinedU: async (pId, cat, type, collection) => {
        try {
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ postedby: pId, category: cat, isVersion: false }).getDocuments();
            else doc = await collection.find().filter({ postedby: pId, category: cat, type: type, isVersion: false }).getDocuments();
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

    getAllFileLimitCombinedUS: async (pId, cat, type, string, collection) => {
        try {
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ postedby: pId, category: cat, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
            else doc = await collection.find().filter({ postedby: pId, category: cat, type: type, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
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

    getFile: async (_id, collection, collectionCat) => {
        try {
            const document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) throw new Error('File not found');
            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            let doc = await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne();
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

    resetVersion: async (_id, ver, collection) => {
        try {
            const doc = await collection.find().filter({ versionId: _id, version: { $gt: Number(ver) } }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc.version = Number(tempDoc.version) - 1;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
            }));
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

    getAllFileQueryCount: async (pId, string, cat, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedby: pId, category: cat, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else doc = await collection.find().filter({ postedby: pId, category: cat, type: type, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryLimit: async (offsetN, pId, string, cat, type, collection, collectionUser) => {
        try {
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ $query: { postedby: pId, category: cat, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { postedby: pId, category: cat, type: type, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            if (doc) {
                let userDoc = await collectionUser.find().fetchArraySize(0).key(pId).getOne();
                let tempUser;
                if (userDoc) {
                    tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                } else tempUser = pId;
                doc.map(document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    tempDoc.postedby = tempUser;
                    files.push(tempDoc);
                });
            }
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAllCatFiles: async (_id, collection) => {
        try {
            await collection.find().filter({ category: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteMultipleFilesArr: async (list, collection) => {
        try {
            if (list && list.length > 0) await collection.find().filter({ versionId: { $in: list } }).remove();
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

    findMultipleFilesArrId: async (list, collection) => {
        try {
            let files = [];
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: list }, isVersion: false }).getDocuments();
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

    getAllFileCountN: async (pId, type, cId, collection) => {
        try {
            let doc;
            if (type === 'All') {
                if (cId) doc = await collection.find().filter({ postedby: pId, category: cId, isVersion: false }).count();
                else doc = await collection.find().filter({ postedby: pId, isVersion: false }).count();
            } else {
                if (cId) doc = await collection.find().filter({ postedby: pId, category: cId, type: type, isVersion: false }).count();
                else doc = await collection.find().filter({ postedby: pId, type: type, isVersion: false }).count();
            }
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimitN: async (offsetN, pId, type, cId, collection) => {
        try {
            let skipInNumber = Number(offsetN), files = [];
            skipInNumber = skipInNumber * 12;
            if (type === 'All') {
                if (cId) doc = await collection.find().filter({ $query: { postedby: pId, category: cId, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                else doc = await collection.find().filter({ $query: { postedby: pId, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            } else {
                if (cId) doc = await collection.find().filter({ $query: { postedby: pId, category: cId, type: type, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                else doc = await collection.find().filter({ $query: { postedby: pId, type: type, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            }

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateFileUrl(tempDoc);
                files.push(tempDoc);
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryCountN: async (pId, string, type, cId, collection) => {
        try {
            let doc;
            if (type === 'All') {
                if (cId) doc = await collection.find().filter({ postedby: pId, category: cId, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                else doc = await collection.find().filter({ postedby: pId, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            } else {
                if (cId) doc = await collection.find().filter({ postedby: pId, category: cId, type: type, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                else doc = await collection.find().filter({ postedby: pId, type: type, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            }
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryLimitN: async (offsetN, pId, string, type, cId, collection) => {
        try {
            let skipInNumber = Number(offsetN), files = [];
            skipInNumber = skipInNumber * 12;
            if (type === 'All') {
                if (cId) doc = await collection.find().filter({ $query: { postedby: pId, category: cId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } }, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                else doc = await collection.find().filter({ $query: { postedby: pId, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            } else {
                if (cId) doc = await collection.find().filter({ $query: { postedby: pId, category: cId, type: type, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                else doc = await collection.find().filter({ $query: { postedby: pId, type: type, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            }

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                await generateFileUrl(tempDoc);
                files.push(tempDoc);
            }));
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    transferFiles: async (_id, catId, userId, collection) => {
        try {
            const doc = await collection.find().filter({ postedby: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc.category = catId;
                tempDoc.postedby = userId;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    transferFilesSize: async (_id, collection) => {
        try {
            let size = 0;
            const doc = await collection.find().filter({ postedby: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(document => {
                let tempDoc = document.getContent();
                size += tempDoc.size;
            }));
            return size;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCountU: async (pId, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedby: pId, isVersion: false }).count();
            else doc = await collection.find().filter({ postedby: pId, type: type, isVersion: false }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileCountUD: async (pId, collection) => {
        try {
            var end = new Date();
            end = new Date(end.setHours(0, 0, 0, 0));
            end = new Date(end.setDate(end.getDate() - 7));
            let doc = await collection.find().filter({ postedby: pId, isVersion: false, date: { $gte: end } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimitUD: async (pId, collection) => {
        try {
            let files = [];
            var end = new Date();
            end = new Date(end.setHours(0, 0, 0, 0));
            end = new Date(end.setDate(end.getDate() - 7));
            let doc = await collection.find().filter({ postedby: pId, isVersion: false, date: { $gte: end } }).getDocuments();
            if (doc) {
                doc.map(document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    tempDoc.renderType = "User File";
                    files.push(tempDoc);
                });
            }
            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileLimitU: async (offsetN, pId, type, collection, collectionUser, collectionCat) => {
        try {
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ $query: { postedby: pId, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { postedby: pId, type: type, isVersion: false }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) {
                let userDoc = await collectionUser.find().fetchArraySize(0).key(pId).getOne();
                let tempUser;

                if (userDoc) {
                    tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                } else tempUser = pId;

                await Promise.all(doc.map(async document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    tempDoc.postedby = tempUser;

                    let tempCat = '';
                    if (tempDoc.category) {
                        let catDoc = await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne();
                        if (catDoc) {
                            tempCat = catDoc.getContent();
                            tempCat._id = catDoc.key;
                        }
                    }
                    tempDoc.category = tempCat;
                    files.push(tempDoc);
                }));
            }

            return files;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryCountU: async (pId, string, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ postedby: pId, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else doc = await collection.find().filter({ postedby: pId, type: type, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllFileQueryLimitU: async (offsetN, pId, string, type, collection, collectionUser, collectionCat) => {
        try {
            let skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;
            let doc, files = [];
            if (type === 'All') doc = await collection.find().filter({ $query: { postedby: pId, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { postedby: pId, type: type, isVersion: false, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            if (doc) {
                let userDoc = await collectionUser.find().fetchArraySize(0).key(pId).getOne();
                let tempUser;
                if (userDoc) {
                    tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                } else tempUser = pId;

                await Promise.all(doc.map(async document => {
                    let tempDoc = document.getContent();
                    tempDoc._id = document.key;
                    tempDoc.postedby = tempUser;

                    let tempCat = '';
                    if (tempDoc.category) {
                        let catDoc = await collectionCat.find().fetchArraySize(0).key(tempDoc.category).getOne();
                        if (catDoc) {
                            tempCat = catDoc.getContent();
                            tempCat._id = catDoc.key;
                        }
                    }
                    tempDoc.category = tempCat;
                    files.push(tempDoc);
                }));
            }
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