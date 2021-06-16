const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getAllPollLimit,
    createPolls,
    findPollByName,
    deletePoll,
    updatePollDetails,
    getPollById,
    updatePoll
} = require('../schemas/polls');


router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPolls = await soda.createCollection('polls');

        const {
            name, description, end_date, questions
        } = req.body;

        let pL = await findPollByName(name, req.token.org, collectionPolls);

        if (pL) throw new Error('Poll with this name already exists');

        let data = {
            name, org: req.token.org, postedby: req.token._id, end_date, description,
            due_date: new Date(end_date), questions, date: new Date(Date.now()),
            created: Date.now()
        };

        let key = await createPolls(data, collectionPolls);

        if (!key) throw new Error('Poll could not be created');

        data._id = key;
        res.json({ poll: data });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchPolls', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPoll = await soda.createCollection('polls');

        const { string, auth } = req.query;

        let polls = await getAllPollLimit(req.token.org, auth, string, req.token._id, collectionPoll);

        res.json({ polls });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/submitPoll', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPoll = await soda.createCollection('polls');

        const { _id, questions } = req.body;

        let poll = await updatePollDetails(_id, questions, req.token._id, collectionPoll);
        if (!poll) throw new Error('Poll not found');

        res.json({ poll: poll });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getPoll/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPoll = await soda.createCollection('polls');

        const { _id } = req.params;

        let poll = await getPollById(_id, collectionPoll);
        if (!poll) throw new Error('Poll not found');

        res.json({ poll: poll });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/update', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPoll = await soda.createCollection('polls');

        const { _id, questions, name, description, date } = req.body;

        let tempPoll = await getPollById(_id, collectionPoll);

        if (!tempPoll) throw new Error('Poll not found');

        let shouldUpdate = false;

        if (tempPoll.name !== name) {
            shouldUpdate = await findPollByName(name, req.token.org, collectionPoll);
        };


        let poll;

        if (!shouldUpdate)
            poll = await updatePoll(_id, name, description, date, questions, collectionPoll);

        if (!poll) throw new Error('Poll could not be updated');

        res.json({ poll: poll });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.delete('/delete/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPoll = await soda.createCollection('polls');

        const { _id } = req.params;

        await deletePoll(_id, collectionPoll);

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;