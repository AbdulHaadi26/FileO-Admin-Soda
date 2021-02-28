const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const JWT = require('../middlewares/jwtAuth');

const {
    putPresignedUrl,
    deleteObject,
    getBucketSize
} = require('../middlewares/oci-sdk');

const {
    findActivePackages,
    findPackageById
} = require('../schemas/packages');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    findOrganizationById,
    updateValue,
    getOrgByIdS,
    findOrganizationByIdUpt,
    updateOrganizationPackage
} = require('../schemas/organization');

const {
    getAllUserCount,
    getProfile
} = require('../schemas/user');

const {
    getAllRolesCount
} = require('../schemas/role');

const {
    getAllCatCount
} = require('../schemas/category');

const {
    getSetting
} = require('../schemas/setting');

router.get('/packages', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPkgs = await soda.createCollection('pkgs');

        const packages = await findActivePackages(req.query.size, collectionPkgs);
        res.json({ packages: packages });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updatePackage', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { pkgId } = req.body;
        const _id = req.body.org;

        const [collectionPkgs, collectionOrg] = [await soda.createCollection('pkgs'), await soda.createCollection('orgs')];

        const packages = await findPackageById(pkgId, collectionPkgs);

        if (!packages) throw new Error('Package does not exist.');

        await updateOrganizationPackage(_id, pkgId, packages.size, collectionOrg);

        res.json({ success: true });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.get('/getOrganization', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        var _id = req.token.org;

        const [collectionUser, collectionOrg, collectionRoles, collectionCats, collectionPkgs] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
            await soda.createCollection('pkgs')
        ];

        const p1 = findOrganizationById(_id, collectionOrg, collectionPkgs);
        const p2 = getAllUserCount(_id, collectionUser);
        const p3 = getAllRolesCount(_id, collectionRoles);
        const p4 = getAllCatCount(_id, collectionCats);
        var [org, employeeCount, roleCount, catCount] = [await p1, await p2, await p3, await p4];
        if (!org) return res.json({ error: 'Couldt not find organization' });


        org.bucketSize = await getBucketSize(req.token.bucket);
        res.json({ org: org, employeeCount: employeeCount, roleCount: roleCount, catCount: catCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateOrganization', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { field, value, _id } = req.body;

        const [collectionUser, collectionOrg, collectionRoles, collectionCats, collectionPkgs] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
            await soda.createCollection('pkgs')
        ];

        await updateValue(_id, field, value, collectionOrg);
        const p1 = findOrganizationById(_id, collectionOrg, collectionPkgs)
        const p2 = getAllUserCount(_id, collectionUser);
        const p3 = getAllRolesCount(_id, collectionRoles);
        const p4 = getAllCatCount(_id, collectionCats);
        let [org, employeeCount, roleCount, catCount] = [await p1, await p2, await p3, await p4];
        if (!org) throw new Error('Organizationd details could not be updated');
        
        org.bucketSize = await getBucketSize(req.token.bucket);

        res.json({ org: org, employeeCount: employeeCount, roleCount: roleCount, catCount: catCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getOrganizationS', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionOrg, collectionOrgS] = [await soda.createCollection('orgs'), await soda.createCollection('org_sets')];

        const org = await getOrgByIdS(req.token.org, collectionOrg, collectionOrgS);
        if (!org) throw new Error('Could not not find organization');

        org.bucketSize = await getBucketSize(req.token.bucket);

        res.json({ org: org });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/imageUrl/sign', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { image, mimeType, fileSize } = req.body;
        var size = 1;
        const collection = await soda.createCollection('sets');
        const set = await getSetting(collection);

        if (set && set.maxImageSize) size = Number(set.maxImageSize);
        if (!validateMime(mimeType, size, fileSize)) throw new Error('Image type not supported');
        const fileName = `${uuidv4()}${image.toLowerCase().split(' ').join('-')}`;
        const key = generateFileName(fileName, req.token.org);
        const url = await putPresignedUrl(req.token.org, key, req.token.bucket);

        if (url) res.status(200).json({ url: url, key: key });
        else throw new Error('Could not upload user image');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/uploadImage', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { _id, key } = req.body;

        const [collectionUser, collectionOrg, collectionRoles, collectionCats, collectionPkgs] = [
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
            await soda.createCollection('pkgs')
        ];

        var orgT = await findOrganizationByIdUpt(_id, collectionOrg, collectionPkgs);
        if (!orgT) throw new Error('Organization not found');
        if (orgT.logo && orgT.bucketName) await deleteObject(orgT.logo, orgT.bucketName);

        const p1 = updateValue(_id, 'image', key, collectionOrg);
        const p2 = getAllUserCount(_id, collectionUser);
        const p3 = getAllRolesCount(_id, collectionRoles);
        const p4 = getAllCatCount(_id, collectionCats);
        const p5 = getProfile(req.token._id, collectionUser, collectionOrg, collectionRoles, collectionCats);
        var [org, employeeCount, roleCount, catCount, user] = [await p1, await p2, await p3, await p4, await p5];
        if (!org) throw new Error('Could not find organization');

        res.json({ org: org, employeeCount: employeeCount, roleCount: roleCount, catCount: catCount, user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function validateMime(type, size, expectedSize) {
    return (type === "image/png" || type === "image/jpg" || type === "image/jpeg" || type === 'image/x-png' || type === 'image/gif') && (size <= expectedSize) ? true : false;
}

function generateFileName(fileName, id) {
    return `FileO/organization/${id}/image/${fileName}`;
}

module.exports = router;
