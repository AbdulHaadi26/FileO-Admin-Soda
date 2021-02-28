const { getPresignedUrl, deleteObject } = require('../middlewares/oci-sdk');

module.exports = {
    isExist: async (title, _id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ title: title, org: _id }).getOne();
            if (doc) return true;
            else return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findTicketById: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Ticket not found');
            let ticket = doc.getContent();
            ticket._id = doc.key;
            await generateFileUrl(ticket);
            return ticket;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findTicketByIdDel: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Ticket not found');
            let ticket = doc.getContent();
            ticket._id = doc.key;
            return ticket;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    addAttachment: async (_id, url, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Ticket not found');
            let ticket = doc.getContent();
            ticket.url = url;
            await collection.find().fetchArraySize(0).key(doc.key).replaceOne(ticket);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    removeAttachment: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Ticket not found');
            let ticket = doc.getContent();
            ticket.url = '';
            await collection.find().fetchArraySize(0).key(doc.key).replaceOne(ticket);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateTitle: async (_id, value, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Ticket not found');
            let ticket = doc.getContent();
            ticket.title = value;
            await collection.find().fetchArraySize(0).key(doc.key).replaceOne(ticket);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateDescription: async (_id, value, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Ticket not found');
            let ticket = doc.getContent();
            ticket.description = value;
            await collection.find().fetchArraySize(0).key(doc.key).replaceOne(ticket);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllTicketCount: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ org: _id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllTicketLimit: async (limit, _id, collection) => {
        try {
            let tickets = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            let doc = await collection.find().filter({ $query: { org: _id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                tickets.push(tempDoc);
            }));
            return tickets;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllTicketQueryCount: async (string, _id, collection) => {
        try {
            let doc = await collection.find().filter({ org: _id, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getAllTicketQueryLimit: async (limit, string, _id, collection) => {
        try {
            let tickets = [];
            let skipInNumber = Number(limit);
            skipInNumber = skipInNumber * 12;
            let doc = await collection.find().filter({ $query: { org: _id, title: { $upper: { $regex: `.*${string.toUpperCase()}.*` } } }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();

            if (doc) await Promise.all(doc.map(async document => {
                let tempDoc = document.getContent();
                tempDoc._id = document.key;
                tickets.push(tempDoc);
            }));
            return tickets;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteTicket: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            let ticket = doc.getContent();
            if (ticket && ticket.url && ticket.bucketName) await deleteObject(ticket.url, ticket.bucketName);
            await collection.find().fetchArraySize(0).key(_id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteAllTicketByOrg: async (_id, collection) => {
        try {
            let doc = await collection.find().filter({ org: _id }).getDocuments();
            if (doc) await Promise.all(doc.map(async document => {
                let ticket = document.getContent();
                if (ticket && ticket.url && ticket.bucketName) await deleteObject(ticket.url, ticket.bucketName);
            }));
            await collection.find().filter({ org: _id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createTicket: async (data, collection) => {
        try {
            let doc = await collection.insertOneAndGet(data);
            if (doc && doc.key) return doc.key;
            throw new Error('Ticket not created.')
        } catch (e) {
            throw new Error(e.message);
        }
    }

};

async function generateFileUrl(file) {
    var url = '';
    if (file && file.url && file.bucketName) url = await getPresignedUrl(file._id, file.url, file.bucketName);
    if (url) file.url = url;
}
