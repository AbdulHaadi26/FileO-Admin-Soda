const role = require("./role");

module.exports = {

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

    findRoleByName: async (name, pId, collection) => {
        try {
            let doc = await collection.find().filter({ name: name, pId: pId }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createRole: async (data, collection) => {
        try {
            let doc = await collection.insertOneAndGet(data);
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getRole: async (_id, collection, collectionCats) => {
        try {
            let document = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!document) throw new Error('Roles does not exist');
            let roleDoc = document.getContent();
            roleDoc._id = document.key;
            let categories = [];
            roleDoc.category && roleDoc.category.length > 0 && await Promise.all(roleDoc.category.map(async cat => {
                let catDoc = await collectionCats.find().fetchArraySize(0).key(cat).getOne();
                if (catDoc) {
                    let tempCat = catDoc.getContent();
                    tempCat._id = catDoc.key;
                    categories.push(tempCat);
                }
            }));
            roleDoc.category = categories;
            return roleDoc;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    deleteAllRoles: async (pId, collection) => {
        try {
            await collection.find().filter({ pId: pId }).remove();
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

    getAllRolesCount: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ pId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRolesLimit: async (_id, limit, collection) => {
        try {
            let skipInNumber = Number(limit), roles = [];
            skipInNumber = skipInNumber * 12;
            let doc = await collection.find().filter({ $query: { pId: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) doc.map(document => {
                let tempRole = document.getContent();
                tempRole._id = document.key;
                roles.push(tempRole);
            });
            return roles;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRolesQueryLimit: async (_id, limit, string, collection) => {
        try {
            let skipInNumber = Number(limit), roles = [];
            skipInNumber = skipInNumber * 12;
            let doc = await collection.find().filter({ $query: { pId: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) doc.map(document => {
                let tempRole = document.getContent();
                tempRole._id = document.key;
                roles.push(tempRole);
            });
            return roles;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllRolesQueryCount: async (_id, string, collection) => {
        try {
            let doc = await collection.find().filter({ pId: _id, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
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

    deleteRole: async (key, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(key).remove();
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

    getAllRoles: async (_id, collection) => {
        try {
            let roles = [];
            let doc = await collection.find().filter({ pId: _id }).getDocuments();
            if (doc) doc.map(async document => {
                let roleDoc = document.getContent();
                roleDoc._id = document.key;
                roles.push(roleDoc);
            });
            return roles;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}