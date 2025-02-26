import dbClient from "../database/client";
async function createUserTable(client) {
    // Define CQL to create a table
    const dropTable = `DROP TABLE IF EXISTS users;`;
    const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      created_at TIMESTAMP,
      username TEXT,
      email TEXT,
      password TEXT,
      avatar BLOB,
      bio TEXT,
      status TEXT,
      verified BOOLEAN
    );
  `;
    const createEmailIndex = `
    CREATE INDEX IF NOT EXISTS ON users (email);
  `;
    const createUsernameIndex = `
    CREATE INDEX IF NOT EXISTS ON users (username);
  `;
    try {
        // Execute the query
        await client.execute(dropTable);
        await client.execute(createUserTable);
        console.log('Table "users" created successfully!');
        await client.execute(createEmailIndex);
        console.log('Index on "email" created successfully!');
        await client.execute(createUsernameIndex);
        console.log('Index on "username" created successfully!');
    }
    catch (err) {
        console.error('Error creating user table:', err);
        process.exit(1);
    }
}
createUserTable(dbClient);
// make the user a class
export default class User {
    createdAt;
    id;
    username;
    email;
    password;
    avatar;
    bio;
    status;
    verified;
    constructor({ id, createdAt, username, email, password, bio, status, verified, avatar, }) {
        this.id = id;
        this.createdAt = createdAt;
        this.username = username;
        this.email = email;
        this.password = password;
        this.bio = bio;
        this.status = status;
        this.verified = verified;
        this.avatar = avatar;
    }
    static async addUser(user) {
        console.log("adding user: ", user);
        const insertQuery = `
        INSERT INTO users (id, created_at, username, email, password, avatar, bio, status, verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
        try {
            await dbClient.execute(insertQuery, [
                user.id,
                user.createdAt,
                user.username,
                user.email,
                user.password,
                user.avatar,
                user.bio,
                user.status,
                user.verified,
            ], { prepare: true });
            return true;
        }
        catch (e) {
            console.log(e);
            return false;
        }
    }
    static async getUserByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
        try {
            const result = await dbClient.execute(query, [email], { prepare: true });
            if (result.rowLength === 0) {
                throw new Error("no user found");
            }
            const user = new User({
                createdAt: result.first().get('createdAt'),
                id: result.first().get('id').toString(),
                username: result.first().get('username'),
                email: result.first().get('email'),
                password: result.first().get('password'),
                bio: result.first().get('bio'),
                verified: result.first().get('verified'),
                status: result.first().get('status'),
                avatar: result.first().get('avatar'),
            });
            return user;
        }
        catch (e) {
            return null;
        }
    }
    static async getUserByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = ? LIMIT 1';
        try {
            const result = await dbClient.execute(query, [username], { prepare: true });
            if (result.rowLength === 0) {
                return null;
            }
            const user = new User({
                createdAt: result.first().get('createdAt'),
                id: result.first().get('id').toString(),
                username: result.first().get('username'),
                email: result.first().get('email'),
                password: result.first().get('password'),
                bio: result.first().get('bio'),
                verified: result.first().get('verified'),
                status: result.first().get('status'),
                avatar: result.first().get('avatar'),
            });
            return user;
        }
        catch (e) {
            return null;
        }
    }
    static async getUserById(id) {
        const query = 'SELECT * FROM users WHERE id = ? LIMIT 1';
        try {
            const result = await dbClient.execute(query, [id], { prepare: true });
            if (result.rowLength === 0) {
                return null;
            }
            const user = new User({
                createdAt: result.first().get('createdAt'),
                id: result.first().get('id').toString(),
                username: result.first().get('username'),
                email: result.first().get('email'),
                password: result.first().get('password'),
                bio: result.first().get('bio'),
                verified: result.first().get('verified'),
                status: result.first().get('status'),
                avatar: result.first().get('avatar'),
            });
            return user;
        }
        catch (e) {
            console.error(e);
            return null;
        }
    }
    static async verifyUser(id) {
        const query = 'UPDATE users SET verified = true WHERE id = ?';
        try {
            await dbClient.execute(query, [id], { prepare: true });
            return true;
        }
        catch (error) {
            console.error("Error updating user verification status:", error);
            return false;
        }
    }
    static async updateUserStatus(id, status) {
        const query = 'UPDATE users SET status = ? WHERE id = ?';
        try {
            await dbClient.execute(query, [status, id], { prepare: true });
            return true;
        }
        catch (error) {
            console.error("Error updating user status:", error);
            return false;
        }
    }
}
