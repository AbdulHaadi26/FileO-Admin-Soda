const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    createPlans,
    getAllPlanCount,
    getAllPlanLimit,
    getAllPlanQueryCount,
    getAllPlanQueryLimit,
    getPlanById,
    updatePlan,
    deletePlan,
    updatePlanList,
    findPlanByName,
    updatePlanDetails
} = require('../schemas/plans');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPlan = await soda.createCollection('plans');

        const {
            name, org, _id, date
        } = req.body;

        let pL = await findPlanByName(name, org, _id, collectionPlan);

        if (pL) throw new Error('Plan with this name already exists');

        let data = {
            name, org, postedby: _id, started: date,
            time_due: new Date(date),
            day1: [], day2: [], date: new Date(Date.now()),
            day3: [], day4: [], day5: [], day6: [],
            day7: [], created: Date.now()
        };

        let key = await createPlans(data, collectionPlan);

        res.json({ key });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchPlans', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPlan = await soda.createCollection('plans');

        const { _id } = req.token;
        
        const { limit, type, due } = req.query;

        let plans = await getAllPlanLimit(_id, limit, type, due, collectionPlan);
        let count = await getAllPlanCount(_id, type, due, collectionPlan);

        res.json({ planList: plans, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/fetchPlansSearch', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPlan = await soda.createCollection('plans');

        const { _id } = req.token;
        const { limit, string, type, due } = req.query;
        
        let plans = await getAllPlanQueryLimit(_id, limit, string, type, due, collectionPlan);
        let count = await getAllPlanQueryCount(_id, string, type, due, collectionPlan);

        res.json({ planList: plans, count: count });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.get('/getPlan/:_id', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPlan = await soda.createCollection('plans');

        const { _id } = req.params;

        let plan = await getPlanById(_id, collectionPlan);
        if (!plan) throw new Error('Plan not found');

        res.json({ plan: plan });
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

        const collectionPlan = await soda.createCollection('plans');

        const { _id, type, num, value } = req.body;

        let plan = await updatePlan(_id, type, num, value, collectionPlan);
        if (!plan) throw new Error('Plan not found');

        res.json({ plan: plan });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});


router.post('/updateDetails', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPlan = await soda.createCollection('plans');

        const { _id, name, date } = req.body;

        let pL = await getPlanById(_id, collectionPlan);

        if (!pL) throw new Error('Plan not found');

        let isTrue;

        if (pL.name !== name) isTrue = await findPlanByName(name, req.token.org, req.token._id, collectionPlan);

        if (isTrue) throw new Error('Plan with this name already exists');

        let plan = await updatePlanDetails(_id, name, date, isTrue, collectionPlan);

        if (!plan) throw new Error('Plan details not updated');

        res.json({ plan: plan });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

router.post('/updateList', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const collectionPlan = await soda.createCollection('plans');

        const { _id, type, num1, num2, value1, value2 } = req.body;

        if (type === 4) await updatePlanList(_id, num1, num2, value1, value2, collectionPlan);
        else await updatePlan(_id, 3, num1, value1, collectionPlan);

        res.json({ success: true });
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

        const collectionPlan = await soda.createCollection('plans');

        const { _id } = req.params;

        await deletePlan(_id, collectionPlan);

        res.json({ success: true });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;