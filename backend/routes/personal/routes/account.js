const express = require('express');
const router = express.Router();
const JWT = require('../../../middlewares/jwtAuth');

const {
    getSodaDatabase,
    getConnection,
    closeConnection
} = require('../../../middlewares/oracleDB');

const {
    getAllCFileDashCountU, getAllCFileLimitDashU
} = require('../../../schemas/personal/schemas/clientFile');

const {
    getAllFileCountDash, getAllFileLimitDashU, getAllFileCountTypeU
} = require('../../../schemas/personal/schemas/userFile');

const URectF = require('../../../schemas/personal/schemas/recentUserFile');
const CRectF = require('../../../schemas/personal/schemas/recentClientFile');

const { getAllPlanCountDash } = require('../../../schemas/personal/schemas/plans');

const { findActivePackages, findLowerPackages } = require('../../../schemas/personal/schemas/packages');
const { findUserById, updateUserPackage } = require('../../../schemas/personal/schemas/user');

router.get('/dashboard', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPlan = await soda.createCollection('plans');
        const collectionFiles = await soda.createCollection('user_files');
        const collectionCFiles = await soda.createCollection('client_files');
        const collectionUCat = await soda.createCollection('user_cats');
        const collectionCCat = await soda.createCollection('client_cats');

        const { _id } = req.token;

        let planCount = await getAllPlanCountDash(_id, collectionPlan);
        let ufileCount = await getAllFileCountDash(_id, collectionFiles);
        let cfileCount = await getAllCFileDashCountU(_id, collectionCFiles);
        let ufiles = await getAllFileLimitDashU(_id, collectionFiles, collectionUCat);
        let cfiles = await getAllCFileLimitDashU(_id, collectionCFiles, collectionCCat);

        let docCount = await getAllFileCountTypeU(_id, ['pdf', 'word', 'excel', 'powerpoint', 'text'], collectionFiles);
        let mediaCount = await getAllFileCountTypeU(_id, ['video', 'audio'], collectionFiles);
        let otherCount = await getAllFileCountTypeU(_id, ['others'], collectionFiles);
        let imageCount = await getAllFileCountTypeU(_id, ['image'], collectionFiles);

        let totalFile = [].concat(ufiles, cfiles);

        res.json({ success: true, totalFile, ufileCount, cfileCount, planCount, orgFileCount: ufileCount, docCount, mediaCount, otherCount, imageCount });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/bill', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionBilling = await soda.createCollection('billing_ep');

        let date = new Date(Date.now());

        let billCount = await collectionBilling.find().filter({ orgId: req.token._id, status: 'Unpaid', date: { $lte: date } }).count();

        let count = 0;
        if (billCount && billCount.count) count = billCount.count;

        res.json({ count, date });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/recentFilesDate', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionURecfs = await soda.createCollection('urecfs');
        const collectionUFiles = await soda.createCollection('user_files');

        const collectionCRecfs = await soda.createCollection('crecfs');
        const collectionCFiles = await soda.createCollection('client_files');

        const { _id } = req.token;

        let userFiles = await URectF.getMostRecentDate(_id, collectionURecfs, collectionUFiles);
        let clientFiles = await CRectF.getMostRecentDate(_id, collectionCRecfs, collectionCFiles);

        let fileList = [].concat(userFiles, clientFiles);
        return res.json({ files: fileList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/packages', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPkgs = await soda.createCollection('pkgs');

        const packages = await findActivePackages(req.query.size ? Number(req.query.size) : 0, collectionPkgs);

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

router.post('/downgradePackage', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { pkgId, difference } = req.body;

        const collectionUser = await soda.createCollection('users');
        const collectionDowngrade = await soda.createCollection('downgrade_str_bills');
        const collectionPkgs = await soda.createCollection('pkgs');

        let user = await findUserById(req.token._id, collectionUser);

        let package = await findPackageById(pkgId, collectionPkgs);

        if (!user) throw new Error('User not found');
        if (!package) throw new Error('Package not found');

        if (package.size < user.data_uploaded) throw new Error('Please select a bigger package. Current data uploaded is greater than the package size');

        let data = {
            userId: req.token._id,
            pkgId,
            difference,
            email: user.email,
            date: new Date(Date.now())
        };

        await updateUserPackage(req.token._id, pkgId, package.size, collectionOrg);

        let doc = await collectionDowngrade.insertOneAndGet(data);

        if (!doc && !doc.key) {
            throw new Error('Billing could not be generated');
        }

        user = await findUserById(req.token._id, collectionUser);
        if (!user) return res.json({ error: 'Couldt not find user' });

        user.bucketSize = await getBucketSize(req.token.bucket);

        res.json({ user: user });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


module.exports = router;