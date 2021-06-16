module.exports = {
    isExist: async (_id, cat, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ postedFor: _id, category: cat }).getOne();
            if (!doc) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isExpired: async (_id, cat, collection) => {
        try {
            let cdate = new Date();
            let doc = await collection.find().fetchArraySize(0).filter({ postedFor: _id, category: cat, expired: { $gte: cdate } }).getOne();
            if (!doc) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateValid: async (_id, cat, collection) => {
        try {
            await collection.find().fetchArraySize(0).filter({ postedFor: _id, category: cat }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    }
};
