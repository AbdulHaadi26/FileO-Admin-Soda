const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');
const uuidv4 = require('uuid/v4');
const { putPresignedUrl, deleteObject } = require('../middlewares/oci-sdk');

const {
    createTicket,
    isExist,
    deleteTicket,
    findTicketByIdDel,
    removeAttachment,
    findTicketById,
    getAllTicketCount,
    getAllTicketLimit,
    getAllTicketQueryCount,
    getAllTicketQueryLimit,
    updateTitle,
    addAttachment,
    updateDescription
} = require('../schemas/ticket');

const {
    findOrganizationByIdUpt
} = require('../schemas/organization');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionOrg, collectionTicket] = [await soda.createCollection('orgs'), await soda.createCollection('tickets')];

        const { title, description } = req.body;
        var p1 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        var p2 = isExist(title, req.token.org, collectionTicket);
        var [orgN, ticket] = [await p1, await p2];
        const ticketData = {
            title: title, description: description, org: req.token.org,
            postedby: req.token._id, orgName: orgN.name, bucketName: req.token.bucket,
            resolved: false, created: Date.now(), date: new Date(), progress: 0
        };
        if (!ticket) {
            await createTicket(ticketData, collectionTicket);
            res.status(200).json({ ticket: ticketData });
        } else res.json({ error: 'Ticket with this title already exists' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.put('/registerWithAttachment', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionOrg, collectionTicket] = [await soda.createCollection('orgs'), await soda.createCollection('tickets')];

        const { title, description, fName, mimeType, size } = req.body;
        var dataSize = size / (1024 * 1024 * 1024);
        var p1 = findOrganizationByIdUpt(req.token.org, collectionOrg);
        var p2 = isExist(title, req.token.org, collectionTicket);
        var [orgN, ticket] = [await p1, await p2];
        if (dataSize > 5) return res.json({ error: 'File size exceeds the limit' });
        if (!validateMime(mimeType)) return res.status(500).json({ error: 'Image not supported' });
        const ticketData = {
            title: title, description: description, size: dataSize,
            org: req.token.org, postedby: req.token._id, orgName: orgN.name, url: '', bucketName: req.token.bucket,
            resolved: false, created: Date.now(), date: new Date(), progress: 0
        };
        if (!ticket) {
            const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
            ticketData.url = generateFileName(fileName, req.token.org);
            let key = await createTicket(ticketData, collectionTicket);
            ticketData._id = key;

            const url = await putPresignedUrl(key, ticketData.url, req.token.bucket);
            if (url) res.status(200).json({ ticket: ticketData, url: url });
            else {
                await deleteTicket(key, collectionTicket);
                res.json({ error: 'Failed to upload file to storage.' });
            }
        } else res.json({ error: 'Ticket with this title already exists' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateAttachment', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionTicket = await soda.createCollection('tickets');

        const { _id, fName, mimeType, size } = req.body;
        const ticket = await findTicketByIdDel(_id, collectionTicket);
        if (!ticket) return res.json({ error: 'Ticket not found' });

        var dataSize = size / (1024 * 1024 * 1024);
        if (dataSize > 5) return res.json({ error: 'File size exceeds the limit' });
        if (!validateMime(mimeType)) return res.json({ error: 'Image not supported' });

        const fileName = `${uuidv4()}${fName.toLowerCase().split(' ').join('-')}`;
        const key = generateFileName(fileName, req.token.org);
        const url = await putPresignedUrl(_id, key, req.token.bucket);

        if (url) {
            await addAttachment(_id, key, collectionTicket);
            const tick = await findTicketById(_id, collectionTicket);
            res.status(200).json({ ticket: tick, url: url });
        } else res.json({ error: 'Failed to upload file to storage.' });

    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/removeAttachment', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionTicket = await soda.createCollection('tickets');

        const { _id } = req.body;
        const ticket = await findTicketByIdDel(_id, collectionTicket)
        if (ticket && ticket.url) await deleteObject(ticket.url, req.token.bucket)
        else return res.json({ error: 'Ticket not found' });

        await removeAttachment(_id, collectionTicket);
        const tick = await findTicketById(_id, collectionTicket);
        if (!tick) return res.json({ error: 'Ticket not found' });

        res.json({ ticket: tick })
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

function validateMime(type) {
    return (type === "image/png" || type === "image/jpg" || type === "image/jpeg" || type === 'image/x-png' || type === 'image/gif') ? true : false;
}

function generateFileName(fileName, org) {
    return `FileO/organization/${org}/tickets/${fileName}`;
}

router.get('/getTicketCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionTicket = await soda.createCollection('tickets');

        let count = await getAllTicketCount(req.token.org, collectionTicket);
        return res.json({ ticketCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getTickets', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionTicket = await soda.createCollection('tickets');

        const { limit } = req.query;
        let ticketList = await getAllTicketLimit(limit, req.token.org, collectionTicket);
        return res.json({ tickets: ticketList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchTicketCount', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionTicket = await soda.createCollection('tickets');

        const { string } = req.query;
        let count = await getAllTicketQueryCount(string, req.token.org, collectionTicket);
        return res.json({ ticketCount: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/searchTickets', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionTicket = await soda.createCollection('tickets');

        const { limit, string } = req.query;
        let ticketList = await getAllTicketQueryLimit(limit, string, req.token.org, collectionTicket);
        return res.json({ tickets: ticketList });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getTicket/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionTicket = await soda.createCollection('tickets');

        const { _id } = req.params;
        let ticket = await findTicketById(_id, collectionTicket);
        if (ticket) res.json({ ticket: ticket });
        else res.json({ error: 'Could not find ticket' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateTicket', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionTicket = await soda.createCollection('tickets');

        const { _id, field, value } = req.body;
        switch (field) {
            case 'title': await updateTitle(_id, value, collectionTicket); break;
            case 'description': await updateDescription(_id, value, collectionTicket); break;
        }

        let ticket = await findTicketById(_id, collectionTicket);
        if (ticket) res.json({ ticket: ticket });
        else res.json({ error: 'Could not find ticket' });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/deleteTicket/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionTicket = await soda.createCollection('tickets');

        const { _id } = req.params;
        await deleteTicket(_id, collectionTicket);

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;