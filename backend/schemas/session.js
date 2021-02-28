module.exports = {
    updateActive: async (key, value, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ userId: key }).getOne();
            if (!doc) throw new Error('Session not found.');
            const content = doc.getContent();
            content.isActive = value;
            await collection.find().fetchArraySize(0).key(doc.key).replaceOne(content);
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteSessionByUser: async (key, collection) => {
        try {
            await collection.find().filter({ userId: key }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteSessionByUserS: async (key, screen, collection) => {
        try {
            await collection.find().filter({ userId: key, screen: screen }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createSession: async (data, collection) => {
        try {
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isSessionActive: async (key, screen, collection) => {
        try {
            let date = new Date();
            const doc = await collection.find().fetchArraySize(0).filter({ userId: key, screen: screen, last_updated: { $gte: date } }).getOne();
            if (!doc) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    },
}