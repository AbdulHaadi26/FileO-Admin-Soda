const express = require('express');
const router = express.Router();

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getSetting
} = require('../schemas/setting');

const nodeMailer = require('nodemailer');
const { logoUrl } = require('../constants');

router.put('/email', async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection database has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const { name, email, message } = req.body;

        const collectionSets = await soda.createCollection('sets');

        let set = await getSetting(collectionSets);

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
            subject: 'From File-O Contact Us Form',
            html: `
            <img src="${logoUrl}" alt="File-O Logo" style="width: 60px; height: 73px; margin-left:50%; margin-top: 30px;"/>
            <h2 style="margin-left: 50%;">File-O</h2>
            <br/>
            <h3 style="font-weight:400;"><b>Name:</b> ${name}</h3>
            <h3 style="font-weight:400;"><b>Email:</b> ${email}</h3>
            <h3 style="font-weight:400;"><b>Message:</b></h3>
            <p>${message}</p>

            <br/>
            Sincerely,
            <br/>File-O Team<br/> <br/>

            <p><b><u>Please note:</u></b> This e-mail was sent from an address that cannot accept incoming e-mail. Please use the appropriate link above if you need to contact us again.</p>
            <p>File-O is an affiliate of CWare Technologies.</p>
            `
        };

        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                console.log(error);
                throw new Error('Email not sent.')
            }

            return res.json({ success: true });
        });

    } catch (e) {
        console.log(e.message);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});




module.exports = router;