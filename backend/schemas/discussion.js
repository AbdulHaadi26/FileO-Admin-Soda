module.exports = {

    createDiscussion: async (data, collection) => {
        try {
            let doc = await collection.insertOneAndGet(data);
            if (doc && doc.key) return doc.key;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getDiscussion: async (id, offsetN, collection, collectionUser) => {
        try {
            let messages = [], skipInNumber = Number(offsetN);
            skipInNumber = skipInNumber * 12;;
            let doc = await collection.find().filter({ $query: { id: id }, $orderby: { created: -1 } }).skip(skipInNumber).limit(12).getDocuments();
            if (doc) {
                await Promise.all(doc.map(async document => {
                    let msg = document.getContent();
                    msg._id = document.key;
                    if (msg.postedby) {
                        let tempUser = await collectionUser.find().fetchArraySize(0).key(msg.postedby).getOne();
                        if (tempUser) {
                            let user = tempUser.getContent();
                            msg.postedby = user.name;
                            msg.userId = tempUser.key;
                            messages.push(msg);
                        }
                    }
                }));
            }
            return messages;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    discussionCount: async (id, collection) => {
        try {
            let doc = await collection.find().filter({ id: id }).count();
            if (doc) return doc.count;
            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    deleteDiscussions: async (id, collection) => {
        try {
            await collection.find().filter({ id: id }).remove();
        } catch (e) {
            throw new Error(e.message);
        } 
    }

}