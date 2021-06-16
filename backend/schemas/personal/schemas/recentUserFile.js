module.exports = {
    getMostRecentDateCount: async (_id, collection) => {
        try {
            var end = new Date();
            end = new Date(end.setHours(0, 0, 0, 0));
            end = new Date(end.setDate(end.getDate() - 7));
            const doc = await collection.find().filter({ userId: _id, date: { $gte: end } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getMostRecentDate: async (_id, collection, collectionFile) => {
        try {
            let end = new Date();
            end = new Date(end.setHours(0, 0, 0, 0));
            end = new Date(end.setDate(end.getDate() - 7));
            let recs = [];
            const doc = await collection.find().filter({ userId: _id, date: { $gte: end } }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let content = document.getContent();
                let fileDoc = await collectionFile.find().fetchArraySize(0).key(content.fileId).getOne();
                if (fileDoc) {
                    let tempFile = fileDoc.getContent();
                    content.renderType = "User File";
                    tempFile._id = fileDoc.key;
                    content.fileId = tempFile;
                    content._id = content.key;
                    recs.push(content);
                }
            }));
            return recs;
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

    findRecFileById: async (_id, i, collection) => {
        try {
            var start = new Date();
            start = new Date(start.setDate(start.getDate() - i))
            if (i !== 0)
                start = new Date(start.setHours(0, 0, 0, 0));
            var end = new Date();
            end = new Date(end.setHours(0, 0, 0, 0));
            end = new Date(end.setDate(end.getDate() - 1 - i));
            let doc = await collection.find().fetchArraySize(0).filter({ fileId: _id, date: { $gte: end, $lte: start } }).getOne();
            if (doc) {
                let file = doc.getContent();
                file._id = doc.key;
                return file
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteRecentFile: async (_id, collection) => {
        try {
            await collection.find().key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createRecentFile: async (data, collection) => {
        try {
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error('Could not create file view record.');
        }
    },

    deleteMultipleFilesArrRect: async (list, collection) => {
        try {
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: list } }).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let tempFile = document.getContent();
                    tempFile.isDel = true;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateMultipleFilesArrRect: async (list, collection) => {
        try {
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: list } }).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let tempFile = document.getContent();
                    tempFile.isPerm = true;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },


    deleteMultipleFilesArrRect: async (list, collection) => {
        try {
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: list } }).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let tempFile = document.getContent();
                    tempFile.isDel = true;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateMultipleFilesArrRect: async (list, collection) => {
        try {
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: list } }).getDocuments();
                if (doc) await Promise.all(doc.map(async document => {
                    let tempFile = document.getContent();
                    tempFile.isPerm = true;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateRecFileU: async (_id, pId, collection) => {
        try {
            const doc = await collection.find().filter({ userId: _id, pId: pId }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile.isPerm = true;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateRectFileP: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ versionId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile.isPerm = true;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    }
}