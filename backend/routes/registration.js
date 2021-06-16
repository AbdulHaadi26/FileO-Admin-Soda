const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');

const {
    getSodaDatabase,
    getConnection,
    closeConnection
} = require('../middlewares/oracleDB');

const {
    createOrganization,
    deleteOrganization
} = require('../schemas/organization');

const {
    createUser
} = require('../schemas/user');

const {
    findPackageById,
    findActivePackages,
} = require('../schemas/packages');

const {
    getSetting
} = require('../schemas/setting');

const {
    createBucket,
    deleteBucket
} = require('../middlewares/oci-sdk');

const { logoUrl, userUrl } = require('../constants');

router.put('/trail', async (req, res) => {

    const {
        oname,
        ocontact,
        oloc,
        name,
        email,
        password,
        nUsers,
        comp_size,
        package,
        code
    } = req.body;

    var id, mName, cOrg, connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionOrg = await soda.createCollection('orgs');
        const collectionUser = await soda.createCollection('users');
        const collectionPkg = await soda.createCollection('pkgs');
        const collectionSets = await soda.createCollection('sets');

        cOrg = collectionOrg;

        const pkg = await findPackageById(package, collectionPkg);

        let start_date = new Date(Date.now());

        let end_date = new Date(Date.now());

        end_date.setMonth(end_date.getMonth() + 1);

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
            isTrail: true,
            trail_start_date: start_date,
            trail_end_date: end_date
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
            date: new Date(),
            flag:'B'
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
            subject: 'Accout Registered - Trial',
            html: html
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }

        });

        return res.json({ org: orgData });
    } catch (e) {
        console.log(e.message);
        id && await deleteOrganization(id, cOrg);
        mName && await deleteBucket(`${mName}`);
        return res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/register', async (req, res) => {

    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionBilling = await soda.createCollection('billing_ep');
        const collectionPkg = await soda.createCollection('pkgs');

        const pkg = await findPackageById(req.body.package, collectionPkg);

        if (!pkg) throw new Error('Package not found');

        let docC = await collectionBilling.find().filter({ type: 'Register' }).count();
        let count = 1;

        if (docC && docC.count) {
            count = docC.count;
        };

        if (count < 10) {
            count = `0${count}`;
        }

        let randomId = req.body.oname.substring(0, 3) + '-' + count + 'R';
        randomId = randomId.replace(/\s+/g, '');

        let billing_data = {
            orderId: randomId,
            created: Date.now(),
            date: new Date(Date.now()),
            status: 'Pending',
            type: 'Register',
            data: req.body,
            price: req.body.price,
            pkgPrice: pkg ? pkg.price : 0,
            difference: 0,
            userPrice: Number(req.body.nUsers) * 275
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


router.get('/packages', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Soda database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPkg = await soda.createCollection('pkgs');

        const pkgs = await findActivePackages(0, collectionPkg);

        return res.json({ pkgs: pkgs });
    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/email', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        let user = await collectionUser.find().fetchArraySize(0).filter({ email: req.query.email }).getOne();
        if (user) res.json({ isExist: true });
        else res.json({ isExist: false });
    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


module.exports = router;