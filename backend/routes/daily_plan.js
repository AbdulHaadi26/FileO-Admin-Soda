const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    findDPlanByName,
    createDPlan,
    deleteDPlan,
    getAllDPlanLimit,
    updateDPlan,
    getAllDPlanLimitAll
} = require('../schemas/dailyPlan');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionP = await soda.createCollection('daily_plans');

        const { date, name } = req.body;

        let plan = await findDPlanByName(req.token._id, date, collectionP);
        if (!plan) {

            const respData = {
                name: name, date, postedby: req.token._id, created: Date.now(), time_due: new Date(date)
            };
            let data = await createDPlan(respData, collectionP);
            res.json({ plan: data });
        }
        else throw new Error('Plan on this date already exists');
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

        const collectionP = await soda.createCollection('daily_plans');

        const { _id, name } = req.body;

        let plan = await updateDPlan(_id, name, collectionP);
        if (plan) {
            res.json({ plan: plan });
        } else throw new Error('Plan could not be updated.');
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/plan', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionP = await soda.createCollection('daily_plans');

        let plan = await getAllDPlanLimit(req.token_id, req.query.date, collectionP);
        res.json({ plan: plan });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.get('/Allplan', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionP = await soda.createCollection('daily_plans');

        let plan = await getAllDPlanLimitAll(req.token._id, Number(req.query.month), Number(req.query.year), collectionP);
        res.json({ plans: plan });
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

        const collectionP = await soda.createCollection('daily_plans');

        await deleteDPlan(req.params._id, collectionP);

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;