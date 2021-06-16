module.exports = {
    createFileView: async (data, collection) => {
        try {
            await collection.insertOneAndGet(data);
        } catch (e) {
            throw new Error('Could not create file view record.');
        }
    }
}