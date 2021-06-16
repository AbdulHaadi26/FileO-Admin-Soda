
module.exports = {
    isExistC: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ category: _id }).getOne();
            if (!doc) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isExpiredC: async (_id, collection) => {
        try {
            let cdate = new Date();
            let doc = await collection.find().fetchArraySize(0).filter({ category: _id, expired: { $gte: cdate } }).getOne();
            if (!doc) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    }
};

