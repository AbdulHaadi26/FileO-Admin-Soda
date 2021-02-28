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

    getAllAssignedQueryCount: async (_id, string, collection) => {
        try {
            const doc = await collection.find().filter({ noteId: _id, sharedWName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
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
            const doc = await collection.find().filter({ $query: { noteId: _id, sharedWName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
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

    getAllNoteCount: async (_id, value, type, status, due, collection) => {
        try {
            let doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            switch (type) {
                case 'Updated':
                    doc = await collection.find().filter({ sharedWith: _id, updated: true, isTask: { $eq: value } }).count();
                    break;
                case 'Task Owner':
                    doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value } }).count();
                    break;
                case 'Status':
                    if (status === 'All')
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value } }).count();
                    else
                        doc = await collection.find().filter({ sharedWith: _id, status, isTask: { $eq: value } }).count();
                    break;
                case 'Due Date':
                    if (due === 'Due') {
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $gt: date } }).count();
                    } else if (due === 'Due Today') {
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: date }).count();
                    } else if (due === 'Due This Week') {
                        let dateR = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: date } }).count();
                    } else if (due === 'Due Next Week') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.addHours(24 * (14 - date.getDay()))
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }).count();
                    }
                    else if (due === 'Due This Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(0);
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: dateL } }).count();
                    }
                    else if (due === 'Due Next Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.setDate(31);
                        dateR.setDate(31);
                        dateR.setMonth(date.getMonth() + 0);
                        dateL.setMonth(date.getMonth() + 1);
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }).count();
                    } else {
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lt: date } }).count();
                    }
                    break;
                default:
                    doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value } }).count();
            }
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteLimit: async (_id, limit, value, type, status, due, collection, collectionNote, collectionUser) => {
        try {
            let notes = [], doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;

            switch (type) {
                case 'Updated':
                    doc = await collection.find().filter({ $query: { sharedWith: _id, updated: true, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Task Owner':
                    doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Status':
                    if (status === 'All')
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    else
                        doc = await collection.find().filter({ $query: { sharedWith: _id, status, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Due Date':
                    if (due === 'Due') {
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $gt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due Today') {
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: date }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due This Week') {
                        let dateR = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due Next Week') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.addHours(24 * (14 - date.getDay()))
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    else if (due === 'Due This Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(0);
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: dateL } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    else if (due === 'Due Next Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(31);
                        dateR.setMonth(date.getMonth() + 0);
                        dateL.setMonth(date.getMonth() + 1);
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else {
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    break;
                default:
                    doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            }

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

    getAllNoteQueryCount: async (_id, string,  value, type, status, due, collection) => {
        try {
            let doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            switch (type) {
                case 'Updated':
                    doc = await collection.find().filter({ sharedWith: _id, updated: true, isTask: { $eq: value }, noteTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                    break;
                case 'Task Owner':
                    doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                    break;
                case 'Status':
                    if (status === 'All')
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value } }).count();
                    else
                        doc = await collection.find().filter({ sharedWith: _id, status, isTask: { $eq: value } }).count();
                    break;
                case 'Due Date':
                    if (due === 'Due') {
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $gt: date } }).count();
                    } else if (due === 'Due Today') {
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: date }).count();
                    } else if (due === 'Due This Week') {
                        let dateR = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: date } }).count();
                    } else if (due === 'Due Next Week') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.addHours(24 * (14 - date.getDay()))
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }).count();
                    }
                    else if (due === 'Due This Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(0);
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: dateL } }).count();
                    }
                    else if (due === 'Due Next Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.setDate(31);
                        dateR.setDate(31);
                        dateR.setMonth(date.getMonth() + 0);
                        dateL.setMonth(date.getMonth() + 1);
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }).count();
                    } else {
                        doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, time_due: { $lt: date } }).count();
                    }
                    break;
                default:
                    doc = await collection.find().filter({ sharedWith: _id, isTask: { $eq: value }, noteTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            }

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteQueryLimit: async (_id, limit, string, value, type, status, due, collection, collectionNote, collectionUser) => {
        try {
            let notes = [], doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;

            switch (type) {
                case 'Updated':
                    doc = await collection.find().filter({ $query: { sharedWith: _id, updated: true, isTask: { $eq: value }, noteTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Task Owner':
                    doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, sharedByName: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Status':
                    if (status === 'All')
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    else
                        doc = await collection.find().filter({ $query: { sharedWith: _id, status, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Due Date':
                    if (due === 'Due') {
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $gt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due Today') {
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: date }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due This Week') {
                        let dateR = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due Next Week') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.addHours(24 * (14 - date.getDay()))
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    else if (due === 'Due This Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(0);
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: dateL } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    else if (due === 'Due Next Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(31);
                        dateR.setMonth(date.getMonth() + 0);
                        dateL.setMonth(date.getMonth() + 1);
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else {
                        doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, time_due: { $lt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    break;
                default:
                    doc = await collection.find().filter({ $query: { sharedWith: _id, isTask: { $eq: value }, noteTitle: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            }

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

    updateSharedNoteName: async (_id, name, due, status, collection) => {
        try {
            const doc = await collection.find().filter({ noteId: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let tempFile = document.getContent();
                tempFile.noteTitle = name;
                tempFile.due = due;
                tempFile.time_due = new Date(due);
                tempFile.status = status;
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
