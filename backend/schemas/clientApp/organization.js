module.exports = {
    findOrgById: async (_id, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(_id).getOne();
            if (!doc) throw new Error('Organization not found.');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updatePackageDetails: async (key, u_d, avb, p_l, p_u, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) return false;
            let document = doc.getContent();
            document.data_uploaded = Number(u_d);
            document.available = Number(avb);
            document.percent_left = Number(p_l);
            document.percent_used = Number(p_u);
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    }
};