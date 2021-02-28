const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT = require('../middlewares/jwtAuth');
const Random = require('randomstring');
const nodeMailer = require('nodemailer');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getSetting
} = require('../schemas/setting');

const {
    TextExists,
    UpdateText,
    CompareText,
    InsertText,
} = require('../schemas/verification');

const {
    updateVerified,
    getProfile,
    updatePasswordByEmail,
    findUserByName
} = require('../schemas/user');

router.post('/sendMail', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionVer, collectionSets] = [
            await soda.createCollection('vers'),
            await soda.createCollection('sets'),
        ];

        const { userId, email } = req.body;

        var p1 = getSetting(collectionSets);
        var p2 = TextExists(userId, collectionVer);
        var [set, ver] = [await p1, await p2];

        var transporter = nodeMailer.createTransport({
            service: set.service,
            auth: {
                user: set.email,
                pass: set.pass
            }
        });

        var code = Random.generate(6);

        var mailOptions = {
            from: set.email,
            to: email,
            subject: 'File-O Email Verification Code',
            html: `
            <img src="https://demo1.file-o.com/public/static/logo.png" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3>Hello,</h3>

            <p>File-O needs to verify the email address before you can start using File-O application. <br/> To verify your email address, enter the below code to activate your File-O account: </p> 
            <br/>

            <b>${code}</b>
            
            <br/>

            <br/>
            <p>This code expires in 24 hours after the original verification request. <br/> Thank you for using File-O. Questions or concerns? Contact <a href="https://www.file-o.com/support" rel="noopener noreferrer" target="_blank">File-O Support<a/>.</p>
            
            Sincerely,
            <br/>File-O Team<br/>

            <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
            <p>File-O is an affiliate of CWare Technologies.</p>
            `,
        };

        if (ver) await UpdateText(userId, code, collectionVer);
        else {
            let date = new Date(Date.now());
            date = date.addHours(24);
            let data = { userId: userId, text: code, created: Date.now(), date: new Date(), expiry: date };
            await InsertText(data, collectionVer);
        }

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                throw new Error('Email not sent.')
            }

            return res.json({ success: true });
        });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

router.post('/sendPassMail', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionSets, collectionUser] = [await soda.createCollection('sets'), await soda.createCollection('users')];

        const { email } = req.body;

        let name = await findUserByName(email, collectionUser);
        if (!name) throw new Error('User does not exist');

        let set = await getSetting(collectionSets);

        let transporter = nodeMailer.createTransport({
            service: set.service,
            auth: {
                user: set.email,
                pass: set.pass
            }
        });

        let token = jwt.sign({ email: email }, process.env.SECRET, { expiresIn: '60m' });

        var mailOptions = {
            from: set.email,
            to: email,
            subject: 'File-O Reset Password',
            html: `
            <img src="https://demo1.file-o.com/public/static/logo.png" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3 style="font-weight:400;">Dear <b>${name}</b>,</h3>
            
            <p>Did you forget your password?</p>
            <br/>
            
            <a style="text-decoration: none; background-color:#2d3436; margin-right:12px; color: white; padding:12px 24px;" rel="noopener noreferrer" target="_blank" href="https://demo1reset.file-o.com/reset/password/${token}">Reset Password</a>This link will expire in 1 hour and can be used only once.

            <br/><br/>
            <p>If you don't want to change your password or didn't request this, please ignore and delete this message.</p> <br/>
            Sincerely,
            <br/>File-O Team<br/> <br/>

            <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
            <p>File-O is an affiliate of CWare Technologies.</p>
            `
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                throw new Error('Email not sent.')
            }

            return res.json({ success: true });
        });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
       await closeConnection(connection);
    }
});


router.post('/verifyUser', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { userId, text } = req.body;

        const [collectionVer, collectionUser, collectionOrg, collectionRole, collectionCat] = [
            await soda.createCollection('vers'),
            await soda.createCollection('users'),
            await soda.createCollection('orgs'),
            await soda.createCollection('roles'),
            await soda.createCollection('cats'),
        ];

        var compare = await CompareText(userId, text, collectionVer);
        if (!compare) throw new Error('Provided verification text is incorrect.');
        await updateVerified(userId, true, collectionUser);
        var user = await getProfile(userId, collectionUser, collectionOrg, collectionRole, collectionCat);
        if (!user) throw new Error('User profile not found');

        res.json({ user: user });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/reset/password/:token', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { password } = req.body;

        const data = jwt.verify(req.params.token, process.env.SECRET);
        if (!data) return res.status(401).json({ error: 'Token is not valid' });

        const { email } = data;

        const [collectionSets, collectionUser] = [await soda.createCollection('sets'), await soda.createCollection('users')];

        let set = await getSetting(collectionSets);

        let name = await findUserByName(email, collectionUser);
        if (!name) throw new Error('User does not exist');


        let transporter = nodeMailer.createTransport({
            service: set.service,
            auth: {
                user: set.email,
                pass: set.pass
            }
        });

        var mailOptions = {
            from: set.email,
            to: email,
            subject: 'File-O Reset Password',
            html: `
            <img src="https://demo1.file-o.com/public/static/logo.png" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>

            <h3 style="font-weight:400;">Dear <b>${name}</b>,</h3>

            <br/>
            
            <p>Your password has been updated successfully.</p>
            <p>If you don't recognize this message, please contact your File-O administrator.</p>

            <br/>
            Sincerely,
            <br/>File-O Team<br/> <br/>

            <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
            <p>File-O is an affiliate of CWare Technologies.</p>
            `
        };

        await updatePasswordByEmail(email, password, collectionUser);

        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                console.log(error);
                throw new Error('Email not sent.')
            }

            return res.json({ success: true });
        });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;