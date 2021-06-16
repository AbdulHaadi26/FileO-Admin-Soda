const {
    getPresignedUrl
} = require('../middlewares/oci-sdk');

module.exports = {

    createTask: async (data, collection) => {
        try {
            let doc = await collection.insertOneAndGet(data);
            if(!doc) throw new Error('Task could not be created');
            return doc.key;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findNoteByName: async (name, _id, value, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ postedby: _id, title: name, isTask: { $eq: value } }).getOne();
            if (doc)
                return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateNoteN: async (key, userId, collection) => {
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
            if (!doc) throw new Error('File with this key does not exists');

            let content = doc.getContent();
            content._id = doc.key;
            let files = content.attachment, tempArr = [];
            let catList = content.catList, tempCat = [];

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

            if (!userDoc) throw new Error('User with this key does not exists');

            let tempUser = userDoc.getContent();
            tempUser._id = userDoc.key;

            content.postedby = tempUser;
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


    updateNote: async (key, title, color, fileList, recId, editable, catList, status, due, icon, collection) => {
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
            note.status = status;
            note.due = due;
            note.time_due = new Date(due);
            note.icon = icon;
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
            const doc = await collection.find().filter({ postedby: _id, updated: true, isTask: { $eq: value } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteCount: async (_id, value, type, status, due, collection) => {
        try {
            let doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            switch (type) {
                case 'Task Owner':
                    doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value } }).count();
                    break;
                case 'Updated':
                    doc = await collection.find().filter({ postedby: _id, updated: true, isTask: { $eq: value } }).count();
                    break;
                case 'Status':
                    if (status === 'All')
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value } }).count();
                    else
                        doc = await collection.find().filter({ postedby: _id, status, isTask: { $eq: value } }).count();
                    break;
                case 'Due Date':
                    if (due === 'Due') {
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $gt: date } }).count();
                    } else if (due === 'Due Today') {
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: date }).count();
                    } else if (due === 'Due This Week') {
                        let dateR = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: date } }).count();
                    } else if (due === 'Due Next Week') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.addHours(24 * (14 - date.getDay()))
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }).count();
                    }
                    else if (due === 'Due This Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(0);
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: dateL } }).count();
                    }
                    else if (due === 'Due Next Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.setDate(31);
                        dateR.setDate(31);
                        dateR.setMonth(dateR.getMonth() + 0);
                        dateL.setMonth(dateL.getMonth() + 1);
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }).count();
                    } else {
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lt: date } }).count();
                    }
                    break;
                default:
                    doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value } }).count();
            }

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteLimit: async (_id, limit, value, type, status, due, collection) => {
        try {
            let doc, notes = [], date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;

            switch (type) {
                case 'Task Owner':
                    doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Updated':
                    doc = await collection.find().filter({ $query: { postedby: _id, updated: true, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Status':
                    if (status === 'All')
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    else
                        doc = await collection.find().filter({ $query: { postedby: _id, status, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Due Date':
                    if (due === 'Due') {
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $gt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due Today') {
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: date }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due This Week') {
                        let dateR = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due Next Week') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.addHours(24 * (14 - date.getDay()))
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    else if (due === 'Due This Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(0);
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: dateL } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    else if (due === 'Due Next Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.setDate(31);
                        dateR.setDate(31);
                        dateR.setMonth(dateR.getMonth() + 0);
                        dateL.setMonth(dateL.getMonth() + 1);
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else {
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    break;
                default:
                    doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            }
            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                notes.push(tempDoc);
            }));

            return notes;

        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteQueryCount: async (_id, string, value, type, status, due, collection) => {
        try {
            let doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            switch (type) {
                case 'Task Owner':
                    doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                    break;
                case 'Updated':
                    doc = await collection.find().filter({ postedby: _id, updated: true, isTask: { $eq: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
                    break;
                case 'Status':
                    if (status === 'All')
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value } }).count();
                    else
                        doc = await collection.find().filter({ postedby: _id, status, isTask: { $eq: value } }).count();
                    break;
                case 'Due Date':
                    if (due === 'Due') {
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $gt: date } }).count();
                    } else if (due === 'Due Today') {
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: date }).count();
                    } else if (due === 'Due This Week') {
                        let dateR = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: date } }).count();
                    } else if (due === 'Due Next Week') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.addHours(24 * (14 - date.getDay()))
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }).count();
                    }
                    else if (due === 'Due This Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(0);
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: dateL } }).count();
                    }
                    else if (due === 'Due Next Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.setDate(31);
                        dateR.setDate(31);
                        dateR.setMonth(dateR.getMonth() + 0);
                        dateL.setMonth(dateL.getMonth() + 1);
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }).count();
                    } else {
                        doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, time_due: { $lt: date } }).count();
                    }
                    break;
                default:
                    doc = await collection.find().filter({ postedby: _id, isTask: { $eq: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            }

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllNoteQueryLimit: async (_id, limit, string, value, type, status, due, collection) => {
        try {
            let notes = [], doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;

            switch (type) {
                case 'Task Owner':
                    doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Updated':
                    doc = await collection.find().filter({ $query: { postedby: _id, updated: true, isTask: { $eq: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Status':
                    if (status === 'All')
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    else
                        doc = await collection.find().filter({ $query: { postedby: _id, status, isTask: { $eq: value } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    break;
                case 'Due Date':
                    if (due === 'Due') {
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $gt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due Today') {
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: date }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due This Week') {
                        let dateR = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else if (due === 'Due Next Week') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.addHours(24 * (14 - date.getDay()))
                        dateR.addHours(24 * (7 - date.getDay()));
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    else if (due === 'Due This Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateR.setDate(31);
                        dateL.setDate(0);
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateR, $gte: dateL } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    else if (due === 'Due Next Month') {
                        let dateR = new Date(Date.now()), dateL = new Date(Date.now());;
                        dateR.setHours(0, 0, 0, 0);
                        dateL.setHours(0, 0, 0, 0);
                        dateL.setDate(31);
                        dateR.setDate(31);
                        dateR.setMonth(dateR.getMonth() + 0);
                        dateL.setMonth(dateL.getMonth() + 1);
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lte: dateL, $gte: dateR } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    } else {
                        doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, time_due: { $lt: date } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
                    }
                    break;
                default:
                    doc = await collection.find().filter({ $query: { postedby: _id, isTask: { $eq: value }, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            }

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

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}