const {
    getPresignedUrl
} = require('../middlewares/oci-sdk');

module.exports = {
    getAllUserNoteIds: async (_id, collection, collectionUser) => {
        try {
            var arr = [];
            const doc = await collection.find().filter({ noteId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                let tempUser = await collectionUser.find().fetchArraySize(0).key(tempDoc.sharedWith).getOne();
                if (tempUser) arr.push(tempUser.getContent().email);
            }));
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAssigned: async (_id, nId, collection) => {
        try {
            await collection.find().fetchArraySize(0).filter({ noteId: nId, sharedWith: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAssignedAll: async (nId, collection) => {
        try {
            await collection.find().fetchArraySize(0).filter({ noteId: nId }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteSharedNote: async (_id, collection) => {
        try {
            await collection.find().filter({ noteId: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    convertSharedNote: async (_id, dueDate, status, collection) => {
        try {
            let docs = await collection.find().filter({ noteId: _id }).getDocuments();
            if (docs) await Promise.all(docs.map(async doc => {
                let note = doc.getContent();
                note.isTask = true;
                note.due = dueDate.toISOString().slice(0, 10);
                note.time_due = new Date(note.due);
                note.status = status;
                note.updated = true;
                await collection.find().fetchArraySize(0).key(doc.key).replaceOne(note);
            }))
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isExist: async (_id, nId, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ noteId: nId, sharedWith: _id }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedCount: async (_id, collection) => {
        try {
            const doc = await collection.find().filter({ noteId: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedLimit: async (_id, limit, collection, collectionUser) => {
        try {
            let users = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { noteId: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.sharedWith).getOne();
                if (userDoc) {
                    let tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                    tempDoc.sharedWith = tempUser;
                    await generateProfileUrl(tempDoc);
                    users.push(tempDoc);
                }
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedAll: async (_id, collection, collectionUser) => {
        try {
            let users = [];
            const doc = await collection.find().filter({ noteId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;

                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.sharedWith).getOne();
                if (userDoc) {
                    let tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                    users.push(tempUser);
                }
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedQueryCount: async (_id, string, collection) => {
        try {
            const doc = await collection.find().filter({ noteId: _id, $or: [{ sharedWName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { sharedWEmail: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createSharedN: async (data, collection) => {
        try {
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllAssignedQueryLimit: async (_id, limit, string, collection, collectionUser) => {
        try {
            let users = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            const doc = await collection.find().filter({ $query: { noteId: _id, $or: [{ sharedWName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, { sharedWEmail: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }] }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                let userDoc = await collectionUser.find().fetchArraySize(0).key(tempDoc.sharedWith).getOne();
                if (userDoc) {
                    let tempUser = userDoc.getContent();
                    tempUser._id = userDoc.key;
                    tempDoc.sharedWith = tempUser;
                    await generateProfileUrl(tempDoc);
                    users.push(tempDoc);
                }
            }));
            return users;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteCount: async (_id, search, value, collection) => {
        try {
            let doc;
            if (search === 'updated') doc = await collection.find().filter({ sharedWith: _id, isTask: { $ne: value }, updated: true }).count();
            else doc = await collection.find().filter({ sharedWith: _id, isTask: { $ne: value } }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteLimit: async (_id, search, limit, value, collection, collectionNote, collectionUser) => {
        try {
            let notes = [], doc;
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            if (search === 'updated') doc = await collection.find().filter({ $query: { sharedWith: _id, updated: true, isTask: { $ne: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $ne: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;

                const [userDoc, noteDoc] = [
                    await collectionUser.find().fetchArraySize(0).key(tempDoc.sharedWith).getOne(),
                    await collectionNote.find().fetchArraySize(0).key(tempDoc.noteId).getOne()
                ];

                if (userDoc && noteDoc) {

                    let [tempUser, tempNote] = [
                        userDoc.getContent(),
                        noteDoc.getContent()
                    ];

                    tempUser._id = userDoc.key;
                    tempNote._id = noteDoc.key;
                    tempDoc.sharedWith = tempUser;
                    tempDoc.noteId = tempNote;
                    notes.push(tempDoc);
                }
            }));
            return notes;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteQueryCount: async (_id, string, search, value, collection) => {
        try {
            let doc;
            if (search === 'note') doc = await collection.find().filter({ sharedWith: _id, isTask: { $ne: value }, noteTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else if (search === 'updated') doc = await collection.find().filter({ sharedWith: _id, updated: true, isTask: { $ne: value }, noteTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            else doc = await collection.find().filter({ sharedWith: _id, isTask: { $ne: value }, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteQueryLimit: async (_id, limit, string, search, value, collection, collectionNote, collectionUser) => {
        try {
            let notes = [], doc;
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;

            if (search === 'note') doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $ne: value }, noteTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else if (search === 'updated') doc = await collection.find().filter({ $query: { sharedWith: _id, updated: true, isTask: { $ne: value }, noteTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            else doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $ne: value }, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;

                const [userDoc, noteDoc] = [
                    await collectionUser.find().fetchArraySize(0).key(tempDoc.sharedWith).getOne(),
                    await collectionNote.find().fetchArraySize(0).key(tempDoc.noteId).getOne()
                ];

                if (userDoc && noteDoc) {

                    let [tempUser, tempNote] = [
                        userDoc.getContent(),
                        noteDoc.getContent()
                    ];

                    tempUser._id = userDoc.key;
                    tempNote._id = noteDoc.key;
                    tempDoc.sharedWith = tempUser;
                    tempDoc.noteId = tempNote;
                    notes.push(tempDoc);
                }
            }));
            return notes;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteByUser: async (_id, collection) => {
        try {
            await collection.find().filter({ postedby: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateNoteByUserName: async (_id, name, collection) => {
        try {
            let doc = await collection.find().filter({ sharedBy: _id }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let note = document.getContent();
                    note.sharedByName = name;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(note);
                }))
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateNoteUptS: async (_id, value, collection) => {
        try {
            let doc = await collection.find().filter({ noteId: _id }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let note = document.getContent();
                    note.updated = value;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(note);
                }))
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateNoteUptSU: async (_id, noteId, value, collection) => {
        try {
            let doc = await collection.find().filter({ sharedWith: _id, noteId: noteId }).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let note = document.getContent();
                    note.updated = value;
                    await collection.find().fetchArraySize(0).key(document.key).replaceOne(note);
                }))
            }
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllUptNoteCountS: async (_id, value, collection) => {
        try {
            const doc = await collection.find().filter({ sharedWith: _id, updated: true, isTask: { $ne: value } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateNoteWithUserName: async (_id, name, collection) => {
        try {
            let doc = await collection.find().filter({ sharedWith: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let note = document.getContent();
                note.sharedWName = name;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(note);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateSharedNoteName: async (_id, name, collection) => {
        try {
            const doc = await collection.find().filter({ noteId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile.noteTitle = name;
                await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempFile);
            }));
        } catch (e) {
            throw new Error(e.message);
        }
    },

}

async function generateProfileUrl(shared) {
    var url = '';
    if (shared.sharedWith && shared.sharedWith.bucketName && shared.sharedWith.image) url = await getPresignedUrl(shared.sharedWith._id, shared.sharedWith.image, shared.sharedWith.bucketName);
    if (url) shared.sharedWith.image = url;
}
