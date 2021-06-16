const jwt = require('jsonwebtoken');
const { getSodaDatabase, closeConnection, getConnection } = require('./oracleDB');

//Middleware to verify the jwt token
const jwtAuth = async (req, res, next) => {
    var connection;
    try {
        connection = await getConnection();
        if (!connection) throw new Error('Connection has not been intialized yet.');
        const soda = await getSodaDatabase(connection);
        if (!soda) throw new Error('Soda database has not been intialized yet.');

        const [collection, collectionBL] = [await soda.createCollection('sessions'), await soda.createCollection('black_list')];

        const token = req.headers['authorization'];
        const data = jwt.verify(token, process.env.SECRET);
        if (!data) {
            await collection.find().filter({ token: token }).remove();
            return res.status(401).json({ error: 'Token is not valid' });
        }

        let date = new Date();
        let [doc, isExist] = [await collection.find().filter({ token: token, last_updated: { $gte: date } }).getDocuments(), await collectionBL.find().fetchArraySize(0).filter({ token: token, expiry: { $gte: date } }).getOne()];

        if (isExist) {
            await collection.find().filter({ token: token }).remove();
            return res.status(401).json({ error: 'Token is black listed' });
        }

        if (doc && doc.length > 0) await Promise.all(doc.map(async document => {
            let tempDoc = document.getContent();
            let dateNew = new Date(Date.now());
            dateNew = dateNew.addHours(0.5);
            tempDoc.last_updated = dateNew;
            await collection.find().fetchArraySize(0).key(document.key).replaceOne(tempDoc);
        }));
        else {
            return res.status(401).json({ error: 'Idle for more than 15 mins' });
        }

        req.token = data;
        next();
    } catch {
        res.status(401).json({ error: 'Token is not valid' });
    } finally {
        await closeConnection(connection);
    }

};

Date.prototype.addHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
}

module.exports = jwtAuth;