module.exports = {

    createRole: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('Role could not be created.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findRoleByName: async (name, org, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ org: org, name: name }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getRole: async (key, collection, collectionCat) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('Role not found');
            let content = doc.getContent();
            let category = [];
            content.category && content.category.length > 0 && await Promise.all(content.category.map(async catId => {
                let tempCat = await collectionCat.find().fetchArraySize(0).key(catId).getOne();
                if (tempCat) {
                    let cat = tempCat.getContent();
                    cat._id = tempCat.key;
                    category.push(cat);
                }
            }));
            content.category = category;
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRolesCount: async (org, collection) => {
        try {
            const doc = await collection.find().filter({ org: org }).count();
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRoleLimit: async (org, limit, collection) => {
        try {
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { org: org }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            let roles = [];
            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                roles.push(content);
            });
            return roles;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRoleLimitQuery: async (org, limit, string, collection) => {
        try {
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { org: org, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            let roles = [];
            if (doc) doc.map(i => {
                let content = i.getContent();
                content._id = i.key;
                roles.push(content);
            });
            return roles;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRoleCountQuery: async (org, string, collection) => {
        try {
            const doc = await collection.find().filter({ org: org, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (!doc) return 0;
            return doc.count;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRoleLimitDashA: async (org, collection) => {
        try {
            const doc = await collection.find().filter({ $query: { org: org }, $orderby: { created: -1 } }).limit(5).getDocuments();;
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

    deleteCatMany: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ category: { $in: [_id] } }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                if (tempDoc.category && tempDoc.length > 0) tempDoc.category = tempDoc.category.filter(i => i !== _id);
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateCategories: async (key, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.category = value;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateValues: async (key, field, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            switch (field) {
                case 'name': document.name = value; break;
                case 'description': document.description = value; break;
            }
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteRole: async (key, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(key).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getCRole: async (org, _id, collection) => {
        try {
            let arr = [];
            let doc = await collection.find().filter({ org: org, category: { $in: [_id] } }).getDocuments();
            if (doc) doc.map(document => arr.push(document.key));
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRoles: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ org: _id }).getDocuments();
            let roles = [];
            if (doc) await Promise.all(doc.map(document => {
                let docToPush = document.getContent();
                docToPush._id = document.key;
                roles.push(docToPush);
            }));
            return roles;
        } catch (e) {
            throw new Error(e.message);
        }
    }

}

