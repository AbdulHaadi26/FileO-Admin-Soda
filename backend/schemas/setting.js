module.exports = {
    getSetting: async (collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key('4BD86987B0E14F84BFCC8CCA79AC5C4F').getOne();
            if (!doc) throw new Error('Settings not found.');
            const content = doc.getContent();
            content._id = doc.key;
            return content
        } catch (e) {
            throw new Error(e.message);
        }
    },
}