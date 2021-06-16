const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');

const {
    getSodaDatabase,
    getConnection,
    closeConnection
} = require('../../../middlewares/oracleDB');

const {
    createUser
} = require('../../../schemas/personal/schemas/user');

const {
    findPackageById,
} = require('../../../schemas/personal/schemas/packages');

const {
    getSetting
} = require('../../../schemas/personal/schemas/setting');

const {
    createBucket,
    deleteBucket
} = require('../../../middlewares/oci-sdk');

const { logoUrl, userUrl } = require('../../../constants');

router.put('/trail', async (req, res) => {

    const {
        name,
        email,
        password,
        code,
        contact,
        country
    } = req.body;

    var mName, connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionUser = await soda.createCollection('users');
        const collectionPkg = await soda.createCollection('pkgs');
        const collectionSets = await soda.createCollection('sets');

        const pkg = await findPackageById('EF860085F8DA4FA0BFF98736C570BE8B', collectionPkg);

        let start_date = new Date(Date.now());

        let end_date = new Date(Date.now());

        end_date.setMonth(end_date.getMonth() + 1);


        let tempEmail = email;
        tempEmail = tempEmail.replace('@', '-');
        mName = tempEmail;

        let bucket = await createBucket(`${tempEmail}`);
        if (!bucket) return new Error('Bucket cannot be created.');

        let userData = {
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
            isTrail: true,
            trail_start_date: start_date,
            trail_end_date: end_date
        };

        userData.password = await bcrypt.hash(password, 10);

        let uKey = await createUser(userData, collectionUser);

        let mydate = new Date();
        let month = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"][mydate.getMonth()];
        let str = mydate.getDate() + '-' + month + '-' + mydate.getFullYear();
        let sql = `INSERT INTO user_billing (orgId, userId, start_date) VALUES ('null', '${uKey}', '${str}')`;
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
            subject: 'Personal Account Registered - Trial',
            html: html
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }

        });

        return res.json({ user: userData });
    } catch (e) {
        console.log(e.message);
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

        let docC = await collectionBilling.find().filter({ type: 'Register User' }).count();
        let count = 1;

        if (docC && docC.count) {
            count = docC.count;
        };

        if (count < 10) {
            count = `0${count}`;
        }

        let randomId = req.body.oname.substring(0, 3) + '-' + count + 'RU';
        randomId = randomId.replace(/\s+/g, '');

        let billing_data = {
            orderId: randomId,
            created: Date.now(),
            date: new Date(Date.now()),
            status: 'Pending',
            type: 'Register User',
            data: req.body,
            price: req.body.price,
            pkgPrice: pkg ? pkg.price : 0,
            difference: 0,
            userPrice: 275
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