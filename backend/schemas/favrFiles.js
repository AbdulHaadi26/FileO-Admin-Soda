module.exports = {

    deleteMultipleFvrFileArr: async (list, collection) => {
        try {
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ versionId: { $in: list } }).getDocuments();
                if (doc) doc.map(async document => {
                    let content = document.getContent();
                    content.isPerm = true;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(content);
                });
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isFavorite: async (fId, uId, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ fileId: fId, savedBy: uId }).getOne();
            if (doc) return true;
            else return false;
        } catch (e) {
            throw new Error('Query could not be completed');
        }
    },

    findFvrFileById: async (_id, savedBy, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ fileId: _id, savedBy: savedBy }).getOne();
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

    deleteById: async (_id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createFvrFile: async (data, collection) => {
        try {
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error('Could not create favorite file');
        }
    },

    getFileQueryCount: async (sBy, string, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ savedBy: sBy, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else doc = await collection.find().filter({ savedBy: sBy, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error('Query could not be completed');
        }
    },

    getFileQueryLimit: async (sBy, string, type, collection) => {
        let doc, files = [];
        if (type === 'All') doc = await collection.find().filter({ savedBy: sBy, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
        else doc = await collection.find().filter({ savedBy: sBy, type: type, name: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).getDocuments();
        if (doc) doc.map(document => {
            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            files.push(tempDoc);
        });
        return files;
    },

    getFileCount: async (sBy, type, collection) => {
        try {
            let doc;
            if (type === 'All') doc = await collection.find().filter({ savedBy: sBy }).count();
            else doc = await collection.find().filter({ savedBy: sBy, type: type }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error('Query could not be completed');
        }
    },

    getFileLimit: async (sBy, type, collection) => {
        let files = [];
        let doc;
        if (type === 'All') doc = await collection.find().filter({ savedBy: sBy }).getDocuments();
        else doc = await collection.find().filter({ savedBy: sBy, type: type }).getDocuments();

        if (doc) doc.map(document => {
            let tempDoc = document.getContent();
            tempDoc._id = document.key;
            files.push(tempDoc);
        });
        return files;
    },

    updateFvrFileU: async (_id, pId, collection) => {
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

    updateFvrFileP: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ fileId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile.isPerm = true;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFvrFileD: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ fileId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile.isDel = true;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateFvrName: async (_id, name, collection) => {
        try {
            const doc = await collection.find().filter({ fileId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile.name = name;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    /* updateFvrName: async (_id, name, collection) => {
         try {
             let sql = `UPDATE favr_files u SET u.json_document.name= :name WHERE u.json_document.fileId= :fileId`;
             let connection = await getConnection();
 
             let options = { fileId: _id, name: name };
             const result = await connection.execute(sql, options);
             console.log(result);
             console.log("Number of rows updated:", result.rowsAffected);
         } catch (e) {
             throw new Error(e.message);
         }
     },*/

    deleteFvrFiles: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ fileId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile.isDel = true;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteMultipleFilesArrFvr: async (list, collection) => {
        try {
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ fileId: { $in: list } }).getDocuments();
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

    updateMultipleFilesArrFvr: async (list, collection) => {
        try {
            if (list && list.length > 0) {
                const doc = await collection.find().filter({ fileId: { $in: list } }).getDocuments();
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
}