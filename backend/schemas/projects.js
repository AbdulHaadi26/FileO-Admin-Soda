module.exports = {

    createProject: async (projData, collection) => {
        try {
            await collection.insertOneAndGet(projData);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findProjectByName: async (name, org, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ name: name, org: org }).getOne();
            if (doc) throw new Error('Project already exists');
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getProjectById: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Project does not exists');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateValue: async (_id, field, value, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Project does not exists');
            let content = doc.getContent();
            switch (field) {
                case 'name': content.name = value;
                    break;
                case 'desc': content.description = value;
                    break;
                case 'active': content.active = value;
                    break;
            }
            await collection.find().fetchArraySize(0).key(doc.key).replaceOne(content);
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateDetails: async (_id, name, desc, active, icon, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Project does not exists');
            let content = doc.getContent();
            content.name = name;
            content.description = desc;
            content.active = active;
            content.icon = Number(icon);
            await collection.find().fetchArraySize(0).key(doc.key).replaceOne(content);
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectsOfUser: async (key, collection) => {
        try {
            let doc = await collection.find().filter({ managerId: key }).getDocuments();
            let arr = [];
            doc && doc.map(document => arr.push(document.key));
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAllUserProjects: async (_id, collection) => {
        try {
            await collection.find().filter({ managerId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectCountM: async (mId, collection) => {
        try {
            const doc = await collection.find().filter({ managerId: mId }).count();
            if (doc) return doc.count;
            else return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isProjectManager: async (_id, mId, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc && doc.managerId === mId) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectDash: async (mId, collection) => {
        let projs = [];
        const doc = await collection.find().filter({ $query: { managerId: mId }, $orderby: { created: -1 } }).limit(5).getDocuments();
        if (doc) doc.map(document => {
            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            projs.push(tempDoc);
        });
        return projs;
    },

    getAllProjectLimitM: async (mId, offsetN, collection) => {
        try {
            let skipInNumber = Number(offsetN), projs = [];
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { managerId: mId }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                projs.push(tempDoc);
            });
            return projs;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectQueryCountM: async (mId, string, collection) => {
        try {
            const doc = await collection.find().filter({ managerId: mId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            else return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteProject: async (_id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllProjectQueryLimitM: async (mId, string, offsetN, collection) => {
        try {
            let skipInNumber = Number(offsetN), projs = [];
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { managerId: mId, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                projs.push(tempDoc);
            });
            return projs;
        } catch (e) {
            throw new Error(e.message);
        }
    }

}