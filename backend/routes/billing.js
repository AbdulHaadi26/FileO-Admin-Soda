const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');


router.get('/bills', JWT, async (req, res) => {
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionBilling = await soda.createCollection('billing_ep');

        let list = [];

        let doc = await collectionBilling.find().filter({ orgId: req.token.org, status: req.query.status }).getDocuments();

        if (doc) {
            doc.map(i => {
                let content = i.getContent();
                content._id = i.key
                list.push(content);
            })
        };

        res.json({ list: list });
    }
    catch (e) {
        console.log(e);
    } finally {
        await closeConnection(connection);
    }
});


const { findPackageById } = require('../schemas/packages');

router.get('/tempbills', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionOrgs = await soda.createCollection('orgs');
        const collectionBillDiff = await soda.createCollection('billing_user_diff');
        const collectionBilling = await soda.createCollection('billing_ep');
        const collectionPackage = await soda.createCollection('pkgs');
        const collectionDowngrade = await soda.createCollection('downgrade_str_bills');

        if (req.query.pass !== 'Haadi') throw new Error('Password Incorrect')

        let doc = await collectionOrgs.find().filter({ isTrail: { $ne: true } }).getDocuments();


        if (doc) {
            await Promise.all(doc.map(async item => {
                let org = item.getContent();

                org._id = item.key;

                let price = 0;

                let pkg = await findPackageById(org.active_plan, collectionPackage);

                price = pkg ? pkg.price : 0;

                price = price + (Number(org.userCount) * 275);

                var date = new Date(Date.now()), y = date.getFullYear(), m = date.getMonth();
                var firstDay = new Date(y, m, 1);
                var lastDay = new Date(y, m + 1, 0);

                let diffDocsM = await collectionDowngrade.find().filter({ org: org._id, date: { $lte: lastDay, $gte: firstDay } }).getDocuments();

                let differenceM = 0;

                if (diffDocsM) {
                    diffDocsM.map(item => {
                        let content = item.getContent();

                        let dateM = new Date(content.date);
                        let day = dateM.getDate();
                        let dayM = lastDay.getDate();

                        let dayN = dayM - day;

                        let mult = dayN / dayM;

                        differenceM = differenceM + Math.floor(Number(content.difference) * mult);
                    })

                    price = price - differenceM
                }

                let diffDocs = await collectionBillDiff.find().filter({ org: org._id, date: { $lte: lastDay, $gte: firstDay } }).getDocuments();

                let difference = 0;

                if (diffDocs) {

                    diffDocs.map(item => {
                        let content = item.getContent();

                        let dateM = new Date(content.date);

                        let day = dateM.getDate();
                        let dayM = lastDay.getDate();

                        let dayN = dayM - day;

                        let mult = dayN / dayM

                        difference = difference + Math.floor(Number(content.difference ? content.difference : 0) * mult * 275);
                    })

                    price = price + difference
                }

                let docC = await collectionBilling.find().filter({ type: 'Monthly Billing' }).count();
                let count = 1;

                if (docC && docC.count) {
                    count = docC.count;
                };

                if (count < 10) {
                    count = `0${count}`;
                }

                let randomId = org.name.substring(0, 3) + '-' + count + 'M';
                randomId = randomId.replace(/\s+/g, '');

                let billing_data = {
                    orderId: randomId,
                    orgId: item.key,
                    created: Date.now(),
                    date: new Date(Date.now()),
                    status: 'Unpaid',
                    type: 'Monthly Billing',
                	data: {
                        pkgId: pkg && pkg._id ? pkg._id : '',
                        count: org ? org.userCount : 0
                    },
                    price: price,
                    pkgPrice: pkg ? pkg.price : 0,
                    difference: (difference - differenceM),
                    userPrice: (Number(org.userCount) * 275)

                };

                await collectionBilling.insertOneAndGet(billing_data);
            }));

            res.json({ success: true })
        }
    } catch (e) {
        console.log(e);
    } finally {
        await closeConnection(connection);
    }
});


module.exports = router;