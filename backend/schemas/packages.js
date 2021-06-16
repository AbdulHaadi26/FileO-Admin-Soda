const oracledb = require('oracledb');

module.exports = {
    findPackageById: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('Package details not found.');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    findActivePackages: async (size, collection) => {
        try {
            let pkgSize = Math.floor(Number(size));
            pkgSize = pkgSize + 1;
            const docs = await collection.find().filter({ active: true, size: { $gte: pkgSize }, flag: 'B' }).getDocuments();
            let contents = [];
            if (docs) docs.map(doc => {
                let content = doc.getContent();
                content._id = doc.key;
                contents.push(content);
            });
            return contents;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findLowerPackages: async (lower, upper, collection) => {
        try {
            let low = Math.floor(Number(lower));

            let high = Math.floor(Number(upper));

            let docs = await collection.find().filter({ active: true, size: { $lt: high, $gt: low }, flag: 'B' }).count();

            if (docs && docs.count) {
                return docs.count;
            }

            return 0;
        } catch (e) {
            throw new Error(e.message);
        }
    }
}