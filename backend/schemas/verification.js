module.exports = {

    TextExists: async (_id, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ userId: _id }).getOne();
            if (doc) return true;
            else return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    UpdateText: async (_id, text, collection) => {
        try {
            const ver = await collection.find().fetchArraySize(0).filter({ userId: _id }).getOne();
            if (!ver) return false;
            let data = ver.getContent();
            data.text = text;
            await collection.find().fetchArraySize(0).key(ver.key).replaceOne(data);
        } catch (e) {
            throw new Error(e.message);
        }
    },

    CompareText: async (_id, text, collection) => {
        try {
            let end = new Date();
            const doc = await collection.find().fetchArraySize(0).filter({ userId: _id, text: text, expiry: { $gte: end } }).getOne();
            if (!doc) return false;
            else return true;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    InsertText: async (data, collection) => {
        try {
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error(e.message);
        }
    }
}
