const { getPresignedUrl } = require('../middlewares/oci-sdk');

module.exports = {
    findOrganizationById: async (key, collection, collectionPkgs) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('Could not find organization');
            let content = doc.getContent();
            content._id = doc.key;
            let active_plan = content.active_plan;
            const [url, package] = [await generateOrganizationUrl(content), await collectionPkgs.find().fetchArraySize(0).key(active_plan).getOne()];
            if (package) {
                let pkgTemp = package.getContent();
                pkgTemp._id = package.key;
                content.active_plan = pkgTemp;
            }
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateOrganizationPackage: async (key, pkg, size, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.combined_plan = Number(size);
            document.available = Number(size) - Number(document.data_uploaded);

            var percent_used = (((Number(document.combined_plan - document.available)) * 100) % (Number(document.combined_plan)));
            if (percent_used > 100) percent_used = 100;
            var percent_left = 100 - Number(percent_used);
            if (percent_left < 0) percent_left = 0;
            document.percent_left = percent_left;
            document.percent_used = percent_used;
            document.active_plan = pkg;

            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findOrganizationByIdUpt: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('Could not find organization');
            let content = doc.getContent();
            content._id = doc.key;
            return content;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateValue: async (key, field, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            switch (field) {
                case 'name': document.name = value; break;
                case 'email': document.email = value; break;
                case 'contact': document.contact = value; break;
                case 'address': document.address = value; break;
                case 'active': document.active = value; break;
                case 'image': document.logo = value; break;
            }

            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            await generateOrganizationUrl(document);
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getOrgByIdS: async (key, collection, collectionSets) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(key).getOne();

            if (!doc) throw new Error('Could not find organization');
            let org = doc.getContent();
            org._id = doc.key;
            await generateOrganizationUrl(org);
            let setting = org && org.settingsId ? org.settingsId : '';
            if (org && org.settingsId) {
                const docS = await collectionSets.find().fetchArraySize(0).key(org.settingsId).getOne();
                setting = docS.getContent();
                setting._id = org.settingsId;
            }
            org.settingsId = setting;
            return org;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    updateSettingsId: async (key, setId, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) return false;
            let document = doc.getContent();
            document.settingsId = setId;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            return document;
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
}

async function generateOrganizationUrl(org) {
    var url = '';
    if (org && org.logo && org.bucketName) url = await getPresignedUrl(org._id, org.logo, org.bucketName)
    if (url) org.logo = url;
}