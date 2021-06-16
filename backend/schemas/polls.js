module.exports = {

    createPolls: async (data, collection) => {
        try {
            let doc = await collection.insertOneAndGet(data);
            if (doc && doc.key) return doc.key;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findPollByName: async (name, org, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ name, org: org }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deletePoll: async (_id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updatePollDetails: async (_id, question, userId, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let tempDoc = doc.getContent();
                let submittedBy = tempDoc.submittedBy && tempDoc.submittedBy.length > 0 ? tempDoc.submittedBy : [];
                submittedBy.push(userId);
                tempDoc.questions = question;
                tempDoc.submittedBy = submittedBy;
                await collection.find().fetchArraySize(0).key(_id).replaceOne(tempDoc);
                return tempDoc;
            } else throw new Error('Polls was not submitted successfully.')
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updatePoll: async (_id, name, description, date, questions, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let tempDoc = doc.getContent();
                tempDoc.description = description
                tempDoc.questions = questions;
                tempDoc.name = name;
                tempDoc.end_date = date;
                tempDoc.due_date = new Date(date);
                await collection.find().fetchArraySize(0).key(_id).replaceOne(tempDoc);
                tempDoc._id = doc.key;
                return tempDoc;
            } else throw new Error('Poll was not updated.')
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getPollById: async (_id, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (doc) {
                let tempDoc = doc.getContent();
                tempDoc._id = doc.key;
                return tempDoc;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllPollLimit: async (org, auth, string, _id, collection) => {
        try {
            let polls = [], doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            let queryParams;

            if (auth === 'true')
                queryParams = {
                    org
                };
            else queryParams = {
                org,
                submittedBy: { $nin: [_id] },
                due_date: { $gte: date }
            }

            if (string) queryParams.name = { $upper: { $regex: `.*${string.toUpperCase()}.*` } }


            doc = await collection.find().filter({ $query: queryParams, $orderby: { created: -1 } }).getDocuments();

            if (doc) doc.map(document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                polls.push(tempDoc);
            });
            return polls;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllPollCount: async (org, _id, collection) => {
        try {
            let doc, date = new Date(Date.now());
            date.setHours(0, 0, 0, 0);

            let queryParams = {
                org,
                submittedBy: { $nin: [_id] },
                due_date: { $gte: date }
            }

            doc = await collection.find().filter(queryParams).count();

            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    }

}