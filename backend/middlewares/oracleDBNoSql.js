const NoSQLClient = require('oracle-nosqldb').NoSQLClient;
const Region = require('oracle-nosqldb').Region;


function initClient() {
    let client = new NoSQLClient({
        region: Region.EU_FRANKFURT_1,
        auth: {
            iam: {
                configFile: './config',
                profileName: 'DEFAULT'
            }
        }
    });
    return client;
}

getRowsFromUsersTable();

async function getRowsFromUsersTable() {
    let client = initClient();
    const tableName = 'post_comments';
    try {
        let result = await client.query(
            'SELECT * FROM post_comments');

        console.log(result);
        for (let row of result.rows) {
            console.log(row);
        }
    } catch (error) {
        console.log(error)
    }
} 