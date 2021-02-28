const {
    getPresignedUrl
} = require('../middlewares/oci-sdk');

module.exports = {

    deleteFileUser: async (_id, collection) => {
        try {
            await collection.find().filter({ userId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isExist: async (_id, org, pId, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ userId: _id, org: org, projId: pId }).getOne();
            let tempDoc;
            if (doc) {
                tempDoc = doc.getContent();
                tempDoc._id = doc.key;
            }
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getUserByRoles: async (org, list, collection) => {
        try {
            let arr = [];
            if (list && list.length > 0) {
                let doc = await collection.find().filter({ org: org, userRoles: { $in: list } }).getDocuments();
                if (doc) doc.map(document => arr.push(document.getContent().userId));
            }
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getUserByRole: async (org, role, collection) => {
        try {
            let arr = [];
            let doc = await collection.find().filter({ org: org, userRoles: { $in: [role] } }).getDocuments();
            if (doc) doc.map(document => arr.push(document.getContent().userId));
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    deleteAllByPId: async (pId, collection) => {
        try {
            await collection.find().filter({ pId: pId }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllIds: async (_id, collection, collectionUser) => {
        try {
            let emails = [];
            let doc = await collection.find().filter({ projId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
                let tempUser = userDoc.getContent();
                emails.push(tempUser.email);
            }));
            return emails;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteRoleMany: async (_id, collection) => {
        try {
            let docToReplace = await collection.find().filter({ userRoles: { $in: [_id] } }).getDocuments();
            if (docToReplace) await Promise.all(docToReplace.map(async doc => {
                let document = doc.getContent();
                document.userRoles = document.userRoles.filter(i => i !== _id);
                await collection.find().fetchArraySize(0).key(doc.key).replaceOne(document);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAssignedUserById: async (_id, pId, collection, collectionUser, collectionRoles, collectionCats) => {
        try {
            let document = await collection.find().fetchArraySize(0).filter({ userId: _id, projId: pId }).getOne();
            if (!document) throw new Error('Assigned item not found');
            let tempDoc = document.getContent();
            let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
            if (!userDoc) throw new Error('User not found');
            let tempUser = userDoc.getContent();
            tempUser._id = userDoc.key;
            let roles = [];

            tempDoc.userRoles && tempDoc.userRoles.length > 0 && await Promise.all(tempDoc.userRoles.map(async role => {
                let roleDoc = await collectionRoles.find().fetchArraySize(0).key(role).getOne();
                if (roleDoc) {
                    let tempRole = roleDoc.getContent();

                    let categories = [];
                    tempRole.category && tempRole.category.length > 0 && await Promise.all(tempRole.category.map(async cat => {
                        let catDoc = await collectionCats.find().fetchArraySize(0).key(cat).getOne();
                        if (catDoc) {
                            let tempCat = catDoc.getContent();
                            tempCat._id = catDoc.key;
                            categories.push(tempCat);
                        }
                    }));

                    tempRole.category = categories;
                    tempRole._id = roleDoc.key;
                    roles.push(tempRole);
                }
            }));

            tempDoc.userRoles = roles;
            tempDoc.userId = tempUser;

            await generateProfileUrl(tempDoc);

            tempDoc._id = document.key;
            return tempDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAssignedProjects: async (_id, collection) => {
        try {
            let pIds = [];
            let document = await collection.find().filter({ userId: _id }).getDocuments();
            if (document) {
                await Promise.all(document.map(async doc => {
                    let tempDoc = doc.getContent();
                    tempDoc.projId && pIds.push(tempDoc.projId);
                }));
            }
            return pIds;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAssignedUserCats: async (_id, collection, collectionRoles) => {
        try {
            let cats = [];
            let document = await collection.find().filter({ userId: _id }).getDocuments();
            if (document) {
                await Promise.all(document.map(async doc => {
                    let tempDoc = doc.getContent();
                    tempDoc.userRoles && tempDoc.userRoles.length > 0 && await Promise.all(tempDoc.userRoles.map(async role => {
                        let roleDoc = await collectionRoles.find().fetchArraySize(0).key(role).getOne();
                        if (roleDoc) {
                            let tempRole = roleDoc.getContent();
                            tempRole.category && tempRole.category.length > 0 && tempRole.category.map(async cat => {
                                cats.push(cat);
                            });
                        }
                    }));
                }));
            }
            return cats;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAssignedUserCatsP: async (_id, collection, collectionRoles, collectionCat, collectionProj) => {
        try {
            let cats = [];
            let document = await collection.find().filter({ userId: _id }).getDocuments();
            if (document) {
                await Promise.all(document.map(async doc => {
                    let tempDoc = doc.getContent();
                    tempDoc.userRoles && tempDoc.userRoles.length > 0 && await Promise.all(tempDoc.userRoles.map(async role => {
                        let roleDoc = await collectionRoles.find().fetchArraySize(0).key(role).getOne();
                        if (roleDoc) {
                            let tempRole = roleDoc.getContent();
                            tempRole.category && tempRole.category.length > 0 && await Promise.all(tempRole.category.map(async cat => {
                                let catDoc = await collectionCat.find().fetchArraySize(0).key(cat).getOne();
                                if (catDoc) {
                                    let cat = catDoc.getContent();
                                    cat._id = catDoc.key;
                                    let tempProj = await collectionProj.find().fetchArraySize(0).key(cat.pId).getOne();
                                    if (tempProj) {
                                        let project = tempProj.getContent();
                                        project._id = tempProj.key;
                                        cat.pId = project;
                                        cats.push(cat);
                                    }
                                }
                            }));
                        }
                    }));
                }));
            }
            return cats;
        } catch (e) {
            console.log(e)
            throw new Error(e);
        }
    },


    getAllProjectCountP: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ userId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createProjAssigned: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('User could not be assigned.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectLimitP: async (offsetN, _id, collection, collectionProj) => {
        try {
            let skipInNumber = Number(offsetN);
            let projs = [];
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { userId: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let projDoc = await collectionProj.find().fetchArraySize(0).key(tempDoc.projId).getOne();
                if (projDoc) {
                    let tempProj = projDoc.getContent();
                    tempProj._id = projDoc.key;
                    tempDoc.projId = tempProj;
                    projs.push(tempDoc);
                }
            }));
            return projs;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getCountByPId: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ projId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectQueryCountP: async (string, _id, collection) => {
        try {
            let doc = await collection.find().filter({ userId: _id, projName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectQueryLimitP: async (offsetN, string, _id, collection, collectionProj) => {
        try {
            let skipInNumber = Number(offsetN);
            let projs = [];
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { userId: _id, projName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let projDoc = await collectionProj.find().fetchArraySize(0).key(tempDoc.projId).getOne();
                if (projDoc) {
                    let tempProj = projDoc.getContent();
                    tempProj._id = projDoc.key;
                    tempDoc.projId = tempProj;
                    projs.push(tempDoc);
                }
            }));
            return projs;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateAssignedUser: async (_id, pId, list, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ userId: _id, projId: pId }).getOne();
            if (!doc) return false;
            let document = doc.getContent();
            document.userRoles = list;
            await collection.find().fetchArraySize(0).key(doc.key).replaceOne(document);
            document._id = doc.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserQueryCountP: async (string, _id, collection) => {
        try {
            let doc = await collection.find().filter({ projId: _id, userName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserQueryLimitP: async (offsetN, string, _id, collection, collectionUser) => {
        try {
            let skipInNumber = Number(offsetN);
            let assigned = [];
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { projId: _id, userName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
                if (userDoc) {
                    let userProj = userDoc.getContent();
                    userProj._id = userDoc.key;
                    tempDoc.userId = userProj;
                    await generateProfileUrl(tempDoc);
                    assigned.push(tempDoc);
                }
            }));
            return assigned;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserCountP: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ projId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUserLimitP: async (offsetN, _id, collection, collectionUser) => {
        try {
            let skipInNumber = Number(offsetN);
            let assigned = [];
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { projId: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.userId).getOne();
                if (userDoc) {
                    let userProj = userDoc.getContent();
                    userProj._id = userDoc.key;
                    tempDoc.userId = userProj;
                    await generateProfileUrl(tempDoc);
                    assigned.push(tempDoc);
                }
            }));
            return assigned;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}

async function generateProfileUrl(assigned) {
    var url = '';
    if (assigned.userId && assigned.userId.image && assigned.userId.bucketName) url = await getPresignedUrl(assigned.userId._id, assigned.userId.image, assigned.userId.bucketName);
    if (url) assigned.userId.image = url;
}