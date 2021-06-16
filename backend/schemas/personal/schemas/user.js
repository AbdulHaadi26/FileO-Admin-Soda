const { getPresignedUrl } = require('../../../middlewares/oci-sdk');
const bcrypt = require('bcryptjs');

module.exports = {

    updateVerified: async (key, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let document = docToReplace.getContent();
            document.verified = value;
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            return docToReplace;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateUserPackage: async (key, pkg, size, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            let document = docToReplace.getContent();
            document.combined_plan = Number(size);
            document.available = Number(size) - Number(document.data_uploaded);
            document.active_plan = pkg;
            document.isTrail = false;
            document.trail_end_date = '';

            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            document._id = docToReplace.key;
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updatePackageDetails: async (key, u_d, avb, collection) => {
        try {
            let doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) return false;
            let document = doc.getContent();
            document.data_uploaded = Number(u_d);
            document.available = Number(avb);
            await collection.find().fetchArraySize(0).key(key).replaceOne(document);
            return document;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    createUser: async (data, collection) => {
        try {
            const doc = await collection.insertOneAndGet(data);
            if (!doc || !doc.key) throw new Error('Employee could not be created.');
            return doc.key
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getUserByRoles: async (org, list, collection) => {
        try {
            let arr = [];
            if (list && list.length > 0) {
                let doc = await collection.find().filter({ current_employer: org, roles: { $in: list } }).getDocuments();
                if (doc) doc.map(document => arr.push(document.key));
            }
            return arr;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findUserByCredentials: async (email, password, collection) => {
        try {
            const docU = await collection.find().fetchArraySize(0).filter({ email: email, active: true }).getOne();
            if (!docU || !docU.key) throw new Error('User with this email does not exist');
            let user = docU.getContent();
            user._id = docU.key;

            const isPasswordMatched = await bcrypt.compare(password, user.password);
            if (!isPasswordMatched) throw new Error('Invalid login credentials');

            return user;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    getProfile: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('User profile not found');
            let user = doc.getContent();
            user._id = doc.key;
            [await generateProfileUrl(user), await generateLogoUrl(user)];
            return user;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateImage: async (key, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            let user = docToReplace.getContent();
            user.image = value;
            await collection.find().fetchArraySize(0).key(key).replaceOne(user);

        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateValue: async (key, field, value, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;

            var user = docToReplace.getContent();
            var pass;
            if (field === 'password') pass = await bcrypt.hash(value, 10);

            if (value || field === 'active' || field === 'clientView')
                switch (field) {
                    case 'name': user.name = value; break;
                    case 'email': user.email = value; break;
                    case 'password':
                        if (pass) user.password = pass; break;
                    case 'contact': user.contact = value; break;
                    case 'cnic': user.cnic = value; break;
                    case 'address': user.address = value; break;
                    case 'dob': user.dob = value; break;
                    case 'image': user.image = value; break;
                    case 'clientView': user.clientView = value; break;
                    case 'active': user.active = value; break;
                    case 'userT': user.userType = Number(value); break;
                    case 'storage':
                        if (Number(user.storageUploaded) < Number(value)) {
                            let strAv = Number(value) - Number(user.storageUploaded);
                            if (strAv < 0) strAv = 0;
                            user.storageLimit = Number(value);
                            user.storageAvailable = Number(strAv);
                        }
                        break;
                };

            await collection.find().fetchArraySize(0).key(key).replaceOne(user);

            user._id = docToReplace.key;
            [await generateProfileUrl(user), await generateLogoUrl(user)];
            return user;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findUserById: async (key, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!doc) throw new Error('User profile not found');
            let user = doc.getContent();
            user._id = doc.key;
            return user;
        } catch (e) {
            throw new Error(e.message);
        }
    },


    deleteUser: async (key, collection) => {
        try {
            await collection.find().key(key).remove();
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findUserByEmail: async (email, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ email: email }).getOne();
            if (doc) return true;
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    findUserByName: async (email, collection) => {
        try {
            const doc = await collection.find().fetchArraySize(0).filter({ email: email }).getOne();
            if (doc) {
                let user = doc.getContent();
                user._id = doc.key;
                return user;
            }
            return false;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    updateStorage: async (key, sU, sA, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).key(key).getOne();
            if (!docToReplace) return false;
            var user = docToReplace.getContent();
            user.storageAvailable = Number(sA);
            user.storageUploaded = Number(sU);
            await collection.find().fetchArraySize(0).key(key).replaceOne(user);
        } catch (e) {
            throw new Error(e.meesage);
        }
    },

    updatePasswordByEmail: async (email, password, collection) => {
        try {
            let docToReplace = await collection.find().fetchArraySize(0).filter({ email: email }).getOne();
            if (!docToReplace) return false;
            var user = docToReplace.getContent();
            user.password = await bcrypt.hash(password, 10);
            await collection.find().fetchArraySize(0).key(docToReplace.key).replaceOne(user);
        } catch (e) {
            throw new Error(e.meesage);
        }
    },
}

async function generateProfileUrl(user) {
    var url = '';
    if (user && user.image && user.bucketName) url = await getPresignedUrl(user._id, user.image, user.bucketName)
    if (url) user.image = url;
}

async function generateLogoUrl(user) {
    var urlC = '';
    if (user && user.current_employer && user.current_employer.logo && user.current_employer.bucketName) urlC = await getPresignedUrl(user.current_employer._id, user.current_employer.logo, user.current_employer.bucketName)
    if (urlC) user.current_employer.logo = urlC;
}