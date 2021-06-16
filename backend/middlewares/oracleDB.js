const oracledb = require('oracledb');

oracledb.autoCommit = true;

var pool;

initClient();

async function initClient() {
    try {
        //oracledb.initOracleClient({ libDir: '/usr/lib/oracle/19.9/client64/lib', configDir: '/usr/lib/oracle/19.9/client64/lib/network/admin' });
oracledb.initOracleClient({ libDir: 'c://instantclient', configDir: 'c://instantClient/network/admin2' });
        pool = await oracledb.createPool({
            user: "FILEOUSER",
            password: "u$er202!Isb#demo",
            connectString: 'demofileo_low',
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
        console.log(e);
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

