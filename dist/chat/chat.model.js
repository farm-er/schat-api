import dbClient from "../database/client";
async function createChatTable(client) {
    const createChatTable = `
    CREATE TABLE IF NOT EXISTS chats (
      id UUID PRIMARY KEY,
      created_at TIMESTAMP,
      user1_id UUID,
      user2_id UUID
    );
  `;
    const createUser1Index = `
    CREATE INDEX IF NOT EXISTS ON chats (user1_id);
  `;
    const createUser2Index = `
    CREATE INDEX IF NOT EXISTS ON chats (user2_id);
  `;
    try {
        // Execute the query
        await client.execute(createChatTable);
        console.log('Table "chats" created successfully!');
        await client.execute(createUser1Index);
        console.log('Index on "user1" created successfully!');
        await client.execute(createUser2Index);
        console.log('Index on "user2" created successfully!');
    }
    catch (err) {
        console.error('Error creating "chats" table:', err);
        process.exit(1);
    }
}
createChatTable(dbClient);
export default class Chat {
    createdAt;
    id;
    user1Id;
    user2Id;
    constructor(id, user1Id, user2Id, createdAt = new Date()) {
        this.createdAt = createdAt;
        this.id = id;
        this.user1Id = user1Id;
        this.user2Id = user2Id;
    }
    async addChat() {
        // TODO: check if the chat already exists
        const insertQuery = `
      INSERT INTO chats (id, created_at, user1Id, user2Id)
      VALUES (?, ?, ?, ?);
    `;
        try {
            await dbClient.execute(insertQuery, [
                this.id,
                this.createdAt,
                this.user1Id,
                this.user2Id
            ], { prepare: true });
            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }
    static async getUserChats(userId) {
        const query = 'SELECT * FROM chats WHERE user1_id=? OR user2_id=?';
        try {
            const result = await dbClient.execute(query, [
                userId,
                userId
            ]);
            const chats = [];
            result.rows.forEach(row => {
                chats.push(new Chat(row.id, row.user1_id, row.user2_id, row.created_at));
            });
            return chats;
        }
        catch (e) {
            console.error("Error fetching chats:", e);
            return [];
        }
    }
    async checkExistingChat() {
        const query = "SELECT * FROM chats WHERE user1Id=? and user2Id=? LIMIT 1;";
        try {
            const [res1, res2] = await Promise.allSettled([dbClient.execute(query, [this.user1Id, this.user2Id]), dbClient.execute(query, [this.user2Id, this.user1Id])]);
            console.log(res1.status);
            console.log(res2.status);
            return false;
        }
        catch (e) {
            console.log("error finding the checking chats: ", e);
            return false;
        }
    }
}
