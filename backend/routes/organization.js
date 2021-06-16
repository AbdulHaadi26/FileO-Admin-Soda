const express = require('express');
const router = express.Router();
const uuidv4 = require('uuid/v4');
const nodeMailer = require('nodemailer');
const JWT = require('../middlewares/jwtAuth');

const {
    putPresignedUrl,
    deleteObject,
    getBucketSize
} = require('../middlewares/oci-sdk');

const {
    findActivePackages,
    findPackageById, findLowerPackages
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
    getProfile, getAllUserCount, findUserById
} = require('../schemas/user');

const {
    getSetting
} = require('../schemas/setting');

const { fileOUrl, logoUrl } = require('../constants');

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

router.get('/packagesCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPkgs = await soda.createCollection('pkgs');

        const count = await findLowerPackages(req.query.lowerSize, req.query.upperSize, collectionPkgs);

        res.json({ count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getPackage/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPlan = await soda.createCollection('pkgs');

        const { _id } = req.params;

        let plan = await findPackageById(_id, collectionPlan);
        if (!plan) throw new Error('Plan not found');

        res.json({ plan: plan });
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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionPkgs = await soda.createCollection('pkgs');

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


router.post('/downgradePackage', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { pkgId, difference } = req.body;

        const collectionUser = await soda.createCollection('users');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionSet = await soda.createCollection('sets');
        const collectionDowngrade = await soda.createCollection('downgrade_str_bills');
        const collectionPkgs = await soda.createCollection('pkgs');

        let user = await findUserById(req.token._id, collectionUser);

        let organization = await findOrganizationByIdUpt(req.token.org, collectionOrg);

        let package = await findPackageById(pkgId, collectionPkgs);

        if (!organization) throw new Error('Organization not found');
        if (!user) throw new Error('User not found');
        if (!package) throw new Error('Package not found');

        if (package.size < organization.data_uploaded) throw new Error('Please select a bigger package. Current data uploaded is greater than the package size');

        let data = {
            org: req.token.org,
            userId: req.token._id,
            pkgId,
            difference,
            email: user.email,
            date: new Date(Date.now())
        };

        await updateOrganizationPackage(req.token.org, pkgId, package.size, collectionOrg);

        let doc = await collectionDowngrade.insertOneAndGet(data);

        if (!doc && !doc.key) {
            throw new Error('Billing could not be generated');
        }

        let html = `  <img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
        <h2 style="margin-left: 50%;">File-O</h2>
        <br/>
        <h3 style="font-weight:400;">${user.name} has requested to downgrade his/her organization storage.</h3>
        
        <p><b>Contact Details: </b> <br/> <br/>
        	Email: ${user.email} 
        </p>
        
        <p><br/>Thank you for using File-O. Questions or concerns? Contact <a rel="noopener noreferrer" target="_blank" href="${fileOUrl}/support">File-O Support</a>.</p>
        <br/>

        Sincerely,
        <br/>File-O Team<br/> <br/>

        <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
        <p>File-O is an affiliate of CWare Technologies.</p>`

        let set = await getSetting(collectionSet);

        let transporter = nodeMailer.createTransport({
            service: set.service,
            auth: {
                user: set.email,
                pass: set.pass
            }
        });

        var mailOptions = {
            from: set.email,
            to: set.email,
            subject: 'File-O User Downgrade',
            html: html
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }

        });


        let org = await findOrganizationById(req.token.org, collectionOrg, collectionPkgs);
        if (!org) return res.json({ error: 'Couldt not find organization' });

        org.bucketSize = await getBucketSize(req.token.bucket);

        res.json({ org: org });

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

        let _id = req.token.org;

        const collectionOrg = await soda.createCollection('orgs');
        const collectionPkgs = await soda.createCollection('pkgs');

        const org = await findOrganizationById(_id, collectionOrg, collectionPkgs);
        if (!org) return res.json({ error: 'Couldt not find organization' });

        org.bucketSize = await getBucketSize(req.token.bucket);
        res.json({ org: org });
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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionPkgs = await soda.createCollection('pkgs');

        await updateValue(_id, field, value, collectionOrg);

        let org = await findOrganizationById(_id, collectionOrg, collectionPkgs);

        if (!org) throw new Error('Organizationd details could not be updated');

        org.bucketSize = await getBucketSize(req.token.bucket);

        res.json({ org: org });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/downgrade', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { field, value, _id } = req.body;

        const collectionOrg = await soda.createCollection('orgs');
        const collectionPkgs = await soda.createCollection('pkgs');
        const collectionUser = await soda.createCollection('users');
        const collectionBillDiff = await soda.createCollection('billing_user_diff');

        if (field === 'downgrade') {
            let orgT = await findOrganizationById(_id, collectionOrg, collectionPkgs);

            if (!orgT) throw new Error('Organization could not be found');

            let uCount = await getAllUserCount(_id, collectionUser);

            if (uCount > Number(value)) throw new Error('Organization currently have more users than the downgrade value.');

            if (Number(value) < 3) throw new Error('Minimum 3 users are required');

            if (Number(orgT.userCount) - Number(value) < 0) throw new Error('Value cannot be greater than current limit');

            let billRedData = {
                org: _id,
                difference: Number(value) - Number(orgT.userCount),
                date: new Date(Date.now())
            };

            await collectionBillDiff.insertOneAndGet(billRedData);
        }

        await updateValue(_id, field, value, collectionOrg);

        let org = await findOrganizationById(_id, collectionOrg, collectionPkgs);

        if (!org) throw new Error('Organizationd details could not be updated');

        org.bucketSize = await getBucketSize(req.token.bucket);

        res.json({ org: org });
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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionOrgS = await soda.createCollection('org_sets');

        let org = await getOrgByIdS(req.token.org, collectionOrg, collectionOrgS);
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
        const fileName = `${image.toLowerCase().split(' ').join('-')}`;
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

        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');
        const collectionPkgs = await soda.createCollection('pkgs');

        let orgT = await findOrganizationByIdUpt(_id, collectionOrg, collectionPkgs);

        if (!orgT) throw new Error('Organization not found');
        if (orgT.logo && orgT.bucketName) await deleteObject(orgT.logo, orgT.bucketName);

        let org = await updateValue(_id, 'image', key, collectionOrg);
        let user = await getProfile(req.token._id, collectionUser, collectionOrg);

        if (!org) throw new Error('Could not find organization');

        org.bucketSize = await getBucketSize(req.token.bucket);

        res.json({ org: org, user: user });
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
    return `FileO/organization/${id}/image/${uuidv4()}/${fileName}`;
}

module.exports = router;
