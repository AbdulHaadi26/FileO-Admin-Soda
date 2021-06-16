const {
    getPresignedUrl
} = require('../middlewares/oci-sdk');

module.exports = {

    createNote: async (data, collection) => {
        try {
            let doc = await collection.insertOneAndGet(data);
            if (!doc) throw new Error('Note could not be created');
            return doc.key;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findNoteByName: async (name, _id, value, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ postedby: _id, title: name, isTask: { $ne: value } }).getOne();
            if (!doc) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findNoteByNameEQ: async (name, _id, value, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ postedby: _id, title: name, isTask: { $eq: value } }).getOne();
            if (!doc) return false;
            return true;
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

    findNoteById: async (_id, collection) => {
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

    findNoteByIdF: async (_id, collection, collectionFile, collectionCats, collectionUser) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Note with this key does not exists');

            let content = doc.getContent();
            content._id = doc.key;
            var files = content.attachment, tempArr = [];
            var catList = content.catList, tempCat = [];

            if (files && files.length > 0) await Promise.all(files.map(async document => {
                if (document._id) {
                    let tempDoc = await collectionFile.find().fetchArraySize(0).key(document._id).getOne();
                    if (tempDoc) {
                        let tempFile = tempDoc.getContent();
                        tempFile._id = tempDoc.key;
                        let tempUser = await collectionUser.find().fetchArraySize(0).key(tempFile.postedby).getOne();
                        if (tempUser) {
                            let user = tempUser.getContent();
                            user._id = tempUser.key;
                            tempFile.postedby = user;
                            tempFile.date = document.date;
                            await generateFileUrl(tempFile);
                            tempArr.push(tempFile);
                        }
                    }
                }
            }));

            if (catList && catList.length > 0) await Promise.all(catList.map(async document => {
                if (document._id) {
                    let tempDoc = await collectionCats.find().fetchArraySize(0).key(document._id).getOne();
                    if (tempDoc) {
                        let tempFile = tempDoc.getContent();
                        tempFile._id = tempDoc.key;
                        let tempUser = await collectionUser.find().fetchArraySize(0).key(tempFile.uId).getOne();
                        if (tempUser) {
                            let user = tempUser.getContent();
                            user._id = tempUser.key;
                            tempFile.uId = user;
                            tempFile.date = document.date;
                            tempCat.push(tempFile);
                        }
                    }
                }
            }));

            if (tempArr) content.attachment = tempArr;
            if (tempCat) content.catList = tempCat;

            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findNoteByIdP: async (_id, collection, collectionUser) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('File with this key does not exists');
            let content = doc.getContent();

            content._id = doc.key;
            let userDoc = await collectionUser.find().fetchArraySize(0).key(content.postedby).getOne();

            if (userDoc) {
                let tempUser = userDoc.getContent();
                tempUser._id = userDoc.key;
                content.postedby = tempUser;
            }

            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteNote: async (_id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateNote: async (key, title, color, fileList, recId, editable, catList, icon, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            var note = docToReplace.getContent();
            note.title = title;
            note.color = color;
            note.attachment = fileList;
            note.recId = recId;
            note.editable = editable;
            note.catList = catList;
            note.icon = icon;
            await collection.find().fetchArraySize(0).key(key).replaceOne(note);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateNoteT: async (key, userId, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            var note = docToReplace.getContent();
            note.postedby = userId;
            await collection.find().fetchArraySize(0).key(key).replaceOne(note);
            return note;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    convertNote: async (key, isTask, dueDate, status, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            var note = docToReplace.getContent();
            note.isTask = isTask;
            note.due = dueDate.toISOString().slice(0, 10);
            note.time_due = new Date(note.due);
            note.status = status;
            await collection.find().fetchArraySize(0).key(key).replaceOne(note);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateNoteUpt: async (key, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            var note = docToReplace.getContent();
            note.updated = value;
            await collection.find().fetchArraySize(0).key(key).replaceOne(note);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    unAttachRecording: async (recId, collection) => {
        try {
            let docToReplace = await collection.find().filter({ recId: recId }).getDocuments();
            if (docToReplace) {
                await Promise.all(docToReplace.map(async doc => {
                    var note = doc.getContent();
                    note.recId = '';
                    await collection.find().fetchArraySize(0).key(doc.key).replaceOne(note);
                }));
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUptNoteCount: async (_id, value, collection) => {
        try {
            const doc = await collection.find().filter({ postedby: _id, updated: true, isTask: { $ne: value } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteCount: async (_id, search, value, collection) => {
        try {
            let doc
            if (search === 'Updated') doc = await collection.find().filter({ postedby: _id, updated: true, isTask: { $ne: value } }).count();
            else doc = await collection.find().filter({ postedby: _id, isTask: { $ne: value } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteLimit: async (_id, search, limit, value, collection) => {
        try {
            let notes = [], doc;
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            if (search === 'Updated') doc = await collection.find().filter({ $query: { postedby: _id, updated: true, isTask: { $ne: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $ne: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                notes.push(tempDoc);
            });
            return notes;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteQueryCount: async (_id, search, string, value, collection) => {
        try {
            let doc;
            if (search === 'Updated') doc = await collection.find().filter({ postedby: _id, updated: true, isTask: { $ne: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else doc = await collection.find().filter({ postedby: _id, isTask: { $ne: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteQueryLimit: async (_id, search, limit, string, value, collection) => {
        try {
            let notes = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            let doc
            if (search === 'Updated') doc = await collection.find().filter({ $query: { postedby: _id, updated: true, isTask: { $ne: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $ne: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                notes.push(tempDoc);
            });
            return notes;
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


