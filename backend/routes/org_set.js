const express = require('express');
const router = express.Router();
const JWT = require('../middlewares/jwtAuth');

const {
    getSodaDatabase,
    closeConnection,
    getConnection
} = require('../middlewares/oracleDB');

const {
    getOrgByIdS,
    updateSettingsId,
    findOrganizationByIdUpt
} = require('../schemas/organization');

const {
    createOrgSetting,
    updateValue
} = require('../schemas/org_set');

router.put('/register', JWT, async (req, res) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collectionOrg, collectionOrgSets] = [await soda.createCollection('orgs'), await soda.createCollection('org_sets')];

        let data = { _orgId: req.token.org };
        let setId = await createOrgSetting(data, collectionOrgSets);
        await updateSettingsId(req.token.org, setId, collectionOrg);
        const org = await getOrgByIdS(req.token.org, collectionOrg, collectionOrgSets);
        if (!org) throw new Error('Could not not find organization');

        res.json({ org: org });
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

        const [collectionOrg, collectionOrgSets] = [await soda.createCollection('orgs'), await soda.createCollection('org_sets')];
        const orgS = await findOrganizationByIdUpt(req.token.org, collectionOrg);
        const { field, value } = req.body;

        orgS.settingsId && await updateValue(orgS.settingsId, field, value, collectionOrgSets);
        const org = await getOrgByIdS(req.token.org, collectionOrg, collectionOrgSets);
        if (!org) throw new Error('Could not not find organization');

        res.json({ org: org });
    } catch (e) {
        console.log(e);
        res.json({ error: e.message });
    } finally {
        await closeConnection(connection);
    }
});

module.exports = router;