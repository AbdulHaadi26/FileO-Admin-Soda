const express = require('express');
const router = express.Router();
const Axios = require('axios');
const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');
const JWT = require('../middlewares/jwtAuth');

const { userUrl, logoUrl } = require('../constants');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    createOrganization,
    deleteOrganization,
    updateOrganizationPackage,
    updateCountOrg,
    findOrganizationByIdUpt
} = require('../schemas/organization');

const {
    createUser, findUserById
} = require('../schemas/user');

const {
    findPackageById,
} = require('../schemas/packages');

const {
    getSetting
} = require('../schemas/setting');

const {
    createBucket,
    deleteBucket
} = require('../middlewares/oci-sdk');
const { updateUserPackage } = require('../schemas/personal/schemas/user');

router.post('/details', async (req, res) => {
    var id, mName, cOrg, connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { url } = req.query;

        let response = await Axios.get(url);

        if (response && response.data) {
            const { transaction_status, order_id } = response.data;

            const collectionBilling = await soda.createCollection('billing_ep');
            const collectionOrg = await soda.createCollection('orgs');
            const collectionUser = await soda.createCollection('users');
            const collectionPkg = await soda.createCollection('pkgs');
            const collectionSets = await soda.createCollection('sets');


            if (!transaction_status || transaction_status !== 'PAID') {
                if (transaction_status === 'FAILED') {
                    let document = await collectionBilling.find().fetchArraySize(0).filter({ orderId: order_id }).getOne();
                    if (!document) throw new Error('Order does not exist.');

                    let bDataTemp = document.getContent();
                    bDataTemp.status = 'Failed';
                    bDataTemp.paid_on = new Date(Date.now());

                    await collectionBilling.find().fetchArraySize(0).key(order_id).replaceOne(bDataTemp);
                    throw new Error('Payment was not sucessfull.');
                }
                throw new Error('Payment is currently pending.');
            }

            let doc = await collectionBilling.find().fetchArraySize(0).filter({ orderId: order_id }).getOne();
            let bData;

            if (doc && transaction_status === 'PAID') {
                let billing_data = doc.getContent();


                if (billing_data.status === 'Pending' || billing_data.status === 'Unpaid') {

                    switch (billing_data.type) {
                        case 'Register':

                            if (billing_data.data) {
                                const { oname, ocontact, oloc, name, email, password, nUsers, comp_size, package, code } = billing_data.data;


                                cOrg = collectionOrg;

                                const pkg = await findPackageById(package, collectionPkg);

                                let orgData = {
                                    name: oname,
                                    contact: ocontact,
                                    email: email,
                                    loc: oloc,
                                    active_plan: package,
                                    combined_plan: Number(pkg.size),
                                    comp_size: comp_size,
                                    active: true,
                                    userCount: nUsers,
                                    countryCode: code,
                                    bucketName: '',
                                    data_uploaded: Number(0),
                                    percent_left: Number(100),
                                    percent_used: Number(0),
                                    available: Number(pkg.size),
                                    created: Date.now(),
                                    date: new Date(),
                                    isTrail: false
                                };

                                let tempName = oname;
                                tempName = tempName.replace(/\s+/g, '');

                                let tempEmail = email;
                                tempEmail = tempEmail.replace('@', '-');
                                mName = `${tempName}-${tempEmail}`;

                                let bucket = await createBucket(`${tempName}-${tempEmail}`);
                                if (!bucket) return new Error('Bucket cannot be created.')
                                orgData.bucketName = `${tempName}-${tempEmail}`;

                                let key = await createOrganization(orgData, collectionOrg);
                                id = key;


                                let userData = {
                                    name: name,
                                    email: email,
                                    password: password,
                                    current_employer: key,
                                    active: true,
                                    orgName: orgData.name,
                                    userType: 2,
                                    storageAvailable: 1,
                                    storageUploaded: 0,
                                    storageLimit: 1,
                                    bucketName: orgData.bucketName,
                                    created: Date.now(),
                                    date: new Date()
                                };

                                userData.password = await bcrypt.hash(password, 10);

                                let uKey = await createUser(userData, collectionUser);

                                let mydate = new Date();
                                let month = ["January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
                                let str = mydate.getDate() + '-' + month + '-' + mydate.getFullYear();
                                let sql = `INSERT INTO user_billing (orgId, userId, start_date) VALUES ('${key}', '${uKey}', '${str}')`;
                                await connection.execute(sql);



                                let html = `<img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
                                        <h2 style="margin-left: 50%;">File-O</h2>
                                        <br/>
                                        <img src="${userUrl}" alt="File-O Img"/>
                                        <br/><br/>

                                        <p><b>Ready to bring the rest of your team on board?</b><br/> <br/>
                                        Teamwork makes the dream work, and that’s also true for File-O. Keep your great work 
                                        going with shared files, notes, and folders. Achieve productivity with file versioning, 
                                        client sharing, and real-time data retrieving.
                                        </p>

        
                                        <p>You can add users, delete them, or even transfer data of one user to 
                                        another. Visit the Users tab in the admin panel to manage users
                                        and their access.
                                        </p>
                                        <br/>
                                        <p><b>Upgrade your plan to paid subscription before your File-O  free trial ends. </b></p>

                                        <p><b>Add your billing information to change your plan without any interruption.  </b></p></p>
                                        <br/>

                                        <p>CWare Technologies.<br/>
                                        Islamabad, 44000
                                        </p>`

                                let set = await getSetting(collectionSets);

                                let transporter = nodeMailer.createTransport({
                                    service: set.service,
                                    auth: {
                                        user: set.email,
                                        pass: set.pass
                                    }
                                });

                                let mailOptions = {
                                    from: set.email,
                                    to: email,
                                    subject: 'File-O Administrator',
                                    html: html
                                };

                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    }

                                });



                                html = `<img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
                  <br/>
            <h3 style="font-weight:400;"><b>Name:</b> ${name}</h3>
            <h3 style="font-weight:400;"><b>Email:</b> ${email}</h3>
            <h3 style="font-weight:400;"><b>Organization:</b> ${oname}</h3>
            <h3 style="font-weight:400;"><b>Phone:</b> ${code ? code : '+92'}${ocontact}</h3>
            <h3 style="font-weight:400;"><b>Message:</b></h3>

            <br/>

        <p>CWare Technologies.<br/>
        Islamabad, 44000
        </p>`

                                mailOptions = {
                                    from: set.email,
                                    to: set.email,
                                    subject: 'Account Registered - Paid',
                                    html: html
                                };

                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    }

                                });

                                bData = billing_data;
                                bData.orgId = id;
                                bData.status = 'Paid';
                                bData.paid_on = new Date(Date.now());

                                await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);
                            }
                            break;


                        case 'Upgrade':
                            var { pkgId } = billing_data.data;

                            var package = await findPackageById(pkgId, collectionPkg);

                            if (!package) throw new Error('Package does not exist.');

                            await updateOrganizationPackage(billing_data.orgId, pkgId, package.size, collectionOrg);

                            bData = billing_data;

                            bData.status = 'Paid';
                            bData.paid_on = new Date(Date.now());

                            await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);

                            break;


                        case 'Trial':
                            var { pkgId } = billing_data.data;

                            var package = await findPackageById(pkgId, collectionPkg);

                            if (!package) throw new Error('Package does not exist.');

                            await updateOrganizationPackage(billing_data.orgId, pkgId, package.size, collectionOrg);

                            bData = billing_data;

                            bData.status = 'Paid';
                            bData.paid_on = new Date(Date.now());

                            await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);

                            break;

                        case 'Employee':
                            const { count } = billing_data.data;

                            await updateCountOrg(billing_data.orgId, count, collectionOrg);

                            bData = billing_data;

                            bData.status = 'Paid';
                            bData.paid_on = new Date(Date.now());

                            await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);
                            break;


                        default: break;

                    }


                } else {
                    throw new Error('This bill has already been paid/failed');
                }

            }
        }

        res.json({ success: true });
    }
    catch (e) {
        console.log(e);
        id && await deleteOrganization(id, cOrg);
        mName && await deleteBucket(`${mName}`);
    } finally {
        await closeConnection(connection);
    }
});


router.put('/order/upgrade', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPkg = await soda.createCollection('pkgs');
        const collectionBilling = await soda.createCollection('billing_ep');
        const collectionOrg = await soda.createCollection('orgs');


        var { pkgId, current_plan } = req.body;

        var pkg = await findPackageById(pkgId, collectionPkg);

        var cp = await findPackageById(current_plan, collectionPkg);

        if (!pkg) throw new Error('Package does not exist.');
        if (!cp) throw new Error('Package does not exist.');

        let org = await findOrganizationByIdUpt(req.token.org, collectionOrg);

        if (!org) throw new Error('Organization not found');

        let docC = await collectionBilling.find().filter({ type: 'Upgrade' }).count();
        let count = 1;

        if (docC && docC.count) {
            count = docC.count;
        };

        if (count < 10) {
            count = `0${count}`;
        }

        let randomId = org.name.substring(0, 3) + '-' + count + 'U';
        randomId = randomId.replace(/\s+/g, '');

        let billing_data = {
            orderId: randomId,
            orgId: req.token.org,
            created: Date.now(),
            date: new Date(Date.now()),
            status: 'Pending',
            type: 'Upgrade',
            data: req.body,
            price: req.body.price,
            sizeDiff: pkg ? (Number(pkg.size) - Number(cp.size)) : 0,
            pkgPrice: pkg ? (Number(pkg.size) - Number(cp.size)) * 5 : 0,
            difference: 0,
            userPrice: 0

        };

        let orderId = await collectionBilling.insertOneAndGet(billing_data);

        if (!orderId && !orderId.key) throw new Error('Billing could not be generated.')

        billing_data._id = orderId.key;

        return res.json({ order: billing_data });
    } catch (e) {
        console.log(e.message);
        return res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/order/upgradeU', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPkg = await soda.createCollection('pkgs');
        const collectionBilling = await soda.createCollection('billing_ep');
        const collectionUser = await soda.createCollection('users');

        var { pkgId, current_plan } = req.body;

        var pkg = await findPackageById(pkgId, collectionPkg);

        var cp = await findPackageById(current_plan, collectionPkg);

        if (!pkg) throw new Error('Package does not exist.');
        if (!cp) throw new Error('Package does not exist.');

        let user = await findUserById(req.token._id, collectionUser);

        if (!user) throw new Error('User not found');

        let docC = await collectionBilling.find().filter({ type: 'Upgrade Package' }).count();
        let count = 1;

        if (docC && docC.count) {
            count = docC.count;
        };

        if (count < 10) {
            count = `0${count}`;
        }

        let randomId = user.name.substring(0, 3) + '-' + count + 'UP';
        randomId = randomId.replace(/\s+/g, '');

        let billing_data = {
            orderId: randomId,
            orgId: req.token._id,
            created: Date.now(),
            date: new Date(Date.now()),
            status: 'Pending',
            type: 'Upgrade Package',
            data: req.body,
            price: req.body.price,
            sizeDiff: pkg ? (Number(pkg.size) - Number(cp.size)) : 0,
            pkgPrice: pkg ? (Number(pkg.size) - Number(cp.size)) * 6 : 0,
            difference: 0,
            userPrice: 0

        };

        let orderId = await collectionBilling.insertOneAndGet(billing_data);

        if (!orderId && !orderId.key) throw new Error('Billing could not be generated.')

        billing_data._id = orderId.key;

        return res.json({ order: billing_data });
    } catch (e) {
        console.log(e.message);
        return res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/order/employee', JWT, async (req, res) => {

    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionOrg = await soda.createCollection('orgs');
        const collectionBilling = await soda.createCollection('billing_ep');

        let org = await findOrganizationByIdUpt(req.token.org, collectionOrg);

        if (!org) throw new Error('Organization not found');


        let docC = await collectionBilling.find().filter({ type: 'Employee' }).count();
        let count = 1;

        if (docC && docC.count) {
            count = docC.count;
        };

        if (count < 10) {
            count = `0${count}`;
        }


        let randomId = org.name.substring(0, 3) + '-' + count + 'E';
        randomId = randomId.replace(/\s+/g, '');


        let billing_data = {
            orderId: randomId,
            orgId: req.token.org,
            created: Date.now(),
            date: new Date(Date.now()),
            status: 'Pending',
            type: 'Employee',
            data: req.body,
            price: req.body.price,
            pkgPrice: 0,
            difference: 0,
            userPrice: (Number(req.body.count) * 275)

        };

        let orderId = await collectionBilling.insertOneAndGet(billing_data);

        if (!orderId && !orderId.key) throw new Error('Billing could not be generated.')

        billing_data._id = orderId.key;

        return res.json({ order: billing_data });
    } catch (e) {
        console.log(e.message);
        return res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.put('/order/trial', JWT, async (req, res) => {

    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPkg = await soda.createCollection('pkgs');
        const collectionUser = await soda.createCollection('users');
        const collectionBilling = await soda.createCollection('billing_ep');

        var { pkgId } = req.body;

        var pkg = await findPackageById(pkgId, collectionPkg);
        var user = await findUserById(req.token._id, collectionUser);


        if (!org) throw new Error('Organization does not exist.');
        if (!user) throw new Error('User does not exist.');


        let docC = await collectionBilling.find().filter({ type: 'Trial User' }).count();
        let count = 1;

        if (docC && docC.count) {
            count = docC.count;
        };

        if (count < 10) {
            count = `0${count}`;
        }

        let randomId = user.name.substring(0, 3) + '-' + count + 'TU';
        randomId = randomId.replace(/\s+/g, '');

        let billing_data = {
            orderId: randomId,
            orgId: req.token._id,
            created: Date.now(),
            date: new Date(Date.now()),
            status: 'Pending',
            type: 'Trial User',
            data: req.body,
            price: req.body.price,
            pkgPrice: pkg ? pkg.price : 0,
            difference: 0,
            userPrice: (275)
        };

        let orderId = await collectionBilling.insertOneAndGet(billing_data);

        if (!orderId && !orderId.key) throw new Error('Billing could not be generated.')

        billing_data._id = orderId.key;

        return res.json({ order: billing_data });
    } catch (e) {
        console.log(e.message);
        return res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.put('/order/trial', JWT, async (req, res) => {

    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPkg = await soda.createCollection('pkgs');
        const collectionOrgs = await soda.createCollection('orgs');
        const collectionBilling = await soda.createCollection('billing_ep');

        var { pkgId } = req.body;

        var pkg = await findPackageById(pkgId, collectionPkg);
        var org = await findOrganizationByIdUpt(req.token.org, collectionOrgs);


        if (!org) throw new Error('Organization does not exist.');
        if (!pkg) throw new Error('Package does not exist.');


        let docC = await collectionBilling.find().filter({ type: 'Trial' }).count();
        let count = 1;

        if (docC && docC.count) {
            count = docC.count;
        };

        if (count < 10) {
            count = `0${count}`;
        }

        let randomId = org.name.substring(0, 3) + '-' + count + 'T';
        randomId = randomId.replace(/\s+/g, '');

        let billing_data = {
            orderId: randomId,
            orgId: req.token.org,
            created: Date.now(),
            date: new Date(Date.now()),
            status: 'Pending',
            type: 'Trial',
            data: req.body,
            price: req.body.price,
            pkgPrice: pkg ? pkg.price : 0,
            difference: 0,
            userPrice: (3 * 275)
        };

        let orderId = await collectionBilling.insertOneAndGet(billing_data);

        if (!orderId && !orderId.key) throw new Error('Billing could not be generated.')

        billing_data._id = orderId.key;

        return res.json({ order: billing_data });
    } catch (e) {
        console.log(e.message);
        return res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.put('/transaction', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionBilling = await soda.createCollection('billing_ep');
        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');
        const collectionPkg = await soda.createCollection('pkgs');
        const collectionSets = await soda.createCollection('sets');

        const { orderId } = req.body;

        let url = `https://easypay.easypaisa.com.pk/easypay-service/rest/v1/order-status/${orderId}`;

        let response = await Axios.get(url);

        if (response && response.data) {
            const { transaction_status, order_id } = response.data;

            if (!transaction_status || transaction_status !== 'PAID') {
                if (transaction_status === 'FAILED') {
                    let document = await collectionBilling.find().fetchArraySize(0).filter({ orderId: order_id }).getOne();
                    if (!document) throw new Error('Order does not exist.');

                    let bDataTemp = document.getContent();
                    bDataTemp.status = 'Failed';
                    bDataTemp.paid_on = new Date(Date.now());

                    await collectionBilling.find().fetchArraySize(0).key(document.key).replaceOne(bDataTemp);
                    throw new Error('Payment was not sucessfull.');
                }
                throw new Error('Paymentis pending.');
            }

            let doc = await collectionBilling.find().fetchArraySize(0).filter({ orderId: order_id }).getOne();

            let bData;

            if (doc && transaction_status === 'PAID') {
                let billing_data = doc.getContent();

                if (billing_data.status === 'Pending' || billing_data.status === 'Unpaid') {

                    switch (billing_data.type) {
                        case 'Register':

                            if (billing_data.data) {
                                var { oname, ocontact, oloc, name, email, password, nUsers, comp_size, package, code } = billing_data.data;


                                cOrg = collectionOrg;

                                const pkg = await findPackageById(package, collectionPkg);

                                let orgData = {
                                    name: oname,
                                    contact: ocontact,
                                    email: email,
                                    loc: oloc,
                                    active_plan: package,
                                    combined_plan: Number(pkg.size),
                                    comp_size: comp_size,
                                    active: true,
                                    userCount: nUsers,
                                    countryCode: code,
                                    bucketName: '',
                                    data_uploaded: Number(0),
                                    percent_left: Number(100),
                                    percent_used: Number(0),
                                    available: Number(pkg.size),
                                    created: Date.now(),
                                    date: new Date(),
                                    isTrail: false
                                };

                                var tempName = oname;
                                tempName = tempName.replace(/\s+/g, '');

                                var tempEmail = email;
                                tempEmail = tempEmail.replace('@', '-');
                                mName = `${tempName}-${tempEmail}`;

                                var bucket = await createBucket(`${tempName}-${tempEmail}`);
                                if (!bucket) return new Error('Bucket cannot be created.')
                                orgData.bucketName = `${tempName}-${tempEmail}`;

                                var key = await createOrganization(orgData, collectionOrg);
                                id = key;


                                var userData = {
                                    name: name,
                                    email: email,
                                    password: password,
                                    current_employer: key,
                                    active: true,
                                    orgName: orgData.name,
                                    userType: 2,
                                    storageAvailable: 1,
                                    storageUploaded: 0,
                                    storageLimit: 1,
                                    bucketName: orgData.bucketName,
                                    created: Date.now(),
                                    date: new Date()
                                };

                                userData.password = await bcrypt.hash(password, 10);

                                var uKey = await createUser(userData, collectionUser);

                                var mydate = new Date();
                                var month = ["January", "February", "March", "April", "May", "June",
                                    "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
                                var str = mydate.getDate() + '-' + month + '-' + mydate.getFullYear();
                                var sql = `INSERT INTO user_billing (orgId, userId, start_date) VALUES ('${key}', '${uKey}', '${str}')`;
                                await connection.execute(sql);



                                var html = `<img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
                                        <h2 style="margin-left: 50%;">File-O</h2>
                                        <br/>
                                        <img src="${userUrl}" alt="File-O Img"/>
                                        <br/><br/>

                                        <p><b>Ready to bring the rest of your team on board?</b><br/> <br/>
                                        Teamwork makes the dream work, and that’s also true for File-O. Keep your great work 
                                        going with shared files, notes, and folders. Achieve productivity with file versioning, 
                                        client sharing, and real-time data retrieving.
                                        </p>

        
                                        <p>You can add users, delete them, or even transfer data of one user to 
                                        another. Visit the Users tab in the admin panel to manage users
                                        and their access.
                                        </p>
                                        <br/>
                                        <p><b>Upgrade your plan to paid subscription before your File-O  free trial ends. </b></p>

                                        <p><b>Add your billing information to change your plan without any interruption.  </b></p></p>
                                        <br/>

                                        <p>CWare Technologies.<br/>
                                        Islamabad, 44000
                                        </p>`

                                var set = await getSetting(collectionSets);

                                var transporter = nodeMailer.createTransport({
                                    service: set.service,
                                    auth: {
                                        user: set.email,
                                        pass: set.pass
                                    }
                                });

                                var mailOptions = {
                                    from: set.email,
                                    to: email,
                                    subject: 'File-O Administrator',
                                    html: html
                                };

                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    }

                                });



                                html = `<img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
                  <br/>
            <h3 style="font-weight:400;"><b>Name:</b> ${name}</h3>
            <h3 style="font-weight:400;"><b>Email:</b> ${email}</h3>
            <h3 style="font-weight:400;"><b>Organization:</b> ${oname}</h3>
            <h3 style="font-weight:400;"><b>Phone:</b> ${code ? code : '+92'}${ocontact}</h3>
            <h3 style="font-weight:400;"><b>Message:</b></h3>

            <br/>

        <p>CWare Technologies.<br/>
        Islamabad, 44000
        </p>`

                                mailOptions = {
                                    from: set.email,
                                    to: set.email,
                                    subject: 'Accout Registered - Paid',
                                    html: html
                                };

                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.log(error);
                                    }

                                });

                                bData = billing_data;
                                bData.orgId = id;
                                bData.status = 'Paid';
                                bData.paid_on = new Date(Date.now());

                                await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);
                            }
                            break;


                        case 'Upgrade':
                            var { pkgId } = billing_data.data;

                            var package = await findPackageById(pkgId, collectionPkg);

                            if (!package) throw new Error('Package does not exist.');

                            await updateOrganizationPackage(billing_data.orgId, pkgId, package.size, collectionOrg);

                            bData = billing_data;

                            bData.status = 'Paid';
                            bData.paid_on = new Date(Date.now());

                            await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);

                            break;


                        case 'Trial':
                            var { pkgId } = billing_data.data;

                            var package = await findPackageById(pkgId, collectionPkg);

                            if (!package) throw new Error('Package does not exist.');

                            await updateOrganizationPackage(billing_data.orgId, pkgId, package.size, collectionOrg);

                            bData = billing_data;

                            bData.status = 'Paid';
                            bData.paid_on = new Date(Date.now());

                            await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);

                            break;

                        case 'Employee':

                            const { count } = billing_data.data;

                            await updateCountOrg(billing_data.orgId, count, collectionOrg);

                            bData = billing_data;

                            bData.status = 'Paid';
                            bData.paid_on = new Date(Date.now());

                            await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);
                            break;


                        case 'Upgrade Package':

                            var { pkgId } = billing_data.data;

                            var package = await findPackageById(pkgId, collectionPkg);

                            if (!package) throw new Error('Package does not exist.');

                            await updateUserPackage(billing_data.orgId, pkgId, package.size, collectionUser);

                            bData = billing_data;

                            bData.status = 'Paid';
                            bData.paid_on = new Date(Date.now());

                            await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);


                        case 'Register User':

                            var {
                                name,
                                email,
                                password,
                                code,
                                contact,
                                country,
                                pkgId
                            } = billing_data;

                            const pkg = await findPackageById(pkgId, collectionPkg);

                            var tempEmail = email;
                            tempEmail = tempEmail.replace('@', '-');
                            mName = tempEmail;

                            var bucket = await createBucket(`${tempEmail}`);
                            if (!bucket) return new Error('Bucket cannot be created.');

                            var userData = {
                                name: name,
                                email: email,
                                password: password,
                                active: true,
                                bucketName: tempEmail,
                                created: Date.now(),
                                date: new Date(),
                                active_plan: pkg._id,
                                combined_plan: Number(pkg.size),
                                data_uploaded: Number(0),
                                available: Number(pkg.size),
                                code,
                                contact,
                                country,
                                flag: 'P',
                                isTrail: false
                            };

                            userData.password = await bcrypt.hash(password, 10);

                            var uKey = await createUser(userData, collectionUser);

                            var mydate = new Date();
                            var month = ["January", "February", "March", "April", "May", "June",
                                "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
                            var str = mydate.getDate() + '-' + month + '-' + mydate.getFullYear();
                            var sql = `INSERT INTO user_billing (orgId, userId, start_date) VALUES ('null', '${uKey}', '${str}')`;
                            await connection.execute(sql);

                            var html = `<img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
                        <h2 style="margin-left: 50%;">File-O</h2>
                        <br/>
                
                        <img src="${userUrl}" alt="File-O Img"/>
                        <br/><br/>
                
                        <p><b>Ready to bring the rest of your team on board?</b><br/> <br/>
                        Teamwork makes the dream work, and that’s also true for File-O. Keep your great work 
                        going with shared files, notes, and folders. Achieve productivity with file versioning, 
                        client sharing, and real-time data retrieving.
                        </p>
                
                        
                        <p>You can add users, delete them, or even transfer data of one user to 
                        another. Visit the Users tab in the admin panel to manage users
                        and their access.
                        </p>
                        <br/>
                        <p><b>Upgrade your plan to paid subscription before your File-O  free trial ends. </b></p>
                
                        <p><b>Add your billing information to change your plan without any interruption.  </b></p></p>
                        <br/>
                
                        <p>CWare Technologies.<br/>
                        Islamabad, 44000
                        </p>`

                            var set = await getSetting(collectionSets);

                            var transporter = nodeMailer.createTransport({
                                service: set.service,
                                auth: {
                                    user: set.email,
                                    pass: set.pass
                                }
                            });

                            var mailOptions = {
                                from: set.email,
                                to: email,
                                subject: 'File-O Personal',
                                html: html
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                }

                            });

                            html = `<img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
                        <h2 style="margin-left: 50%;">File-O</h2>
                                  <br/>
                            <h3 style="font-weight:400;"><b>Name:</b> ${name}</h3>
                            <h3 style="font-weight:400;"><b>Email:</b> ${email}</h3>
                            <h3 style="font-weight:400;"><b>Phone:</b> ${code ? code : '+92'}${contact}</h3>
                            <h3 style="font-weight:400;"><b>Message:</b></h3>
                
                            <br/>
                
                        <p>CWare Technologies.<br/>
                        Islamabad, 44000
                        </p>`

                            mailOptions = {
                                from: set.email,
                                to: set.email,
                                subject: 'Personal Account Registered - Paid',
                                html: html
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                }

                            });

                            break;


                        case 'Trial User':
                            var { pkgId } = billing_data.data;

                            var package = await findPackageById(pkgId, collectionPkg);

                            if (!package) throw new Error('Package does not exist.');

                            await updateUserPackage(billing_data.orgId, pkgId, package.size, collectionOrg);

                            bData = billing_data;

                            bData.status = 'Paid';
                            bData.paid_on = new Date(Date.now());

                            await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);

                            break;

                        default: break;

                    }

                } else {
                    throw new Error('This bill has already been paid/failed');
                }


            } else {
                throw new Error('Order not found');
            }

            res.json({ success: true });
        } else {
            throw new Error('Easy Paisa response was null.')
        }

    } catch (e) {
        console.log(e);
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;