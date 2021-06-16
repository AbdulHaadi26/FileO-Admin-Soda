
module.exports = {
    isExist: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).filter({ fileId: _id }).getOne();
            if (!doc) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    isExpired: async (_id, collection) => {
        try {
            let cdate = new Date();
            let doc = await collection.find().fetchArraySize(0).filter({ fileId: _id, expired: { $gte: cdate } }).getOne();
            if (!doc) return false;
            return true;
        } catch (e) {
            throw new Error(e.message);
        }
    }
};

