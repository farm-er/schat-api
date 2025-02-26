import { Client } from 'cassandra-driver';
const dbClient = new Client({
    contactPoints: ['cassandra'],
    localDataCenter: 'datacenter1',
    protocolOptions: { port: 9042 },
    socketOptions: { readTimeout: 60000 },
    queryOptions: { consistency: 1 },
});
async function createKeyspace() {
    try {
        await dbClient.connect();
        // Check and create the keyspace if it doesn't exist
        const keyspaceQuery = `
            CREATE KEYSPACE IF NOT EXISTS schat
            WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};
        `;
        console.log('Ensuring keyspace exists...');
        await dbClient.execute(keyspaceQuery);
        console.log('Keyspace "schat" is ready.');
        // Reinitialize client with the keyspace
        dbClient.keyspace = 'schat';
    }
    catch (err) {
        console.error('Error initializing Cassandra:', err);
        throw err;
    }
}
await createKeyspace().catch(e => {
    console.log("error creating the keyspace");
});
export default dbClient;
