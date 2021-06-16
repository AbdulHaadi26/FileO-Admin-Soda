module.exports = {

    createDesc: async (data, collection) => {
        try {
            let doc = await collection.insertOneAndGet(data);
            if (doc && doc.key) return doc.key;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    removeDesc: async (id, collection) => {
        try {
            await collection.find().fetchArraySize(0).key(id).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getDescById: async (id, collection) => {
        try {
            let text = '';
            let doc = await collection.find().fetchArraySize(0).key(id).getOne();
            if (doc) {
                text = doc.getContent().text;
            }
            return text;
        } catch (e) {

        }
    },

    removeDescUser: async (id, collection) => {
        try {
            await collection.find().filter({ postedby: id }).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateDescription: async (id, text, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(id).getOne();
            if (!docToReplace) return false;
            let note = docToReplace.getContent();
            note.text = text;
            await collection.find().fetchArraySize(0).key(id).replaceOne(note);
            return note;
        } catch (e) {
            
        }
    }

}