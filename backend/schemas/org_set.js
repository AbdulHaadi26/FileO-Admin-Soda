module.exports = {
    createOrgSetting: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('Organization settings could not be created.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateValue: async (key, field, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            var packages = document.packages ? document.packages : [];

            switch (field) {
                case 'updatePackage':
                    if (packages && packages.length > 0) { if (!packages.includes(Number(value))) packages.push(value); }
                    else packages.push(value);
                    break;
                case 'removePackage':
                    if (packages && packages.length > 0) packages = packages.filter(i => Number(i) !== Number(value));
                    break;
            }

            document.packages = packages;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },
}