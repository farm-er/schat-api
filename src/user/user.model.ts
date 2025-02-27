


import { Client } from "cassandra-driver";

import dbClient from "../database/client";
import mediaStorage from "../media_storage/media_storage";
import imageType from "image-type";


// we separated the storage of avatars for simplicity
// now clas mediaStorage will take care of all the media

export async function createUserTable( client: Client) {

  const createUserTable = `
    CREATE TABLE IF NOT EXISTS users (
      id UUID,
      created_at TIMESTAMP,
      username TEXT,
      email TEXT,
      password TEXT,
      bio TEXT,
      status TEXT,
      verified BOOLEAN,
      chats set<UUID>,
      PRIMARY KEY (id)
    );
  `;

  const createEmailIndex = `
    CREATE INDEX IF NOT EXISTS ON users (email);
  `

  const createUsernameIndex = `
    CREATE CUSTOM INDEX IF NOT EXISTS ON users (username) USING 'org.apache.cassandra.index.sasi.SASIIndex'
      WITH OPTIONS = {
      'analyzer_class':
      'org.apache.cassandra.index.sasi.analyzer.NonTokenizingAnalyzer',
      'case_sensitive': 'false'
    };
  `
 
  try {

    await client.execute(createUserTable);
    console.log('Table "users" created successfully!');

    await client.execute(createEmailIndex);
    console.log('Index on "email" created successfully!');

    await client.execute(createUsernameIndex);
    console.log('Index on "username" created successfully!');

  } catch (err) {
    console.error('Error creating user table:', err);
    throw err
  }
}

interface searchUser {
  username :string;
  id :string;
}

export default class User {
  
  createdAt: Date;
  id: string;
  username: string;
  email: string;
  password: string;
  avatar: Buffer | undefined;
  bio: string;
  status: string;
  verified: boolean;
  chats: string[];

  constructor({
    id,
    createdAt,
    username,
    email,
    password,
    bio,
    status,
    verified,
    avatar,
    chats
  }: {
    id: string;
    createdAt: Date;
    username: string;
    email: string;
    password: string;
    bio: string;
    status: string;
    verified: boolean;
    avatar?: Buffer;
    chats?: string[]
  }) {
    this.id = id;
    this.createdAt = createdAt;
    this.username = username;
    this.email = email;
    this.password = password;
    this.bio = bio;
    this.status = status;
    this.verified = verified;
    this.avatar = avatar;
    this.chats = chats || []
  }


  static async searchUserByUsername( username: string) : Promise<searchUser[] | null> {

    const query = 'SELECT * FROM users WHERE username LIKE ?';
  
    const result = await dbClient.execute(query, [`${username}%`], { prepare: true });

    if (result.rowLength === 0) {
      return null
    }

    const searchUsers: searchUser[] = result.rows.map(row => ({
      username: row.username,
      id: row.id
    }));

    return searchUsers

  }

  static async addChat( userId: string, chatId: string) {

    const addChat = `
      UPDATE users SET chats = chats + ? 
      WHERE id = ?
    `

    await dbClient.execute( addChat, [
      [chatId],
      userId
    ], { prepare: true })

  } 

  static async addUser( user: User) {

    const insertQuery = `
        INSERT INTO users (id, created_at, username, email, password, bio, status, verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `;

    await dbClient.execute(insertQuery, [
      user.id,
      user.createdAt,
      user.username,
      user.email,
      user.password,
      user.bio,
      user.status,
      user.verified,
    ], { prepare: true });

    if ( user.avatar) {
      const type = await imageType( user.avatar)
      if(!type) throw new Error( "invalid avatar")
      await mediaStorage.storeAvatar( user.avatar, user.id, type?.ext);
    }
  
  }

  static async getUserByEmail( email : string) : Promise< User | null> {

    const query = 'SELECT * FROM users WHERE email = ? LIMIT 1';
  
    const result = await dbClient.execute(query, [email], { prepare: true });

    if (result.rowLength === 0) {
      return null
    }

    const user: User = new User({
      createdAt: result.first().get('createdAt'),
      id: result.first().get('id').toString(),
      username: result.first().get('username'),
      email: result.first().get('email'),
      password: result.first().get('password'),
      bio: result.first().get('bio'),
      verified: result.first().get('verified'),
      status: result.first().get('status'),
    })
    return user

  }

  static async  getUserByUsername( username : string) : Promise<User | null> {

    const query = 'SELECT * FROM users WHERE username = ? LIMIT 1';
  
  
    const result = await dbClient.execute(query, [username], { prepare: true });

    if (result.rowLength === 0) {
        return null; 
    }

    const user: User = new User({
      createdAt: result.first().get('createdAt'),
      id: result.first().get('id').toString(),
      username: result.first().get('username'),
      email: result.first().get('email'),
      password: result.first().get('password'),
      bio: result.first().get('bio'),
      verified: result.first().get('verified'),
      status: result.first().get('status'),
    })
    return user

  }

  static async getUserById( id : string) : Promise<User | null> {

    const query = 'SELECT * FROM users WHERE id = ? LIMIT 1';
  
    const result = await dbClient.execute(query, [id], { prepare: true });

    if (result.rowLength === 0) {
        return null; 
    }

    const user: User = new User({
      createdAt: result.first().get('createdAt'),
      id: result.first().get('id').toString(),
      username: result.first().get('username'),
      email: result.first().get('email'),
      password: result.first().get('password'),
      bio: result.first().get('bio'),
      verified: result.first().get('verified'),
      status: result.first().get('status'),
      chats: result.first().get('chats')
    })
    return user

  }
  
  static async getUsername( id: string): Promise<string> {

    const query = 'SELECT username FROM users WHERE id = ? LIMIT 1';
  
    const result = await dbClient.execute(query, [id], { prepare: true });

    return result.first().get('username')

  }  

  static async updateUserStatus( id: string, status: string) {
 
    const query = 'UPDATE users SET status = ? WHERE id = ?';
  
    await dbClient.execute(query, [ status, id], { prepare: true });
 
  }

  static async updateUsername( id: string, username: string) {

    const query = 'UPDATE users SET username = ? WHERE id = ?';

    await dbClient.execute(query, [ username, id], { prepare: true });
  
  }

  static async deleteUser( id: string): Promise<void> {

    const query = 'DELETE FROM users WHERE id = ?';
  
    await dbClient.execute(query, [id], { prepare: true });

  }
  
  static async verifyUser( id: string) {
    const query = 'UPDATE users SET verified = true WHERE id = ?';
  
    try {
      await dbClient.execute(query, [id], { prepare: true });
    } catch (e) {
      throw e
    }
  }
}
