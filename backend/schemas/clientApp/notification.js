module.exports = {
    createNotification: async (data, collection) => {
        try {
            data.date = new Date();
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error(e.message);
        }
    },
}
