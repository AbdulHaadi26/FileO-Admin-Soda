const oracledb = require('oracledb');

oracledb.autoCommit = true;

var pool;

initClient();

async function initClient() {
    try {

        //oracledb.initOracleClient({ libDir: '/home/ubuntu/instantclient', configDir: '/home/ubuntu/instantclient/network/admin' });
        oracledb.initOracleClient({ libDir: 'c://instantclient', configDir: 'c://instantClient/network/admin' });
        pool = await oracledb.createPool({
            user: "admin",
            password: "@dmin2020!Isb#",
            connectString: 'fileo_high',
            poolIncrement: 0,
            poolMax: 16,
            poolMin: 4
        });

    } catch (err) {
        console.error(err);
    }
}

async function getConnection() {
    return await pool.getConnection();
}

async function closeConnection(connection) {
    try {
        return await connection.close();
    } catch (e) {
       // console.log(e);
    }
}

async function getSodaDatabase(connection) {
    try {
        return await connection.getSodaDatabase();
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    getSodaDatabase,
    initClient,
    getConnection,
    closeConnection
}

