let cron = require('node-cron');
const Axios = require('axios');
const bcrypt = require('bcryptjs');
const nodeMailer = require('nodemailer');

const { userUrl, logoUrl } = require('../constants');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    createOrganization,
    updateOrganizationPackage,
    updateCountOrg,
    updateValue
} = require('../schemas/organization');

const {
    createUser
} = require('../schemas/user');

const {
    findPackageById,
} = require('../schemas/packages');

const {
    getSetting
} = require('../schemas/setting');

const {
    createBucket,
} = require('../middlewares/oci-sdk');



//Monthly Bills
cron.schedule('1 30 7 * * *', async () => {

    const today = new Date(Date.now());
    const tomorrow = new Date(Date.now());
    tomorrow.setDate(tomorrow.getDate() + 1);

    //12 30 PM by my pc.

    if (today.getDate() === 1) {
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
            }
        } catch (e) {
            console.log(e);
        } finally {
            await closeConnection(connection);
        }
    }

    if (today.getDate() === 10) {
        console.log('Running on the 10th of each month');
    }

    if (today.getMonth() !== tomorrow.getMonth()) {
        console.log('Running on the last day.')
    }
});


//Monthly bills personal
cron.schedule('2 30 7 * * *', async () => {

    const today = new Date(Date.now());
    const tomorrow = new Date(Date.now());
    tomorrow.setDate(tomorrow.getDate() + 1);

    //12 30 PM by my pc.

    if (today.getDate() === 1) {
        var connection;
        try {
            connection = await getConnection();
            if (!connection) throw new Error('Connection has not been intialized yet.');
            const soda = await getSodaDatabase(connection);
            if (!soda) throw new Error('Soda database has not been intialized yet.');

            const collectionUsers = await soda.createCollection('users');
            const collectionBilling = await soda.createCollection('billing_ep');
            const collectionPackage = await soda.createCollection('pkgs');
            const collectionDowngrade = await soda.createCollection('downgrade_str_bills');

            let doc = await collectionUsers.find().filter({ flag: 'P' }).getDocuments();

            if (doc) {
                await Promise.all(doc.map(async item => {
                    let user = item.getContent();
                    user._id = item.key;

                    let price = 0;

                    let pkg = await findPackageById(user.active_plan, collectionPackage);

                    price = pkg ? pkg.price : 0;

                    price = price + 275;

                    var date = new Date(Date.now()), y = date.getFullYear(), m = date.getMonth();
                    var firstDay = new Date(y, m, 1);
                    var lastDay = new Date(y, m + 1, 0);


                    let diffDocsM = await collectionDowngrade.find().filter({ userId: user._id, date: { $lte: lastDay, $gte: firstDay } }).getDocuments();

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


                    let docC = await collectionBilling.find().filter({ type: 'Monthly Billing Personal' }).count();
                    let count = 1;

                    if (docC && docC.count) {
                        count = docC.count;
                    };

                    if (count < 10) {
                        count = `0${count}`;
                    }

                    let randomId = user.name.substring(0, 3) + '-' + count + 'MP';
                    randomId = randomId.replace(/\s+/g, '');

                    let billing_data = {
                        orderId: randomId,
                        orgId: item.key,
                        created: Date.now(),
                        date: new Date(Date.now()),
                        status: 'Unpaid',
                        type: 'Monthly Billing Personal',
                        data: {
                            pkgId: pkg && pkg._id ? pkg._id : '',
                            count: 1
                        },
                        price: price,
                        pkgPrice: pkg ? pkg.price : 0,
                        difference: (differenceM),
                        userPrice: 275

                    };

                    await collectionBilling.insertOneAndGet(billing_data);
                }));
            }
        } catch (e) {
            console.log(e);
        } finally {
            await closeConnection(connection);
        }
    }

    if (today.getDate() === 10) {
        console.log('Running on the 10th of each month');
    }

    if (today.getMonth() !== tomorrow.getMonth()) {
        console.log('Running on the last day.')
    }
});


//Disable Organization Accounts
cron.schedule('3 30 7 * * *', async () => {

    const today = new Date(Date.now());
    const tomorrow = new Date(Date.now());
    tomorrow.setDate(tomorrow.getDate() + 1);

    //12 30 PM by my pc.

    if (today.getDate() === 30) {
        var connection;
        try {
            connection = await getConnection();
            if (!connection) throw new Error('Connection has not been intialized yet.');
            const soda = await getSodaDatabase(connection);
            if (!soda) throw new Error('Soda database has not been intialized yet.');

            const collectionOrgs = await soda.createCollection('orgs');
            const collectionBilling = await soda.createCollection('billing_ep');

            let doc = await collectionOrgs.find().filter({ isTrail: { $ne: true } }).getDocuments();

            if (doc) {
                await Promise.all(doc.map(async item => {
                    let org = item.getContent();
                    org._id = item.key;

                    let billCount = await collectionBilling.find().filter({ orgId: org._id, status: 'Unpaid', date: { $lte: new Date(Date.now()) } }).count();
                    if (billCount && billCount.count) {
                        await updateValue(org._id, 'active', false, collectionOrgs)
                    }
                }));
            }
        } catch (e) {
            console.log(e);
        } finally {
            await closeConnection(connection);
        }
    }

});


//Check easy paisa transactions status
cron.schedule('0 */5 * * * *', async () => {
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

        let doc = await collectionBilling.find().filter({
            status: {
                $in: [
                    'Pending',
                    'Unpaid'
                ]
            }
        }).getDocuments();


        if (doc) {
            await Promise.all(doc.map(async ord => {
                let url = `https://easypay.easypaisa.com.pk/easypay-service/rest/v1/order-status/${ord.getContent().orderId}`;

                let response = await Axios.get(url);

                if (response && response.data) {
                    const { transaction_status, order_id } = response.data;

                    if (!transaction_status || transaction_status !== 'PAID') {
                        if (transaction_status === 'FAILED') {
                            let document = await collectionBilling.find().fetchArraySize(0).filter({ orderId: order_id }).getOne();
                            if (document) {

                                let bDataTemp = document.getContent();
                                bDataTemp.status = 'Failed';
                                bDataTemp.paid_on = new Date(Date.now());

                                return await collectionBilling.find().fetchArraySize(0).key(document.key).replaceOne(bDataTemp);
                            }
                        }
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

                                        let pkg = await findPackageById(package, collectionPkg);

                                        var orgData = {
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

                                    if (package) {

                                        await updateOrganizationPackage(billing_data.orgId, pkgId, package.size, collectionOrg);

                                        bData = billing_data;

                                        bData.status = 'Paid';
                                        bData.paid_on = new Date(Date.now());

                                        await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);
                                    }

                                    break;


                                case 'Trial':
                                    var { pkgId } = billing_data.data;

                                    var package = await findPackageById(pkgId, collectionPkg);

                                    if (package) {



                                        await updateOrganizationPackage(billing_data.orgId, pkgId, package.size, collectionOrg);

                                        bData = billing_data;

                                        bData.status = 'Paid';
                                        bData.paid_on = new Date(Date.now());

                                        await collectionBilling.find().fetchArraySize(0).key(doc.key).replaceOne(bData);
                                    }

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

                        }
                    }
                }
            }));
        }
    } catch (e) {
        console.log(e);
    } finally {
        await closeConnection(connection);
    }
});